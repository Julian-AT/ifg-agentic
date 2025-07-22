export const DEFAULT_CHAT_MODEL: string = "chat-model";

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "chat-model",
    name: "Chat Modell",
    description: "Normales Chat Modell für allgemeine Fragen",
  },
  {
    id: "chat-model-reasoning",
    name: "Reasoning Modell",
    description: "Modell mit besserer Verständnisfähigkeit und Reasoning",
  },
];
