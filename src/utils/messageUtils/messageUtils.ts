// Function to split message into multiple messages if message is > 2000 (or max length) characters
// maxLength defaults to 2000 as that's the max length of a Discord message
export const splitMessage = (message: string, maxLength = 2000): string[] => {
  if (message.length <= maxLength) {
    return [message];
  }

  const returnArray: string[] = [];

  for (let i = 0; i < message.length; i += 2000) {
    const toSend = message.substring(i, Math.min(message.length, i + 2000));
    returnArray.push(toSend);
  }

  return returnArray;
};
