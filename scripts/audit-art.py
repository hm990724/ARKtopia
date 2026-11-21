"""Read-only artwork audit; never rewrites or removes originals. Requires Pillow."""
from pathlib import Path
from PIL import Image
import hashlib, json
root=Path(__file__).resolve().parents[1]
rows=[]
for p in sorted((root/'public/assets').rglob('*')):
 if p.suffix.lower() not in ('.png','.jpg','.jpeg','.webp'): continue
 with Image.open(p) as im:
  alpha=im.getchannel('A') if 'A' in im.getbands() else None
  # Difference hash is a review hint only, not proof of duplicate content.
  small=im.convert('L').resize((9,8));v=list(small.getdata())
  bits=''.join('1' if v[y*9+x]>v[y*9+x+1] else '0' for y in range(8) for x in range(8))
  rows.append({'path':p.relative_to(root).as_posix(),'width':im.width,'height':im.height,'mode':im.mode,'transparent':alpha is not None and alpha.getextrema()[0]<255,'alphaBounds':alpha.getbbox() if alpha else None,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'dhash':hex(int(bits,2)),'bytes':p.stat().st_size})
groups={}
for r in rows: groups.setdefault(r['sha256'],[]).append(r['path'])
similar=[]
for i,a in enumerate(rows):
 for b in rows[i+1:]:
  if a['sha256']==b['sha256']:continue
  distance=(int(a['dhash'],16)^int(b['dhash'],16)).bit_count()
  if distance<=4:similar.append({'a':a['path'],'b':b['path'],'distance':distance})
report={'images':rows,'exactDuplicates':[v for v in groups.values() if len(v)>1],'perceptualReviewCandidates':similar,'note':'dHash candidates are not duplicates; no image was moved or deleted.'}
(root/'docs/asset-audit-v71.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
sprites=[r for r in rows if '/animals/' in r['path']]
print(f"Raster assets: {len(rows)}; animal sprites: {len(sprites)}; transparent: {sum(r['transparent'] for r in sprites)}; exact duplicate groups: {len(report['exactDuplicates'])}; perceptual review pairs: {len(similar)}")
