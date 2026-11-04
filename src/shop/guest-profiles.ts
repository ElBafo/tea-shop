export type GuestGroup = 'woman' | 'man' | 'child';
export type GuestHair = 'bun' | 'bob' | 'sweep' | 'crop' | 'pigtails' | 'curls';
export interface GuestProfile {
  readonly id: string;
  readonly group: GuestGroup;
  readonly hairStyle: GuestHair;
  /** World distance covered by one complete left/right step cycle. */
  readonly strideLength: number;
  readonly skin: string;
  readonly hair: string;
  readonly top: string;
  readonly trousers: string;
  readonly accent: string;
  readonly glasses?: boolean;
  readonly beard?: boolean;
  readonly scarf?: boolean;
}

// Alternating adults and children makes the cast visible within a few visits.
// Profiles are presentation only: they never affect routes, prices or rewards.
export const GUEST_PROFILES: readonly GuestProfile[] = [
  {id:'rose-bun',group:'woman',hairStyle:'bun',strideLength:.80,skin:'#b9815e',hair:'#503d32',top:'#bc8d82',trousers:'#5b7067',accent:'#ead4b5'},
  {id:'mint-child',group:'child',hairStyle:'pigtails',strideLength:.56,skin:'#dfb18b',hair:'#634535',top:'#a1bca9',trousers:'#738b9a',accent:'#e7c379'},
  {id:'navy-scarf',group:'man',hairStyle:'sweep',strideLength:.80,skin:'#8d5e43',hair:'#303936',top:'#6e8794',trousers:'#596c63',accent:'#eadcc2',glasses:true,scarf:true},
  {id:'sage-bob',group:'woman',hairStyle:'bob',strideLength:.80,skin:'#e1b591',hair:'#544b3b',top:'#8fa596',trousers:'#6b7184',accent:'#dcc0a2'},
  {id:'berry-child',group:'child',hairStyle:'curls',strideLength:.56,skin:'#ae7856',hair:'#363c35',top:'#b68c9b',trousers:'#6a887f',accent:'#e4ca85'},
  {id:'ochre-knit',group:'man',hairStyle:'crop',strideLength:.80,skin:'#d4a17c',hair:'#65513c',top:'#bba16e',trousers:'#627b85',accent:'#e8ddc9',beard:true},
];

export function guestProfile(id: string): GuestProfile {
  return GUEST_PROFILES.find(profile=>profile.id===id) ?? GUEST_PROFILES[0];
}
