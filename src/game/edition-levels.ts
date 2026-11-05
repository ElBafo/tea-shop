import type { ItemId, LevelDef } from './types';

const R: ItemId = 'rose', J: ItemId = 'jasmine', M: ItemId = 'matcha', C: ItemId = 'chai';

// A separate authored sequence. Released level IDs/boards are never repurposed.
// Read each stack bottom-to-top, just as in the released puzzle engine.
export const EDITION_LEVELS: LevelDef[] = [
  {
    id: 1, name: 'First Pour', capacity: 4,
    blurb: 'Lift the matching treats together. Leave each jar full of one kind.',
    tubes: [[R,R,J,J],[J,J,R,R],[]], par: 3,
  },
  {
    id: 2, name: 'A Little Space', capacity: 4,
    blurb: 'The spare jars give your next pour somewhere to go.',
    tubes: [[R,R,J,R],[J,R,J,J],[],[]], par: 5,
  },
  {
    id: 3, name: 'Open the Shutters', capacity: 4,
    blurb: 'Three flavours, two spare jars. Make a little room for each.',
    tubes: [[R,R,J,M],[M,M,R,J],[J,J,M,R],[],[]], par: 7,
  },
  {
    id: 4, name: 'A Quiet Refill', capacity: 4,
    blurb: 'Bring the small portions together. Full jars finish the shelf.',
    tubes: [[R,R],[J,J],[R,R,J,J],[]], par: 2,
  },
  {
    id: 5, name: 'A Wrapped Surprise', capacity: 4,
    blurb: 'Pour from the wrapped jar to reveal what is underneath. Undo is always here.',
    tubes: [[R,R,J,M],[J,M,J,R],[M,M,R,J],[],[]],
    sealed: [false,false,true,false,false], par: 9,
  },
  {
    id: 6, name: 'Tea for Friends', capacity: 4,
    blurb: 'A fourth flavour joins the shelf. Keep a little space for the next matching pour.',
    tubes: [[R,R,J,C],[J,J,M,R],[M,M,C,J],[C,C,R,M],[],[]], par: 10,
  },
  {
    id: 7, name: 'The Window Seat', capacity: 4,
    blurb: 'A short shelf and a quiet moment before the next pot.',
    tubes: [[R,R,R,J],[J,J,J,R],[],[]], par: 3,
  },
  {
    id: 8, name: 'Afternoon Company', capacity: 4,
    blurb: 'Matching pairs travel together. Leave enough room for the whole pair.',
    tubes: [[R,R,J,C],[J,J,C,M],[M,M,J,R],[C,C,R,M],[],[]], par: 9,
  },
  {
    id: 9, name: 'One Last Surprise', capacity: 4,
    blurb: 'One wrapped jar, three familiar flavours. Take a look with your first pour.',
    tubes: [[R,R,M,J],[J,J,R,M],[M,M,J,R],[],[]],
    sealed: [true,false,false,false,false], par: 8,
  },
  {
    id: 10, name: 'Your Opening Day', capacity: 4,
    blurb: 'Make room, gather matching treats, and finish one jar at a time. There is no hurry.',
    tubes: [[R,M,J,C],[C,R,J,M],[J,C,M,R],[M,J,C,R],[],[]], par: 15,
  },
  {
    id: 11, name: 'The Second Pot', capacity: 4,
    blurb: 'A gentle refill. Bring the small portions together to finish each jar.',
    tubes: [[R,R,R],[J,J,M],[M,M,M,R],[J,J],[]], par: 3,
  },
  {
    id: 12, name: 'Save a Little Space', capacity: 4,
    blurb: 'A matching pair needs two free spaces. Keep somewhere for it to land.',
    tubes: [[R,J,J,M],[J,M,R,R],[M,R,M,J],[],[]], par: 8,
  },
  {
    id: 13, name: 'Under Glass', capacity: 4,
    blurb: 'One wrapped jar holds a surprise. Reveal it, then gather the matching pairs.',
    tubes: [[R,R,M,J],[J,C,C,M],[M,M,J,C],[C,J,R,R],[],[]],
    sealed: [false,true,false,false,false,false], par: 11,
  },
  {
    id: 14, name: 'A Taller Pour', capacity: 5,
    blurb: 'These taller jars hold five treats. Fill each with five of the same kind.',
    tubes: [[R,R,R,J,J],[J,J,J,R,R],[],[]], par: 3,
  },
  {
    id: 15, name: 'Room for Five', capacity: 5,
    blurb: 'Three flavours, five treats each. Keep a spare jar for the next matching pour.',
    tubes: [[R,R,R,J,M],[J,J,J,M,R],[M,M,M,R,J],[],[]], par: 7,
  },
  {
    id: 16, name: 'Leaves and Light', capacity: 5,
    blurb: 'Give the matching groups room to grow. Finish each tall jar at your own pace.',
    tubes: [[R,R,M,J,C],[J,J,C,M,R],[M,M,J,R,C],[C,C,R,J,M],[],[]], par: 15,
  },
  {
    id: 17, name: 'The Quiet Cup', capacity: 4,
    blurb: 'A short shelf to settle into. Matching treats can make space for one another.',
    tubes: [[R,R,J],[J,J,J],[M,M,R],[R,M,M],[]], par: 4,
  },
  {
    id: 18, name: 'Pairs and Space', capacity: 5,
    blurb: 'Keep room for the whole matching pair. The two spare jars can help.',
    tubes: [[R,J,J,M,M],[J,J,R,R,M],[M,M,R,R,J],[],[]], par: 8,
  },
  {
    id: 19, name: 'A Wrapped Keepsake', capacity: 4,
    blurb: 'Open the wrapped jar, then give the matching pairs somewhere to gather.',
    tubes: [[R,J,M,M],[J,C,R,R],[M,C,J,C],[C,M,J,R],[],[]],
    sealed: [false,false,true,false,false,false], par: 12,
  },
  {
    id: 20, name: 'A Place for Keepsakes', capacity: 5,
    blurb: 'Give the larger groups room to land. Finish this tall shelf at your own pace.',
    tubes: [[R,R,M,J,J],[J,C,C,M,M],[M,C,R,J,R],[C,C,R,J,M],[],[]], par: 15,
  },
];

export const EDITION_ARCS = [
  {name: 'First light', start: 1, end: 3, copy: 'A first pour. A little space. Your own beginning.'},
  {name: 'A place for friends', start: 4, end: 6, copy: 'A quiet refill, a surprise, and tea to share.'},
  {name: 'Opening day', start: 7, end: 10, copy: 'A window seat and the finishing touches.'},
  {name: 'Afternoon ritual', start: 11, end: 13, copy: 'Another pot, a little space, and a garden under glass.'},
  {name: 'A room of your own', start: 14, end: 16, copy: 'Taller jars and a little more room to make it yours.'},
  {name: 'Treasures to keep', start: 17, end: 20, copy: 'A quiet cup, matching pairs, and a place for keepsakes.'},
];

// The first ten finishes still fund the core. Six more fund a Glass garden too.
// The following arc adds earned puzzle stars without another milestone bonus.
export const EDITION_MILESTONE_BONUSES = [
  {after: 3, stars: 4}, {after: 6, stars: 5}, {after: 10, stars: 7},
  {after: 16, stars: 4},
];

// Beyond one exploration move per hidden jar, arc finales have breathing room.
export const EDITION_EXTRA_MOVES: Readonly<Record<number, number>> = {6: 1, 10: 2, 13: 1, 16: 2, 20: 2};
