import { WORD_LIST } from "./wordList";

// Get a single random word
export const getRandomWord = (): string => {
  const wordArray = Object.keys(WORD_LIST);

  return wordArray[Math.floor(Math.random() * wordArray.length)];
};

// Get n random words from object containing list of 300k or so words (wordList.ts)
export const getRandomWords = (n: number): string[] => {
  const returnArray = [];

  for (let i = 0; i < n; i++) {
    returnArray.push(getRandomWord());
  }

  return returnArray;
};
