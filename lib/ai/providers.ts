import {
  customProvider,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const myProvider = customProvider({
  languageModels: {
    "chat-model": openai.chat("gpt-4.1"),
    "chat-model-reasoning": openai.responses("gpt-5"),
    "title-model": openai("gpt-4-turbo"),
    "artifact-model": openai("gpt-4.1"),
  },
});
