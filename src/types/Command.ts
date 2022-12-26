type Command = {
  data: any;
  execute: (interaction: any) => Promise<void>;
};

export default Command;
