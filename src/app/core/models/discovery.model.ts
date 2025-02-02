export interface CulturalArticle {
  id: string;
  title: string;
  content: string;
  cuisine: string;
  author: string;
  publishDate: Date;
  imageUrl?: string;
  tags: string[];
  readTime: number; // in minutes
  likes: number;
  category: 'history' | 'technique' | 'ingredients' | 'traditions';
}

export interface CulturalVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  cuisine: string;
  duration: number; // in seconds
  author: string;
  publishDate: Date;
  views: number;
  likes: number;
  category: 'tutorial' | 'documentary' | 'interview' | 'cultural-insight';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  totalPoints: number;
  imageUrl?: string;
  completions: number;
  averageScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  points: number;
  explanation: string;
  imageUrl?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  startTime: Date;
  endTime?: Date;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  completed: boolean;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
  points: number;
}
