// Function to split message into multiple messages if message is > 2000 (or max length) characters
export const splitMessage = (message: string, maxLength = 2000): string[] => {
  if (message.length <= maxLength) {
    return [message];
  }

  const returnArray = [];

  for (let i = 0; i < message.length; i += 2000) {
    const toSend = message.substring(i, Math.min(message.length, i + 2000));
    returnArray.push(toSend);
  }

  return returnArray;
};
