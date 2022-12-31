import { words } from "./words";

// Get n random words from object containing list of 300k words or so (words.ts)
export default function randomWords(n = 10): string[] {
  const wordArray = Object.keys(words);
  const returnArray = [];

  for (let i = 0; i < n; i++) {
    returnArray.push(wordArray[Math.floor(Math.random() * wordArray.length)]);
  }

  return returnArray;
}
