export enum Industry {
  RETAIL = 'Retail',
  ECOMMERCE = 'E-commerce',
  FOOD = 'Food & Beverage',
  TECH = 'Technology / SaaS',
  SERVICES = 'Professional Services',
  OTHER = 'Other'
}

export interface BusinessMetrics {
  revenue: string;
  expenses: string;
  customerCount: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
}