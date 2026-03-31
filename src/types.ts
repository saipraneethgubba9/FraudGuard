export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  language: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Scenario {
  id: number;
  category_id: number;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface Progress {
  category_id: number;
  category_name: string;
  total_completed: number;
  accuracy_percentage: string;
  risk_score: string;
}
