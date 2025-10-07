import {
  customProvider,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  chatModel,
  reasoningModel,
  titleModel,
  artifactModel,
} from "./models.test";
import { isTestEnvironment } from "../constants";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const myProvider = isTestEnvironment
  ? customProvider({
    languageModels: {
      "chat-model": chatModel,
      "chat-model-reasoning": reasoningModel,
      "title-model": titleModel,
      "artifact-model": artifactModel,
    },
  })
  : customProvider({
    languageModels: {
      "chat-model": openai.chat("gpt-4.1"),
      "chat-model-reasoning": openai.responses("gpt-5"),
      "title-model": openai("gpt-4-turbo"),
      "artifact-model": openai("gpt-4.1"),
    },
  });
