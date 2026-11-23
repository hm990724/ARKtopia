/** Animal art always resolves through the canonical species and state filenames. */
export function animalSprite(id:string,mutated=false):string{
 if(id==='m00')return '/assets/animals/m00_normal.png';
 return `/assets/animals/${id}_${mutated?'mutant':'uncanny'}.png`;
}