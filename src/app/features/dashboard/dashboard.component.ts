import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../../core/services/auth.service';
import { ChallengeService, Challenge } from '../../core/services/challenge.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  @ViewChild('mediaModal') mediaModal!: ElementRef<HTMLDialogElement>;
  
  successMessage = '';
  errorMessage = '';
  challenges: Challenge[] = [];
  activeChallenge: any;
  allSubmissions: any[] = [];
  timelineDays: any[] = [];
  currentDay = 1;
  remainingDays = 0;
  selectedMedia: string | null = null;
  expandedNotes: Set<string> = new Set();
  isAuthenticated = false;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private challengeService: ChallengeService,
    private router: Router,
    @Inject(DOCUMENT) public document: Document
  ) {
    this.isAuthenticated = !!this.authService.currentUser;
  }

  async ngOnInit() {
    this.isAuthenticated = !!this.authService.currentUser;
    
    try {
      const activeChallenges = await this.challengeService.getActiveChallenges();
      this.activeChallenge = activeChallenges[0];
      
      if (this.activeChallenge) {
        this.allSubmissions = await this.challengeService.getAllSubmissions(this.activeChallenge.id);
        this.updateTimelineDays();
        this.calculateRemainingDays();
      }
      
      console.log('Active Challenge:', this.activeChallenge);
      console.log('All Submissions:', this.allSubmissions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.errorMessage = 'Failed to load dashboard data';
    }
  }

  updateTimelineDays() {
    if (!this.activeChallenge) return;

    const startDate = new Date(this.activeChallenge.startDate.seconds * 1000);
    const endDate = new Date(this.activeChallenge.endDate.seconds * 1000);
    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    this.timelineDays = Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        day: i + 1,
        date: date.toLocaleDateString(),
        isToday: this.isSameDay(date, today),
        isPast: date < today
      };
    });

    // Calculate current day
    this.currentDay = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  calculateRemainingDays() {
    if (!this.activeChallenge?.endDate) return;
    
    const endDate = new Date(this.activeChallenge.endDate.seconds * 1000);
    const today = new Date();
    
    // Calculate the difference in days
    const diffTime = endDate.getTime() - today.getTime();
    this.remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  async voteSubmission(submissionId: string) {
    try {
      await this.challengeService.voteSubmission(submissionId);
      // Refresh submissions after voting
      if (this.activeChallenge?.id) {
        this.allSubmissions = await this.challengeService.getAllSubmissions(this.activeChallenge.id);
      }
    } catch (error) {
      console.error('Error voting for submission:', error);
      this.errorMessage = 'Failed to vote for submission';
    }
  }

  viewActiveChallenge() {
       this.router.navigate(['/challenges']);
    // if (this.activeChallenge?.id) {
    //   this.router.navigate(['/challenges', this.activeChallenge.id]);
    // }
  }

  get userEmail(): string {
    return this.authService.currentUser?.email || '';
  }

  isPortrait(video: HTMLVideoElement): boolean {
    return video.videoHeight > video.videoWidth;
  }

  onVideoLoad(event: Event) {
    const video = event.target as HTMLVideoElement;
    video.classList.add('object-contain', 'bg-blue-500');
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.classList.add('object-contain', 'bg-blue-500');
  }

  openMediaModal(mediaUrl: string) {
    console.log('Opening modal for media:', mediaUrl);
    this.selectedMedia = mediaUrl;
    if (this.mediaModal?.nativeElement) {
      this.mediaModal.nativeElement.showModal();
    }
  }
  
  closeMediaModal() {
    this.selectedMedia = null;
    if (this.mediaModal?.nativeElement) {
      this.mediaModal.nativeElement.close();
    }
  }

  // Video Player Controls
  togglePlay(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  isPlaying(video: HTMLVideoElement): boolean {
    return video && !video.paused;
  }

  toggleMute(video: HTMLVideoElement) {
    video.muted = !video.muted;
  }

  isMuted(video: HTMLVideoElement): boolean {
    return video && video.muted;
  }

  getProgress(video: HTMLVideoElement): number {
    if (!video) return 0;
    return (video.currentTime / video.duration) * 100;
  }

  seekVideo(event: MouseEvent, video: HTMLVideoElement) {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    video.currentTime = percentage * video.duration;
  }

  toggleNoteExpansion(submissionId: string) {
    if (this.expandedNotes.has(submissionId)) {
      this.expandedNotes.delete(submissionId);
    } else {
      this.expandedNotes.add(submissionId);
    }
  }

  isNoteExpanded(submissionId: string): boolean {
    return this.expandedNotes.has(submissionId);
  }

  shouldShowMoreButton(text: string): boolean {
    return text.length > 100; // Adjusted for 2 lines of text
  }

  getTruncatedText(text: string): string {
    if (!text) return '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  toggleFullscreen(video: HTMLVideoElement) {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  }
}
