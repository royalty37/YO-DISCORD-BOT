import { EMOJI_LIST } from "./emojiList";

// Get a single random emoji
const getRandomEmoji = () => EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];

// Get n random emojis from array containing list of 1800 or so emojis (emojiList.ts)
const getRandomEmojis = (n: number) => {
  const returnArray = [];

  for (let i = 0; i < n; i++) {
    returnArray.push(getRandomEmoji());
  }

  return returnArray;
};
