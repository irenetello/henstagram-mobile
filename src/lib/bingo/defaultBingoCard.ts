export type BingoCell = {
  id: string;
  text: string;
  isFree?: boolean;
};

export type BingoCard = {
  id: string;
  title: string;
  size: number; // 5
  cells: BingoCell[]; // length = size*size
};

// MVP: a single global bingo card.
// Later: store in Firestore under e.g. bingoCards/{cardId}
export const DEFAULT_BINGO_CARD: BingoCard = {
  id: "henparty-2026",
  title: "Hen Party Bingo",
  size: 5,
  cells: [
    { id: "c00", text: "Find another hen party" },
    { id: "c01", text: "Selfie with a bouncer" },
    { id: "c02", text: "Get a free drink" },
    { id: "c03", text: "Serenade a stranger" },
    { id: "c04", text: "Kiss a bald man's head" },

    { id: "c10", text: "Toast the bride" },
    { id: "c11", text: "Get the DJ to play Single Ladies" },
    { id: "c12", text: "Get asked for ID" },
    { id: "c13", text: "Photo with someone in fancy dress" },
    { id: "c14", text: "Pole dance" },

    { id: "c20", text: "Do a loud fake orgasm" },
    { id: "c21", text: "Someone with the groom's name" },
    { id: "c22", text: "FREE SQUARE", isFree: true },
    { id: "c23", text: "Down at least half a pint" },
    { id: "c24", text: "Propose to a stranger" },

    { id: "c30", text: "Use the men's toilets" },
    { id: "c31", text: "Buy the bride a shot" },
    { id: "c32", text: "Ask for a guy's number" },
    { id: "c33", text: "Selfie with a stag party" },
    { id: "c34", text: "Dance with a stranger" },

    { id: "c40", text: "Stroke a beard" },
    { id: "c41", text: "Have a cocktail" },
    { id: "c42", text: "Ask a guy for a condom" },
    { id: "c43", text: "Kiss a bartender" },
    { id: "c44", text: "Dance on a table" },
  ],
};

export function getBingoIndex(size: number, row: number, col: number) {
  return row * size + col;
}

export function getBingoRowColFromIndex(size: number, index: number) {
  return { row: Math.floor(index / size), col: index % size };
}
