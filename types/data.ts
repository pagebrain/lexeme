export type TaskType = 'improve' | 'expand' | 'shorten' | 'continue';
export type TaskTone = 'causal' | 'semicasual' | 'professional' | 'concise' | 'charismatic';
import { IconType } from "react-icons";
import { FiArrowRight, FiMinus, FiPlus, FiZap, FiFeather, FiCloud, FiShuffle, FiMessageSquare, FiGrid } from "react-icons/fi"

type Role = "assistant" | "user";
export interface Message {
  role: Role;
  content: string;
}
export interface ChatHistory {
  id: string;
  task: TaskType;
  tone: TaskTone;
  selection: string;
  messages: Message[];
  modelId: string;
  temperature: number;
}


export interface Doc {
  id: string;
  title: string;
  prompt: string;
  data: string;
  history: ChatHistory[];
  createdAt: number;
  updatedAt: number;
}

export interface Action {
  id: string;
  name: string;
  prompt: string;
  // icon: IconType;
}

export interface Setting {
  modelId: string;
  temperature: number;
  apiKey: string;
  globalPrompt: string;
  actionPrompts: Action[];
  createdAt: number;
  updatedAt: number;
}

export const ActionIconMap = {
  "improve": FiZap,
  "expand": FiPlus,
  "shorten": FiMinus,
  "continue": FiArrowRight,
  "counterargument": FiShuffle,
  "example": FiFeather,
  "brainstorm": FiCloud,
  "chat": FiMessageSquare,
  "custom": FiGrid
}

export const DefaultActions: Action[] = [
  {
      "id": "improve",
      "name": "Improve writing",
      // "icon": FiZap,
      "prompt": 'Rewrite the following text to improve its writing quality. This involves fixing spelling and grammar, making sentences more clear and concise, splitting up run-on sentences, and reducing repetition. When replacing words, the revised text should not be more complex or difficult than the original. If the text contains quotes, the text inside the quotes should be repeated verbatim. The meaning of the text should not be changed, and any markdown formatting in the text, such as headers, bullets, or checkboxes, should not be removed. Overly formal language should not be used.'
  },
  {
      "id": "expand",
      "name": "Make longer",
      // "icon": FiPlus,
      "prompt": 'Rewrite the following text to make it longer while still preserving the key ideas.'
  },
  {
      "id": "shorten",
      "name": "Make shorter",
      // "icon": FiMinus,
      "prompt": 'Rewrite the following text as concisely as possible while still preserving the key ideas.'
  },
  {
      "id": "continue",
      "name": "Continue writing",
      // "icon": FiArrowRight,
      "prompt": "Continue writing the following text without any preamble or introduction."
  },
  {
      "id": "counterargument",
      "name": "Counter argument",
      // "icon": FiShuffle,
      "prompt": "Provide a counter argument for the following text."
  },
  {
      "id": "example",
      "name": "Give an example",
      // "icon": FiFeather,
      "prompt": "Provide an example for the following text."
  },
  {
      "id": "brainstorm",
      "name": "Brainstorm ideas",
      // "icon": FiCloud,
      "prompt": "Brainstorm ideas for the following text."
  },
  {
      "id": "chat",
      "name": "General Chat",
      // "icon": FiMessageSquare,
      "prompt": "Follow user\'s instructions carefully."
  }
]

export const DefaultSetting: Setting = {
  modelId: 'gpt-3.5-turbo',
  temperature: 0.5,
  apiKey: '',
  globalPrompt: 'You are an assistant helping a user write a document. Follow the user\'s instructions carefully. Respond using markdown.',
  actionPrompts: DefaultActions
}

// export const TasksMap = new Map(
//   Tasks.map(task => {
//     return [task.name, task];
//   }),
// );