// Janky command type - kinda useless ngl
type Command = {
  data: any;
  execute: (interaction: any) => Promise<void>;
};

export default Command;
