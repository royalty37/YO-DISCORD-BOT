import { Configuration, OpenAIApi } from "openai";

class OpenAIService {
  private openai: OpenAIApi;

  constructor() {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(config);
  }

  public async createCompletion(prompt: string): Promise<string | undefined> {
    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 4000,
      prompt,
      temperature: 0.1,
    });

    return response.data.choices[0].text;
  }
}

export default OpenAIService;
