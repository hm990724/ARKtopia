"""Read-only artwork inventory. Never deletes or overwrites an existing final asset."""
from pathlib import Path
from PIL import Image,ImageDraw
from hashlib import sha256
from collections import defaultdict
import json,zipfile,re

ROOT=Path(__file__).resolve().parent.parent
out=ROOT/'docs'/'qa-v68';out.mkdir(parents=True,exist_ok=True)
rows=[];hashes=defaultdict(list);thumbs=[]
for p in sorted((ROOT/'public').rglob('*')):
 if p.suffix.lower() not in ['.png','.webp','.jpg','.jpeg']:continue
 im=Image.open(p);im.load();rgba=im.convert('RGBA');alpha=rgba.getchannel('A');bbox=alpha.getbbox()
 grey=rgba.convert('L').resize((9,8));pixels=list(grey.getdata());dhash=sum((pixels[y*9+x]>pixels[y*9+x+1])<<(y*8+x) for y in range(8) for x in range(8))
 relative=p.relative_to(ROOT).as_posix();digest=sha256(p.read_bytes()).hexdigest();hashes[digest].append(relative)
 rows.append(dict(path=relative,width=im.width,height=im.height,format=im.format,alpha=alpha.getextrema()[0]<255,bbox=bbox,edge_touch=bool(bbox and (bbox[0]==0 or bbox[1]==0 or bbox[2]==im.width or bbox[3]==im.height)),sha256=digest,dhash=f'{dhash:016x}',status='generated' if p.name in ['m00_normal.png','photo_08.png'] else 'reused'))
 tile=Image.new('RGB',(220,190),'#28232e');rgba.thumbnail((210,148));tile.paste(rgba,((220-rgba.width)//2,0),rgba);ImageDraw.Draw(tile).text((4,151),str(p.relative_to(ROOT/'public/assets')),fill='white');thumbs.append(tile)
sheet=Image.new('RGB',(220*6,190*((len(thumbs)+5)//6)),'#18151e')
for i,t in enumerate(thumbs):sheet.paste(t,((i%6)*220,(i//6)*190))
sheet.save(out/'asset-contact-sheet.jpg')
similar=[]
for i,a in enumerate(rows):
 for b in rows[i+1:]:
  distance=(int(a['dhash'],16)^int(b['dhash'],16)).bit_count()
  if distance<=6 and a['sha256']!=b['sha256']:similar.append(dict(a=a['path'],b=b['path'],distance=distance,action='review_only'))
bundle=Path('C:/Users/lookm/Downloads/ANOMALY_ZOO_CODEX_HANDOFF_v68.zip')
candidates=[]
if bundle.exists():
 with zipfile.ZipFile(bundle) as z:
  dest=ROOT/'docs'/'handoff-v68';dest.mkdir(exist_ok=True)
  for name in ['00_CODEX_MASTER_PROMPT.txt','01_STORY_BIBLE.md','02_UI_GAMEPLAY_SPEC.md','03_ASSET_AUDIT_AND_IMAGE_REQUESTS.md','04_QA_ACCEPTANCE.md','assets_manifest.json']:(dest/name).write_bytes(z.read(name))
  for name in z.namelist():
   if name.startswith('curated_animals/') and name.endswith('.png'):
    digest=sha256(z.read(name)).hexdigest();existing=ROOT/'public/assets/animals'/Path(name).name
    candidates.append(dict(bundle=name,sha256=digest,existing=existing.exists(),identical=existing.exists() and sha256(existing.read_bytes()).hexdigest()==digest,decision='preserve_existing_final'))
expected=[]
for species in ['rabbit','fox','deer','owl','wolf','crow','otter','lynx','axolotl','moth','mutant','chimera','specter']:
 for form in ['uncanny','mutant']:expected.append(f'public/assets/animals/{species}_{form}.png')
expected.append('public/assets/animals/m00_normal.png')
expected += [f'public/assets/hidden-photos/photo_{i:02}.png' for i in range(1,13)]
expected += [f'public/assets/cinematics/origin-zero/scene_{name}.png' for name in ['origin_escape','collapse','m00_positive','m00_transfer','m00_protect','ark_recall','farewell']]
expected += [f'public/assets/characters/{name}.png' for name in ['eve_glitch','eve_revelation','protagonist_decline','protagonist_final','scientist_archive','scientist_obsession','daughter_portrait']]
expected += [f'public/assets/backgrounds/bg_{name}.png' for name in ['containment','headquarters','origin_lab']]
missing=[p for p in expected if not (ROOT/p).exists()]
data=dict(date='2026-11-20',inventory=rows,duplicates=[v for v in hashes.values() if len(v)>1],visual_similarity_candidates=similar,bundle_comparison=candidates,missing=missing,source_rights='User supplied repository/bundle; provenance beyond supplied files not independently verified. Two new assets generated using built-in imagegen.',fallback='Missing animal art uses explicitly labelled missing.svg, never another species. Unmade photos use labelled archive visualization.')
(ROOT/'asset-registry.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(dict(raster_files=len(rows),exact_duplicate_groups=len(data['duplicates']),similarity_candidates=len(similar),missing=len(missing),bundle_identical=sum(c['identical'] for c in candidates)),ensure_ascii=False))
