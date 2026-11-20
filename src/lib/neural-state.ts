/** The fictional transplant adaptation model. These are derived values, not
 * competing sources of truth: older saves retain their established vitals.
 * Invisible until the preservation-facility discovery chapter. */
import type {AnimalState} from './sim';
import {cap} from './sim';
export type NeuralProfile={activation:number;stability:number;resistance:number;hqAttention:number};
const resistances:Partial<Record<AnimalState['id'],number>>={rabbit:76,fox:71,deer:83,owl:77,wolf:80,crow:68,otter:86,lynx:74,axolotl:92,moth:88,mutant:56,chimera:62};
export function neuralProfile(a:AnimalState):NeuralProfile{
 const activation=cap(Math.round(a.memory*.78+Math.min(20,a.records*4)));
 const stability=cap(Math.round(100-a.stress*.54-a.contamination*.38-a.memory*.18-(a.mutated?23:0)));
 const resistance=resistances[a.id]??65;
 const hqAttention=cap(Math.round(a.memory*.54+Math.min(24,a.records*6)+a.contamination*.18));
 return {activation,stability,resistance,hqAttention};
}
