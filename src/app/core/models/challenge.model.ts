export interface Challenge {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  startDate: Date;
  endDate: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: string[];
  instructions: string[];
  culturalContext: string;
  imageUrl?: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  userEmail: string;
  imageUrls: string[];
  description: string;
  createdAt: Date;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
}
