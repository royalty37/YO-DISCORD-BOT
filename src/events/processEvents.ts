export const registerProcessEvents = () => {
  // Process UncaughtException event - Hopefully helps to prevent bot crashing
  process.on("unhandledRejection", (error) => {
    console.error("*** Unhandled promise rejection:", error);
  });
};
