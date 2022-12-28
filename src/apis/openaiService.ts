import { Configuration, OpenAIApi } from "openai";

// Wrapper class for OpenAI API
// https://github.com/openai/openai-node
class OpenAIService {
  private openai: OpenAIApi;

  // Constructor creates a new OpenAI API instance with the API key
  constructor() {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(config);
  }

  // Create a completion - essentially functions like ChatGPT
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

  // Create an edit - this AI model SUCKS, honestly does dumb shit
  public async createEdit(input: string, instruction: string): Promise<string | undefined> {
    const res = await this.openai.createEdit({
      model: "text-davinci-edit-001",
      input,
      instruction,
      temperature: 0.1,
    });

    return res.data.choices[0].text;
  }

  // Create an image from provided text
  public async createImage(input: string): Promise<string | undefined> {
    const res = await this.openai.createImage({
      prompt: input,
    });

    return res.data.data[0].url;
  }
}

export default OpenAIService;
