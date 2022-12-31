import { WORD_LIST } from "./wordList";

export const randomWord = (): string => {
  const wordArray = Object.keys(WORD_LIST);

  return wordArray[Math.floor(Math.random() * wordArray.length)];
}; 

// Get n random words from object containing list of 300k words or so (words.ts)
export const randomWords = (n = 10): string[] => {
  const wordArray = Object.keys(WORD_LIST);
  const returnArray = [];

  for (let i = 0; i < n; i++) {
    returnArray.push(randomWord());
  }

  return returnArray;
}
