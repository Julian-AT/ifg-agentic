import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
} from "ai";
import { chatModels } from "./models";

export const myProvider = customProvider({
  languageModels: Object.fromEntries(
    chatModels.map((model) => [
      model.model,
      gateway.languageModel(model.model),
    ])
  ),
});