/** Active art versions. Original files remain available in Git and are never overwritten. */
const renewedNormal=new Set(['lynx','axolotl','chimera','specter']);
const renewedMutant=new Set(['lynx','axolotl','chimera','specter','moth','crow']);
export function animalSprite(id:string,mutated=false):string{
 if(id==='m00')return '/assets/animals/m00_normal_v74.png';
 const version=(mutated?renewedMutant:renewedNormal).has(id)?'_v74':mutated&&id==='mutant'?'_v73':'';
 return `/assets/animals/${id}_${mutated?'mutant':'uncanny'}${version}.png`;
}
