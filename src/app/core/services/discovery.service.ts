import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  getDoc,
  addDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { CulturalArticle, CulturalVideo, Quiz, QuizAttempt } from '../models/discovery.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DiscoveryService {
  private readonly ITEMS_PER_PAGE = 9;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Articles
  getArticles(
    category?: string,
    cuisine?: string,
    lastDoc?: DocumentSnapshot<any>
  ): Observable<CulturalArticle[]> {
    const articlesRef = collection(this.firestore, 'articles');
    let q = query(articlesRef, orderBy('publishDate', 'desc'), limit(this.ITEMS_PER_PAGE));

    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (cuisine) {
      q = query(q, where('cuisine', '==', cuisine));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return collectionData(q).pipe(
      map(articles => articles as CulturalArticle[])
    );
  }

  getArticleById(id: string): Observable<CulturalArticle | null> {
    const articleRef = doc(this.firestore, 'articles', id);
    return from(getDoc(articleRef)).pipe(
      map(doc => doc.exists() ? doc.data() as CulturalArticle : null)
    );
  }

  async likeArticle(articleId: string): Promise<void> {
    const articleRef = doc(this.firestore, 'articles', articleId);
    const userId = this.authService.currentUser?.uid;
    
    if (!userId) throw new Error('User must be logged in to like articles');

    const likesRef = doc(this.firestore, 'article-likes', `${articleId}_${userId}`);
    const likeDoc = await getDoc(likesRef);

    if (likeDoc.exists()) {
      throw new Error('You have already liked this article');
    }

    return updateDoc(articleRef, {
      likes: this.authService.currentUser?.uid
    });
  }

  // Videos
  getVideos(
    category?: string,
    cuisine?: string,
    lastDoc?: DocumentSnapshot<any>
  ): Observable<CulturalVideo[]> {
    const videosRef = collection(this.firestore, 'videos');
    let q = query(videosRef, orderBy('publishDate', 'desc'), limit(this.ITEMS_PER_PAGE));

    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (cuisine) {
      q = query(q, where('cuisine', '==', cuisine));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return collectionData(q).pipe(
      map(videos => videos as CulturalVideo[])
    );
  }

  getVideoById(id: string): Observable<CulturalVideo | null> {
    const videoRef = doc(this.firestore, 'videos', id);
    return from(getDoc(videoRef)).pipe(
      map(doc => doc.exists() ? doc.data() as CulturalVideo : null)
    );
  }

  async likeVideo(videoId: string): Promise<void> {
    const videoRef = doc(this.firestore, 'videos', videoId);
    const userId = this.authService.currentUser?.uid;
    
    if (!userId) throw new Error('User must be logged in to like videos');

    const likesRef = doc(this.firestore, 'video-likes', `${videoId}_${userId}`);
    const likeDoc = await getDoc(likesRef);

    if (likeDoc.exists()) {
      throw new Error('You have already liked this video');
    }

    return updateDoc(videoRef, {
      likes: this.authService.currentUser?.uid
    });
  }

  // Quizzes
  getQuizzes(
    cuisine?: string,
    difficulty?: string,
    lastDoc?: DocumentSnapshot<any>
  ): Observable<Quiz[]> {
    const quizzesRef = collection(this.firestore, 'quizzes');
    let q = query(quizzesRef, orderBy('title'), limit(this.ITEMS_PER_PAGE));

    if (cuisine) {
      q = query(q, where('cuisine', '==', cuisine));
    }

    if (difficulty) {
      q = query(q, where('difficulty', '==', difficulty));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return collectionData(q, { idField: 'id' }).pipe(
      map(quizzes => quizzes as Quiz[])
    );
  }

  getQuizById(id: string): Observable<Quiz | null> {
    const quizRef = doc(this.firestore, 'quizzes', id);
    return from(getDoc(quizRef)).pipe(
      map(doc => {
        if (!doc.exists()) return null;
        return { id: doc.id, ...doc.data() } as Quiz;
      })
    );
  }

  async startQuizAttempt(quizId: string): Promise<string> {
    const userId = this.authService.currentUser?.uid;
    if (!userId) throw new Error('User must be logged in to start a quiz');

    const attemptData: Partial<QuizAttempt> = {
      userId,
      quizId,
      startTime: new Date(),
      answers: [],
      completed: false
    };

    const attemptsRef = collection(this.firestore, 'quiz-attempts');
    const docRef = await addDoc(attemptsRef, attemptData);
    return docRef.id;
  }

  async submitQuizAnswer(
    attemptId: string,
    questionId: string,
    selectedAnswer: number,
    correct: boolean,
    points: number
  ): Promise<void> {
    const attemptRef = doc(this.firestore, 'quiz-attempts', attemptId);
    const attempt = await getDoc(attemptRef);

    if (!attempt.exists()) {
      throw new Error('Quiz attempt not found');
    }

    const attemptData = attempt.data() as QuizAttempt;
    if (attemptData.completed) {
      throw new Error('Quiz attempt already completed');
    }

    const answer = {
      questionId,
      selectedAnswer,
      correct,
      points
    };

    return updateDoc(attemptRef, {
      answers: [...attemptData.answers, answer]
    });
  }

  async completeQuizAttempt(
    attemptId: string,
    score: number,
    maxScore: number
  ): Promise<void> {
    const attemptRef = doc(this.firestore, 'quiz-attempts', attemptId);
    const attempt = await getDoc(attemptRef);

    if (!attempt.exists()) {
      throw new Error('Quiz attempt not found');
    }

    const attemptData = attempt.data() as QuizAttempt;
    if (attemptData.completed) {
      throw new Error('Quiz attempt already completed');
    }

    // Update quiz statistics
    const quizRef = doc(this.firestore, 'quizzes', attemptData.quizId);
    const quiz = await getDoc(quizRef);
    
    if (quiz.exists()) {
      const quizData = quiz.data() as Quiz;
      const newCompletions = (quizData.completions || 0) + 1;
      const newAverageScore = (
        (quizData.averageScore || 0) * (quizData.completions || 0) + (score / maxScore * 100)
      ) / newCompletions;

      await updateDoc(quizRef, {
        completions: newCompletions,
        averageScore: newAverageScore
      });
    }

    // Complete the attempt
    return updateDoc(attemptRef, {
      completed: true,
      endTime: new Date(),
      score,
      maxScore
    });
  }

  getUserQuizAttempts(userId: string): Observable<QuizAttempt[]> {
    const attemptsRef = collection(this.firestore, 'quiz-attempts');
    const q = query(
      attemptsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(attempts => attempts as QuizAttempt[])
    );
  }
}
