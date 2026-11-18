const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const Module=require('node:module');
const source=fs.readFileSync(path.join(__dirname,'../src/lib/story.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const mod=new Module('story-test',module);
mod.filename='story-test.cjs';mod.paths=module.paths;mod._compile(code,mod.filename);
const engine=mod.exports;
const outcomes={};let invalid=0;
for(let seed=1;seed<=2000;seed++){
 let game=engine.initial(seed*83);
 for(let t=0;t<engine.MAX_TURNS&&!game.over;t++){
  const event=engine.eventFor(game);
  const choices=engine.choicesFor(game);
  if(choices.length!==3||!event){invalid++;break;}
  const inspected=engine.inspect(game,['creature','site','terminal'][t%3]);game=inspected.save;
  const decision=engine.decide(game,(seed+t)%3);game=decision.save;
  if(game.stats.vital<0||game.stats.eve<0||game.turn>engine.MAX_TURNS){invalid++;break;}
 }
 if(!game.over)invalid++;
 outcomes[game.ending]=(outcomes[game.ending]||0)+1;
}
console.log(JSON.stringify({events:engine.EVENTS.length,endings:Object.keys(engine.endings).length,simulations:2000,invalid,outcomes},null,2));
if(invalid)process.exitCode=1;
