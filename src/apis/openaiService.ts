import { Configuration, OpenAIApi } from "openai";

class OpenAIService {
  private openai: OpenAIApi;

  constructor() {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(config);
  }

  public async createCompletion(input: string, suffix?: string): Promise<string | undefined> {
    const res = await this.openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 4000,
      prompt: input,
      suffix,
      temperature: 0.1,
    });

    return res.data.choices[0].text;
  }

  public async createEdit(input: string, instruction: string): Promise<string | undefined> {
    const res = await this.openai.createEdit({
      model: "text-davinci-edit-001",
      input,
      instruction,
      temperature: 0.1,
    });

    return res.data.choices[0].text;
  }

  public async createImage(input: string): Promise<string | undefined> {
    const res = await this.openai.createImage({
      prompt: input,
    });

    return res.data.data[0].url;
  }
}

export default OpenAIService;
