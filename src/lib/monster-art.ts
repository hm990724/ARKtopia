const variantNumber=(value:number|undefined)=>Math.max(1,Math.min(20,Math.floor(value??1)));
export function mutantSprite(variant?:number):string{return `/assets/monsters/mutant${variantNumber(variant)}_mutant.png`;}
export function mutantReveal(variant?:number):string{return `/assets/cinematics/field-threats/mutant${variantNumber(variant)}/reveal.png`;}
