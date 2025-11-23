
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'code' | 'error' | 'success';
}

export interface GameProject {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

export enum ModelType {
  GENERATOR = 'gemini-3-pro-preview',
  FAST_ASSIST = 'gemini-2.5-flash-lite-latest',
  RESEARCHER = 'gemini-2.5-flash',
}

export interface PerformanceData {
  time: number;
  fps: number;
  memory: number;
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
}
