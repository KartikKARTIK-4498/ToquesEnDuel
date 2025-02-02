import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  collectionData, 
  orderBy, 
  limit, 
  increment,
  DocumentData,
  CollectionReference,
  getDoc,
  writeBatch,
  Timestamp,
  documentId
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, map, of } from 'rxjs';

export interface Challenge {
  id?: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
  imageUrl: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  participants: number;
  submissions: number;
}

export interface ChallengeSubmission {
  challengeId: string;
  userId: string;
  userEmail: string;
  imageUrl: string;
  mediaUrls: string[];
  notes: string;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private challengesCollection: CollectionReference<DocumentData>;
  private submissionsCollection: CollectionReference<DocumentData>;
  private participantsCollection: CollectionReference<DocumentData>;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.challengesCollection = collection(this.firestore, 'challenges');
    this.submissionsCollection = collection(this.firestore, 'submissions');
    this.participantsCollection = collection(this.firestore, 'participants');
  }

  // Get all challenges
  async getAllChallenges(): Promise<Challenge[]> {
    try {
      const querySnapshot = await getDocs(
        query(this.challengesCollection, orderBy('startDate', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    } catch (error) {
      console.error('Error getting all challenges:', error);
      return [];
    }
  }

  

  // Get active challenges
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.challengesCollection,
          where('startDate', '<=', Timestamp.now()),
          where('endDate', '>=', Timestamp.now()),
          orderBy('startDate', 'asc'),
          limit(5)
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    } catch (error) {
      console.error('Error getting active challenges:', error);
      return [];
    }
  }

  // Get upcoming challenges
  async getUpcomingChallenges(): Promise<Challenge[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.challengesCollection,
          where('startDate', '>', new Date().toISOString())
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    } catch (error) {
      console.error('Error getting upcoming challenges:', error);
      return [];
    }
  }

  // Get past challenges
  async getPastChallenges(): Promise<Challenge[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.challengesCollection,
          where('endDate', '<', new Date().toISOString())
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    } catch (error) {
      console.error('Error getting past challenges:', error);
      return [];
    }
  }

  // Get submissions by user ID and all challenges
  async getSubmissionsAndChallenges(): Promise<{ submissions: ChallengeSubmission[], challenges: Challenge[] }> {
    try {
      const userId = this.authService.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const submissionsSnapshot = await getDocs(
        query(this.submissionsCollection, where('userId', '==', userId))
      );
      const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as ChallengeSubmission));

      const challengeIds = submissions.map(sub => sub.challengeId);
      const challengesQuery = query(this.challengesCollection, where(documentId(), 'in', challengeIds));
      const challengesSnapshot = await getDocs(challengesQuery);
      const challenges = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));

      return { submissions, challenges };
    } catch (error) {
      console.error('Error getting submissions and challenges:', error);
      return { submissions: [], challenges: [] };
    }
  }

  // Get the latest active challenge and all its submissions
  async getLatestActiveChallengeAndSubmissions(): Promise<{ challenge: Challenge | null, submissions: ChallengeSubmission[] }> {
    try {
      const activeChallenge = await this.getActiveChallenges();
      if (activeChallenge.length === 0) {
        return { challenge: null, submissions: [] };
      }

      const latestChallenge: any = activeChallenge[0];
      const submissions = await this.getAllSubmissions(latestChallenge.id);

      return { challenge: latestChallenge, submissions };
    } catch (error) {
      console.error('Error getting latest active challenge and submissions:', error);
      return { challenge: null, submissions: [] };
    }
  }
  

  // Get all submissions for a challenge
  async getAllSubmissions(challengeId: string): Promise<ChallengeSubmission[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.submissionsCollection,
          where('challengeId', '==', challengeId),
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as ChallengeSubmission));
    } catch (error) {
      console.error('Error getting all submissions for challenge:', error);
      return [];
    }
  }



  // Get a single challenge
  async getChallenge(challengeId: string): Promise<Challenge | null> {
    try {
      const docRef = doc(this.firestore, 'challenges', challengeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Challenge;
      }
      return null;
    } catch (error) {
      console.error('Error getting challenge:', error);
      return null;
    }
  }

  // Get user's submissions for a challenge
  async getUserSubmissions(challengeId: string): Promise<ChallengeSubmission[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.submissionsCollection,
          where('challengeId', '==', challengeId),
          where('userId', '==', this.authService.currentUser?.uid || '')
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (error) {
      console.error('Error getting user submissions:', error);
      return [];
    }
  }

  // Get all submissions for a challenge
  async getChallengeSubmissions(challengeId: string): Promise<ChallengeSubmission[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.submissionsCollection,
          where('challengeId', '==', challengeId)
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (error) {
      console.error('Error getting challenge submissions:', error);
      return [];
    }
  }

  async addChallenge(challenge: Omit<Challenge, 'id' | 'participants' | 'submissions'>) {
    try {
      const newChallenge = {
        ...challenge,
        participants: 0,
        submissions: 0,
        createdBy: this.authService.currentUser?.email || 'admin'
      };
      const docRef = await addDoc(this.challengesCollection, newChallenge);
      return docRef.id;
    } catch (error) {
      console.error('Error adding challenge:', error);
      throw error;
    }
  }

  async voteSubmission(submissionId: string): Promise<void> {
    try {
      const userId = this.authService.currentUser?.uid;
      const username = this.authService.currentUser?.displayName;
      if (!userId || !username) throw new Error('User not authenticated');

      const submissionRef = doc(this.firestore, 'submissions', submissionId);
      const submissionDoc = await getDoc(submissionRef);

      if (!submissionDoc.exists()) throw new Error('Submission not found');

      const submissionData: any = submissionDoc.data();
      const voters = submissionData.voters || [];

      if (voters.some((voter: any) => voter.userId === userId)) {
        throw new Error('User has already voted for this submission');
      }

      await updateDoc(submissionRef, {
        votes: increment(1),
        voters: [...voters, { userId, username }]
      });
    } catch (error) {
      console.error('Error voting for submission:', error);
      throw error;
    }
  }


  async submitChallenge(submission: any): Promise<void> {
    try {
      const userEmail = await this.authService.getUserEmail();
      if (!userEmail) throw new Error('User not authenticated');

      const submissionData = {
        ...submission,
        userEmail,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(this.firestore, 'submissions'), submissionData);
    } catch (error) {
      console.error('Error submitting challenge:', error);
      throw error;
    }
  }

  async joinChallenge(challengeId: string): Promise<void> {
    try {
      const userEmail = await this.authService.getUserEmail();
      if (!userEmail) throw new Error('User not authenticated');

      const participantData = {
        challengeId,
        userEmail,
        joinedAt: new Date().toISOString()
      };

      await addDoc(collection(this.firestore, 'participants'), participantData);
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  async leaveChallenge(challengeId: string): Promise<void> {
    try {
      const userEmail = await this.authService.getUserEmail();
      if (!userEmail) throw new Error('User not authenticated');

      const q = query(
        collection(this.firestore, 'participants'),
        where('challengeId', '==', challengeId),
        where('userEmail', '==', userEmail)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(this.firestore);
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error leaving challenge:', error);
      throw error;
    }
  }

  async isParticipant(challengeId: string): Promise<boolean> {
    try {
      const userEmail = await this.authService.getUserEmail();
      if (!userEmail) return false;

      const q = query(
        collection(this.firestore, 'participants'),
        where('challengeId', '==', challengeId),
        where('userEmail', '==', userEmail)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking participant status:', error);
      return false;
    }
  }

  async getChallengeParticipants(challengeId: string): Promise<string[]> {
    try {
      const q = query(
        collection(this.firestore, 'participants'),
        where('challengeId', '==', challengeId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: any) => doc.data().userEmail);
    } catch (error) {
      console.error('Error getting challenge participants:', error);
      return [];
    }
  }

  async getDemoChallenges(): Promise<Challenge[]> {
    return [
      {
        title: "Traditional Sushi Making",
        description: "Master the art of making traditional Japanese sushi rolls",
        cuisine: "japanese",
        difficulty: "medium",
        ingredients: [
          "2 cups sushi rice",
          "2 cups water",
          "1/4 cup rice vinegar",
          "1 tablespoon sugar",
          "1/2 teaspoon salt",
          "4 sheets nori",
          "Assorted fillings (cucumber, avocado, raw fish)",
          "Soy sauce for serving"
        ],
        steps: [
          "Rinse rice until water runs clear",
          "Cook rice in rice cooker or on stovetop",
          "Mix rice vinegar, sugar, and salt",
          "Fold vinegar mixture into cooked rice",
          "Place nori on bamboo mat",
          "Spread rice on nori",
          "Add fillings",
          "Roll tightly using bamboo mat",
          "Cut into 6-8 pieces"
        ],
        tips: [
          "Use slightly warm rice for best results",
          "Wet your hands to prevent rice sticking",
          "Don't overfill the rolls",
          "Use a very sharp knife for cutting"
        ],
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "admin",
        participants: 0,
        submissions: 0
      },
      {
        title: "Authentic Italian Pizza",
        description: "Create a perfect Neapolitan-style pizza from scratch",
        cuisine: "italian",
        difficulty: "medium",
        ingredients: [
          "4 cups 00 flour",
          "1.5 cups warm water",
          "2 tsp salt",
          "1 tsp active dry yeast",
          "San Marzano tomatoes",
          "Fresh mozzarella",
          "Fresh basil",
          "Extra virgin olive oil"
        ],
        steps: [
          "Mix flour, water, salt, and yeast",
          "Knead dough for 10-15 minutes",
          "Let rise for 4-24 hours",
          "Divide into balls and rest",
          "Stretch dough by hand",
          "Add toppings",
          "Bake at highest oven temperature",
          "Finish with fresh basil"
        ],
        tips: [
          "Use high-protein flour for best results",
          "Cold fermentation develops better flavor",
          "Don't use rolling pin - stretch by hand",
          "Less is more with toppings"
        ],
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "admin",
        participants: 0,
        submissions: 0
      }
    ];
  }
}
