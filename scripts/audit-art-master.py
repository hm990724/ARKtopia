"""Create a conservative image reference and duplicate review package.

Read-only with respect to source artwork. Outputs CSV + HTML + JSON under docs.
Requires Pillow. Similarity candidates and exact duplicates are never deleted.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import csv
import hashlib
import html
import io
import json
import re
import base64

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
DOCS = ROOT / "docs"
OUT = DOCS / "art-review"
OUT.mkdir(parents=True, exist_ok=True)
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
CODE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".html"}
MANUAL_D_CANDIDATES = {
    "public/assets/animals/m00_normal.png": "Contact-sheet review: smoother, illustration-like shading than the other animal sprites; possible pixel-density/style mismatch. Preserve until a true replacement is generated and approved.",
    "public/assets/animals/fox_mutant.png": "Contact-sheet review: medical cross and rabbit marker conflict with the fox quartermaster identity. Preserve until a role-correct replacement is generated and approved.",
    "public/assets/animals/lynx_mutant.png": "Contact-sheet review: lynx sensory/radar mutation is not clearly readable at contact-sheet scale. Inspect full size before replacement.",
    "public/assets/animals/crow_mutant.png": "Contact-sheet review: composer/resonance identity is less immediately legible than other role-driven concepts. Inspect full size before replacement.",
}

code_files = []
for folder in (ROOT / "src", ROOT / "public"):
    if folder.exists():
        code_files.extend(p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in CODE_EXTS)
code_text = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in code_files)

rows = []
hash_groups = {}
for path in sorted(p for p in ASSETS.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTS):
    rel = path.relative_to(ROOT).as_posix()
    raw = path.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    with Image.open(path) as im:
        im.load()
        alpha = im.getchannel("A") if "A" in im.getbands() else None
        thumb = im.convert("L").resize((9, 8))
        values = list(thumb.get_flattened_data())
        dhash = "".join("1" if values[y * 9 + x] > values[y * 9 + x + 1] else "0" for y in range(8) for x in range(8))
        transparent = bool(alpha and alpha.getextrema()[0] < 255)
        alpha_bounds = alpha.getbbox() if alpha else None
        width, height, mode = im.width, im.height, im.mode
    # Direct filename references are reliable. Species/stem matches are only
    # surfaced as possible dynamic references, never treated as confirmed use.
    direct = bool(re.search(re.escape(path.name), code_text, re.IGNORECASE))
    stem = path.stem
    stem_hits = len(re.findall(re.escape(stem), code_text, re.IGNORECASE))
    dynamic = not direct and stem_hits > 0
    row = {
        "path": rel,
        "preview": "../../" + rel,
        "filename": path.name,
        "width": width,
        "height": height,
        "mode": mode,
        "transparent": transparent,
        "alphaBounds": "x".join(map(str, alpha_bounds)) if alpha_bounds else "",
        "bytes": len(raw),
        "sha256": sha,
        "dhash": hex(int(dhash, 2)),
        "directReferences": direct,
        "possibleDynamicReference": dynamic,
        "stemOccurrences": stem_hits,
        "status": "",
        "manualReviewNote": MANUAL_D_CANDIDATES.get(rel, ""),
        "recommendedAction": "",
    }
    rows.append(row)
    hash_groups.setdefault(sha, []).append(rel)

exact_sets = [paths for paths in hash_groups.values() if len(paths) > 1]
dup_paths = {path for group in exact_sets for path in group}
similar_pairs = []
for i, a in enumerate(rows):
    for b in rows[i + 1:]:
        if a["sha256"] == b["sha256"]:
            continue
        distance = (int(a["dhash"], 16) ^ int(b["dhash"], 16)).bit_count()
        if distance <= 4:
            similar_pairs.append({"a": a["path"], "b": b["path"], "distance": distance})

# v77 route SVGs contain inline image payloads. Audit these separately so the
# same portrait embedded in many wrappers is visible as a real duplicate.
embedded_rows = []
embedded_groups = {}
font_path = Path("C:/Windows/Fonts/arial.ttf")
font = ImageFont.truetype(str(font_path), 12) if font_path.exists() else ImageFont.load_default()
for svg in sorted((ASSETS / "endings").glob("*_v77.svg")):
    source = svg.read_text(encoding="utf-8", errors="ignore")
    for index, match in enumerate(re.finditer(r'data:image/([^;]+);base64,([^\"]+)', source), 1):
        mime = match.group(1)
        payload = base64.b64decode(match.group(2))
        digest = hashlib.sha256(payload).hexdigest()
        with Image.open(io.BytesIO(payload)) as im:
            im.load()
            preview = im.convert("RGB")
            preview.thumbnail((230, 170), Image.Resampling.LANCZOS)
            width, height = im.size
        item = {
            "container": svg.relative_to(ROOT).as_posix(),
            "index": index,
            "mime": mime,
            "width": width,
            "height": height,
            "bytes": len(payload),
            "sha256": digest,
        }
        item["_preview"] = preview.copy()
        embedded_rows.append(item)
        embedded_groups.setdefault(digest, []).append(f'{item["container"]}#image-{index}')

if embedded_rows:
    columns, cell = 4, (250, 210)
    sheet = Image.new("RGB", (columns * cell[0], ((len(embedded_rows) + columns - 1) // columns) * cell[1]), "#17151b")
    draw = ImageDraw.Draw(sheet)
    for i, item in enumerate(embedded_rows):
        x, y = (i % columns) * cell[0], (i // columns) * cell[1]
        label = f'{Path(item["container"]).name} #{item["index"]} · {item["bytes"] // 1024} KB · {item["sha256"][:10]}'
        draw.text((x + 4, y + 3), label, font=font, fill="#eee")
        preview = item["_preview"]
        sheet.paste(preview, (x + (cell[0] - preview.width) // 2, y + 28))
    sheet.save(OUT / "ending-v77-embedded-contact.png")
    for item in embedded_rows:
        item.pop("_preview")

similar_paths = {path for pair in similar_pairs for path in (pair["a"], pair["b"])}
for row in rows:
    if row["path"] in MANUAL_D_CANDIDATES:
        row["status"] = "D"
        row["recommendedAction"] = "Manual visual replacement candidate only; preserve active asset until a conforming image is generated, checked, and approved."
    elif row["path"] in dup_paths:
        row["status"] = "B"
        row["recommendedAction"] = "Byte-identical candidate; inspect all callsites and preserve originals until approved."
    elif row["directReferences"]:
        row["status"] = "A"
        row["recommendedAction"] = "Referenced asset; keep unless an intentional replacement is reviewed."
    elif row["path"] in similar_paths:
        row["status"] = "C"
        row["recommendedAction"] = "Perceptual similarity candidate; inspect full-size images and intended variant before deciding."
    elif row["possibleDynamicReference"]:
        row["status"] = "F"
        row["recommendedAction"] = "Possible dynamically assembled path; inspect runtime path construction."
    else:
        row["status"] = "E"
        row["recommendedAction"] = "No static code reference found; verify runtime, CSS, save compatibility, and archive role."
    row["similarityCandidates"] = sum(row["path"] in (pair["a"], pair["b"]) for pair in similar_pairs)

report = {
    "date": "2026-11-23",
    "images": rows,
    "exactDuplicates": exact_sets,
    "perceptualReviewCandidates": similar_pairs,
    "endingSvgEmbeddedImages": embedded_rows,
    "endingSvgEmbeddedExactDuplicates": [paths for paths in embedded_groups.values() if len(paths) > 1],
    "method": "Direct reference scan of src and public plus SHA-256 and 64-bit dHash. DHash is a review hint only. D (visual quality) requires manual review; no image was modified or removed.",
}
(OUT / "asset-review.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

fields = ["status", "path", "width", "height", "mode", "transparent", "alphaBounds", "bytes", "sha256", "dhash", "directReferences", "possibleDynamicReference", "stemOccurrences", "similarityCandidates", "manualReviewNote", "recommendedAction"]
with (OUT / "asset-review.csv").open("w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows({key: row[key] for key in fields} for row in rows)

def esc(value):
    return html.escape(str(value))

cards = []
for row in rows:
    cards.append(
        '<article class="card status-' + row["status"] + '">'
        '<a href="' + esc(row["preview"]) + '" target="_blank"><img loading="lazy" src="' + esc(row["preview"]) + '" alt="' + esc(row["path"]) + '"></a>'
        '<h2>' + esc(row["path"]) + '</h2>'
        '<p><b>' + esc(row["status"]) + '</b> · ' + esc(row["width"]) + '×' + esc(row["height"]) + ' · ' + esc(round(row["bytes"] / 1024)) + ' KB</p>'
        '<p>SHA-256 <code>' + esc(row["sha256"][:16]) + '…</code></p>'
        '<p>직접 참조 ' + esc(row["directReferences"]) + ' · 동적 경로 후보 ' + esc(row["possibleDynamicReference"]) + ' · 유사 후보 ' + esc(row["similarityCandidates"]) + '</p>'
        '<p>' + esc(row["recommendedAction"]) + '</p><p>' + esc(row["manualReviewNote"]) + '</p></article>'
    )
pair_rows = "".join('<tr><td>' + esc(p["distance"]) + '</td><td><a href="../../' + esc(p["a"]) + '">' + esc(p["a"]) + '</a></td><td><a href="../../' + esc(p["b"]) + '">' + esc(p["b"]) + '</a></td></tr>' for p in similar_pairs)
dup_rows = "".join('<li>' + " = ".join(esc(p) for p in group) + '</li>' for group in exact_sets)
embedded_dup_rows = "".join('<li>' + " = ".join(esc(p) for p in group) + '</li>' for group in report["endingSvgEmbeddedExactDuplicates"])
page = '''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ARKtopia Asset Review</title>
<style>body{margin:0;background:#14121a;color:#eee;font:14px system-ui,sans-serif}header{position:sticky;top:0;background:#211d29;padding:18px;z-index:2;border-bottom:1px solid #55475f}h1{margin:0 0 8px}a{color:#a9e7df}main{padding:16px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}.card{background:#201c27;border:1px solid #514554;padding:10px;overflow:hidden}.status-B{border-color:#dc9d54}.status-C{border-color:#b59ce1}.status-D{border-color:#df7c84}.status-E,.status-F{border-color:#77818c}img{width:100%;height:220px;object-fit:contain;background-color:#28242e;background-image:linear-gradient(45deg,#35313d 25%,transparent 25%),linear-gradient(-45deg,#35313d 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#35313d 75%),linear-gradient(-45deg,transparent 75%,#35313d 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}h2{font-size:13px;overflow-wrap:anywhere}p{font-size:12px;overflow-wrap:anywhere;color:#c9c1cf}section{margin:28px 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #514554;padding:7px;text-align:left}code{font-size:11px}.note{max-width:1000px;line-height:1.6}</style><header><h1>ARKtopia asset review</h1><div>이미지 ''' + str(len(rows)) + '''개 · exact SHA 그룹 ''' + str(len(exact_sets)) + ''' · 유사 후보 ''' + str(len(similar_pairs)) + ''' · 자동 삭제 없음</div></header><main><p class="note">A 사용 참조 · B 바이트 동일 후보 · C 시각 유사 후보 · D 수동 품질/교체 후보 · E 정적 참조 없음 · F 동적 참조 가능성. 해시·유사도는 저작 의도와 런타임 중요도를 대체하지 않습니다. 승인 전 삭제·덮어쓰기·참조 변경 금지.</p>
<section><h2>바이트 동일 그룹</h2><ul>''' + dup_rows + '''</ul></section><section><h2>엔딩 SVG 내부 이미지 중복</h2><p><a href="ending-v77-embedded-contact.png">SVG 내부 그림 접촉 시트</a></p><ul>''' + embedded_dup_rows + '''</ul></section><section><h2>시각 유사 검토 후보 (dHash distance ≤ 4)</h2><table><thead><tr><th>거리</th><th>파일 A</th><th>파일 B</th></tr></thead><tbody>''' + pair_rows + '''</tbody></table></section><section><h2>전체 에셋</h2><div class="grid">''' + "".join(cards) + '''</div></section></main></html>'''
(OUT / "asset-review.html").write_text(page, encoding="utf-8")
print(f"Images={len(rows)} exactGroups={len(exact_sets)} perceptualPairs={len(similar_pairs)} endingEmbedded={len(embedded_rows)} embeddedHashes={len(embedded_groups)}")
print(f"CSV={OUT / 'asset-review.csv'}")
print(f"HTML={OUT / 'asset-review.html'}")
