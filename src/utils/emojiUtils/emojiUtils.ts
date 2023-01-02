import { EMOJI_LIST } from "./emojiList";

// Get a single random emoji
export const getRandomEmoji = () => EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];

// Get n random emojis from array containing list of 1800 or so emojis (emojiList.ts)
export const getURandomEmojis = (n: number) => {
  const returnArray: string[] = [];

  for (let i = 0; i < n; i++) {
    returnArray.push(getRandomEmoji());
  }

  return returnArray;
};

// Get n unique random emojis from array containing list of 1800 or so emojis (emojiList.ts)
export const getUniqueRandomEmojis = (n: number) => {
  const returnArray: string[] = [];

  for (let i = 0; i < n; i++) {
    let emoji = getRandomEmoji();

    while (returnArray.includes(emoji)) {
      emoji = getRandomEmoji();
    }

    returnArray.push(emoji);
  }

  return returnArray;
};
