from PIL import Image,ImageDraw
import random,math,os
OUT=os.path.join(os.path.dirname(__file__),'public','art');os.makedirs(OUT,exist_ok=True)
random.seed(971)
W,H=320,180
pal={'sky':'#10121e','fog':'#30283c','pink':'#a35677','red':'#ca5c64','gold':'#e0ad78','mint':'#76a99b','night':'#080b13'}
def make_scene(name,variant):
 im=Image.new('RGB',(W,H));d=ImageDraw.Draw(im)
 themes=[('#0b111b','#2a2941','#8d5262'),('#0b1719','#27403c','#89a797'),('#150f1a','#48293c','#c56c72'),('#100c19','#36244a','#a957a9'),('#090e17','#22303d','#9b7476'),('#1b1119','#52303d','#df907d')]
 sky,mist,glow=themes[variant]
 for y in range(H):
  t=y/H;a=tuple(int(sky[i:i+2],16) for i in (1,3,5));b=tuple(int(mist[i:i+2],16) for i in (1,3,5));c=tuple(int(a[j]*(1-t)+b[j]*t) for j in range(3));d.line((0,y,W,y),fill=c)
 for n in range(180):
  x=random.randrange(W);y=random.randrange(0,117);c=random.choice(['#65556f','#75647c','#4a5365','#ad7280']);d.point((x,y),fill=c)
 d.ellipse((219,13,269,63),fill=glow)
 for r in range(1,6):d.arc((219-r*4,13-r*4,269+r*4,63+r*4),0,360,fill=('#513a4d' if variant!=1 else '#3b615e'))
 # distant crumbling city
 for x in range(0,W,14):
  h=random.randrange(24,62);y=130-h;d.rectangle((x,y,x+random.randrange(7,16),132),fill='#171925' if variant!=1 else '#182b2a')
  for yy in range(y+4,120,7):
   for xx in range(x+3,x+11,5):
    if random.random()<.24:d.rectangle((xx,yy,xx+1,yy+2),fill='#926b72')
 # terrain
 d.polygon([(0,139),(25,134),(57,145),(93,132),(130,138),(159,131),(190,142),(224,132),(267,137),(320,128),(320,180),(0,180)],fill='#151820' if variant!=1 else '#1b2926')
 # glass dome
 d.arc((164,60,298,170),180,360,fill='#59606b',width=3);d.line((165,116,165,166),fill='#525361',width=3);d.line((297,116,297,166),fill='#525361',width=3)
 for xx in [192,229,265]:d.line((xx,82 if xx==229 else 94,xx,163),fill='#3d414d',width=2)
 for yy in [110,133,156]:d.line((166,yy,297,yy),fill='#373743',width=2)
 if variant==2: # dinosaur silhouette
  d.polygon([(194,135),(208,114),(224,107),(241,112),(261,126),(253,131),(227,120),(217,142)],fill='#0b1118')
  d.polygon([(222,112),(219,86),(226,79),(241,87),(237,94),(231,92),(231,114)],fill='#0b1118')
  d.polygon([(254,125),(280,113),(268,130)],fill='#0b1118')
  d.point((233,88),fill='#e66c75')
 if variant==3:
  for i in range(10):
   x=210+int(math.sin(i*.8)*37);y=113-int(i*5)
   d.line((230,149,x,y),fill='#8b4b8e',width=2);d.ellipse((x-3,y-3,x+3,y+3),fill='#a85dae')
 # gate and fences
 for x in range(0,160,9):
  d.line((x,102,x,175),fill='#090b13',width=2);d.ellipse((x-1,99,x+1,103),fill='#30303c')
 for y in [118,145]:d.line((0,y,155,y),fill='#090b13',width=3)
 for x in [40,151]:d.rectangle((x-5,99,x+5,179),fill='#16141e',outline='#38323c',width=2)
 d.arc((39,79,153,120),180,360,fill='#17141d',width=8);d.arc((39,79,153,120),180,360,fill='#8d6973',width=1)
 d.rectangle((66,98,128,108),fill='#26202a',outline='#785862');
 # branches
 d.line([(0,0),(19,20),(48,33),(66,50)],fill='#0a0a12',width=7);d.line([(20,20),(24,0)],fill='#0a0a12',width=4)
 for x in range(0,320,4):
  if random.random()<.35:d.line((x,170,x+random.randrange(-2,3),170-random.randrange(2,13)),fill='#252d2a',width=1)
 # rain
 for i in range(160):
  x=random.randrange(W);y=random.randrange(H);d.line((x,y,x-2,y+7),fill=random.choice(['#354052','#4b465a','#3b394e']))
 # light trail
 for i in range(55):
  x=random.randint(20,315);y=random.randint(146,176)
  d.line((x,y,x+random.randrange(1,7),y),fill=random.choice(['#56404f','#67404d','#344249']))
 im.resize((W*4,H*4),Image.Resampling.NEAREST).save(os.path.join(OUT,name+'.png'))
for i,n in enumerate(['gate','sanctuary','fossil','laboratory','wasteland','dawn']):make_scene(n,i)
# sprite sheet 10 animals, pixel-by-pixel via shapes on 32x32, no external art
colors=[('#f1dbc7','#b98e98'),('#d6a17b','#8d5b5b'),('#b5d8ca','#628c90'),('#dbbe7b','#936b62'),('#c5bedf','#797297'),('#ca849a','#8b526f'),('#a5c0a6','#587b73'),('#cc9985','#85516a'),('#bb9bd4','#77518c'),('#e0abb9','#975f86')]
names=['rabbit','fox','deer','owl','wolf','mutant','dino','raptor','chimera','specter']
for i,n in enumerate(names):
 im=Image.new('RGBA',(32,32),(0,0,0,0));d=ImageDraw.Draw(im);main,shade=colors[i]
 d.ellipse((4,28,28,31),fill=(6,9,16,115))
 if n in ('rabbit','fox','wolf','mutant','chimera','specter'):
  d.ellipse((7,14,25,28),fill=shade);d.ellipse((8,12,25,24),fill=main)
  if n=='rabbit':
   d.polygon([(10,14),(9,3),(13,1),(16,14)],fill=main);d.polygon([(19,14),(21,1),(25,3),(23,16)],fill=main);d.line((12,5,13,12),fill=shade,width=2)
  elif n in ('fox','wolf','chimera'):
   d.polygon([(8,16),(5,3),(15,10)],fill=shade);d.polygon([(19,10),(27,3),(26,18)],fill=shade)
   d.polygon([(23,21),(31,13),(28,25)],fill=main)
  else:
   d.polygon([(9,12),(6,4),(14,8)],fill=main);d.polygon([(22,10),(25,2),(27,14)],fill=main)
  d.rectangle((12,23,15,28),fill=shade);d.rectangle((20,23,23,28),fill=shade)
 elif n=='deer':
  d.ellipse((8,14,26,28),fill=shade);d.ellipse((9,8,24,22),fill=main)
  for x in (11,21):d.line((x,11,x-3,2),fill=shade,width=2);d.line((x-3,5,x+2,3),fill=shade,width=2)
 elif n=='owl':
  d.ellipse((7,7,25,28),fill=main);d.polygon([(7,12),(6,3),(13,9)],fill=shade);d.polygon([(20,9),(27,3),(25,12)],fill=shade)
 elif n in ('dino','raptor'):
  d.ellipse((4,13,25,27),fill=main);d.rectangle((19,9,25,23),fill=main);d.ellipse((19,7,30,16),fill=main)
  d.polygon([(7,22),(0,18),(1,27)],fill=shade)
  for x in range(8,22,5):d.polygon([(x,15),(x+2,9),(x+5,15)],fill=shade)
  d.rectangle((11,24,15,29),fill=shade);d.rectangle((21,23,25,29),fill=shade)
 if n=='specter':
  d.ellipse((9,12,24,29),fill='#8b678c');d.polygon([(9,22),(5,29),(13,27),(19,30),(24,25),(28,30),(24,18)],fill='#8b678c')
 d.rectangle((14,17,16,19),fill='#171823');d.rectangle((22,17,24,19),fill='#171823');d.rectangle((15,17,15,17),fill='#fff0e9')
 if n in ['mutant','chimera','specter']:d.point((22,17),fill='#f15a86')
 im.resize((256,256),Image.Resampling.NEAREST).save(os.path.join(OUT,n+'.png'))
print('Generated:',os.listdir(OUT))
