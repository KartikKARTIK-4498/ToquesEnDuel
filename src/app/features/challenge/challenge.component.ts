import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChallengeService, Challenge, ChallengeSubmission } from '../../core/services/challenge.service';
import { StorageService, UploadProgress } from '../../core/services/storage.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ChallengeComponent implements OnInit {
  activeChallenges: any[] = [];
  upcomingChallenges: any[] = [];
  pastChallenges: any[] = [];
  userSubmissions: ChallengeSubmission[] = [];
  showSubmissionForm = false;
  errorMessage: string = '';
  activeTab: 'active' | 'your' | 'upcoming' = 'active';
  timelineDays: { day: number; date: string; isCurrentDay: boolean }[] = [];
  currentChallengeDay: number = 0;
  selectedChallenge: any = null;
  expandedView = false;
  isLoading = true;
  isAuthenticated = false;

  defaultSteps = `Steps to Join the Challenge:
- Login or create account
- Go to Challenges section
- Go to active challenge
- View the challenge details and prepare a dish accordingly.
- Upload the video`;

  defaultInstructions = `- Videos maximum length: 5 minutes
- File Type Supported: Mp4`;

  defaultTip = `Use ingredients that are traditionally associated with the dish's country of origin to highlight its cultural roots and engage viewers effectively.`;

  submissionForm: FormGroup;
  
  submissions: any;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploadProgress: { [key: string]: number } = {};
  isUploading = false;
  hasSubmitted = false;
  yourChallenges: any;
  renderedChallenges: any ;
  constructor(
    private challengeService: ChallengeService,
    private storageService: StorageService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.isAuthenticated = !!this.authService.currentUser;
    this.submissionForm = this.fb.group({
      imageUrl: ['', Validators.required],
      notes: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  async ngOnInit() {
    this.isAuthenticated = !!this.authService.currentUser;
    this.isLoading = true;
    this.loadChallenges();
    this.updateTimelineDays().then(() => {
    });
  }

  async updateTimelineDays() {
    if (this.activeChallenges.length === 0) return;

    const challenge = this.activeChallenges[0];
    const startDate = new Date(challenge.startDate.seconds * 1000);
    const today = new Date();
    
    // Calculate days since challenge start
    const diffTime = today.getTime() - startDate.getTime();
    this.currentChallengeDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Initialize timeline starting from challenge start date
    this.timelineDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const isCurrentDay = date.toDateString() === today.toDateString();
      return {
        day: i + 1,
        date: date.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short'
        }),
        isCurrentDay
      };
    });
  }

  async loadChallenges() {
    try {
      const allChallenges = await this.challengeService.getAllChallenges();
      const now = new Date().getTime() / 1000; // Current time in seconds

      // Sort challenges by start date
      const sortedChallenges = allChallenges.sort((a: any, b: any) => a.startDate.seconds - b.startDate.seconds);

      // Find the first challenge that hasn't ended yet
      const activeIndex = sortedChallenges.findIndex((challenge: any) => challenge.endDate.seconds > now);

      if (activeIndex !== -1) {
        this.activeChallenges = [sortedChallenges[activeIndex]];
        this.upcomingChallenges = sortedChallenges.slice(activeIndex + 1);
        this.pastChallenges = sortedChallenges.slice(0, activeIndex);
      } else {
        this.activeChallenges = [];
        this.upcomingChallenges = [];
        this.pastChallenges = sortedChallenges;
      }

      const usersubmited =await this.challengeService.getSubmissionsAndChallenges();
      this.yourChallenges = usersubmited.challenges;

      console.log('activeChallenges', this.activeChallenges);
      console.log('upcomingChallenges', this.upcomingChallenges);
      console.log('pastChallenges', this.pastChallenges);
console.log('this.upcomingChallenges ', this.upcomingChallenges );

// Update rendered challenges
this.renderedChallenges = this.activeChallenges;

      this.renderedChallenges = this.activeChallenges;
      this.yourChallenges.forEach((yourChallenge: any) => {
        const index = this.activeChallenges.findIndex(activeChallenge => activeChallenge.id === yourChallenge.id);
        if (index !== -1) {
          // this.activeChallenges.splice(index, 1);
        }
      });
      
      console.log('your0', this.yourChallenges);
      this.updateTimelineDays();

      this.isLoading = false;

      console.log('active:', this.activeChallenges);
      console.log('upcoming:', this.upcomingChallenges);
      console.log('past:', this.pastChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      this.errorMessage = 'Failed to load challenges. Please try again.';
    }
  }

  changeChallengeView(view: any) {
    this.activeTab = view;
    if (view === 'active') {
      this.renderedChallenges = this.activeChallenges;
    } else if (view === 'your') {
      this.renderedChallenges = this.yourChallenges;
    } else if (view === 'upcoming') {
      this.renderedChallenges = this.upcomingChallenges;
      console.log('Channleges', this.upcomingChallenges);
    }
  }

  async loadUserSubmissions(challenge: Challenge) {
    if (challenge.id) {
      try {
        this.userSubmissions = await this.challengeService.getUserSubmissions(challenge.id);
      } catch (error) {
        console.error('Error loading user submissions:', error);
        this.errorMessage = 'Failed to load submissions. Please try again.';
      }
    }
  }

  async joinChallenge(challengeId: string) {
    try {
      await this.challengeService.joinChallenge(challengeId);
      this.loadChallenges(); // Refresh challenges after joining
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to join challenge. Please try again.';
      console.error('Error joining challenge:', error);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.errorMessage = '';
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);
        if (this.isValidFile(file)) {
          this.selectedFiles.push(file);
          this.createPreview(file);
          this.uploadProgress[this.selectedFiles.length - 1] = 0;
        }
      }
    }
  }

  isValidFile(file: File): boolean {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    console.log('Validating file:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    if (!validTypes.includes(file.type)) {
      this.errorMessage = `Invalid file type: ${file.type}. Please upload MP4 videos only.`;
      console.error('Invalid file type:', file.type);
      return false;
    }
    
    if (file.size > maxSize) {
      this.errorMessage = `File ${file.name} is too large. Maximum size is 100MB.`;
      console.error('File too large:', file.size);
      return false;
    }
    
    return true;
  }

  createPreview(file: File) {
    if (file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      this.previewUrls.push(videoUrl);
    }
  }

  removeFile(index: number) {
    if (this.previewUrls[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrls[index]);
    }
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    delete this.uploadProgress[index];
  }

  async uploadFiles(): Promise<string[]> {
    if (!this.selectedFiles.length) {
      console.log('No files selected');
      return [];
    }
    
    try {
      this.isUploading = true;
      this.errorMessage = '';
      console.log('Starting upload for', this.selectedFiles.length, 'files');
      
      const uploadPromises = this.selectedFiles.map(async (file, index) => {
        try {
          console.log(`Uploading file ${index + 1}/${this.selectedFiles.length}:`, file.name);
          
          // Create a progress handler
          const progressHandler = (progress: any) => {
            console.log(`Upload progress for ${file.name}:`, progress);
            this.uploadProgress[index] = progress.percentage;
          };
          
          const result = await this.storageService.uploadFile(
            file,
            `challenges/videos/${Date.now()}_${file.name}`,
          );
          
          if (!result?.downloadUrl) {
            throw new Error(`Failed to get download URL for file: ${file.name}`);
          }
          
          console.log('Upload successful for:', file.name);
          console.log('Download URL:', result.downloadUrl);
          this.uploadProgress[index] = 100;
          return result.downloadUrl;
        } catch (error: any) {
          console.error(`Error uploading file ${file.name}:`, error);
          this.uploadProgress[index] = 0;
          this.errorMessage = `Failed to upload ${file.name}. ${error.message || 'Please try again.'}`;
          return null;
        }
      });

      console.log('Waiting for all uploads to complete...');
      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter((url): url is string => url !== null);
      
      console.log('Upload results:', {
        total: results.length,
        successful: validUrls.length,
        failed: results.length - validUrls.length
      });
      
      if (validUrls.length === 0) {
        throw new Error('No files were uploaded successfully');
      }
      
      if (validUrls.length !== this.selectedFiles.length) {
        this.errorMessage = 'Some files failed to upload. You can try again or proceed with the successfully uploaded files.';
      }
      
      return validUrls;
    } catch (error) {
      console.error('Error in uploadFiles:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to upload files. Please try again.';
      return [];
    } finally {
      this.isUploading = false;
    }
  }

  async submitChallenge() {
    if (!this.submissionForm.value.notes || !this.selectedChallenge?.id || this.hasSubmitted || this.selectedFiles.length === 0) {
      return;
    }

    try {
      this.isUploading = true;
      this.errorMessage = '';
      
      const mediaUrls = await this.uploadFiles();
      
      if (mediaUrls.length === 0) {
        return; // Error message is already set in uploadFiles
      }

      const submission = {
        challengeId: this.selectedChallenge.id,
        userId: this.authService.currentUser?.uid,
        username: this.authService.currentUser?.displayName,
        userprofile: this.authService.currentUser?.photoURL,
        ...this.submissionForm.value,
        mediaUrls
      };
      
      await this.challengeService.submitChallenge(submission);
      this.showSubmissionForm = false;
      this.submissionForm.reset();
      this.hasSubmitted = true;
      this.selectedFiles = [];
      this.previewUrls = [];
      this.uploadProgress = {};
      
      // Cleanup object URLs
      this.previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      // Reload challenge data
      await this.loadChallenges();
      this.errorMessage = '';
    } catch (error) {
      console.error('Error submitting challenge:', error);
      this.errorMessage = 'Failed to submit challenge. Please try again.';
    } finally {
      this.isUploading = false;
    }
  }

  toggleSubmissionForm() {
    this.showSubmissionForm = !this.showSubmissionForm;
    if (!this.showSubmissionForm) {
      this.selectedFiles = [];
      this.previewUrls = [];
      this.uploadProgress = {};
      this.submissionForm.reset();
    }
  }

  getDaysLeft(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDaysUntil(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  async viewChallenge(challenge: any) {
    this.selectedChallenge = challenge;
    this.expandedView = this.expandedView ? false : true;
    if (this.expandedView) {
      await this.loadSubmissions(challenge.id);
    }
  }

  async loadSubmissions(challengeId: string) {
    try {
      this.submissions = await this.challengeService.getChallengeSubmissions(challengeId);
      console.log('submissions:', this.submissions);
      
      // Check if user has already submitted
      const userSubmissions: any = await this.challengeService.getUserSubmissions(challengeId);
     this.hasSubmitted = userSubmissions.find((sub: any) => sub.userId === this.authService.currentUser?.uid);
      // this.hasSubmitted = userSubmissions.userId === this.authService.currentUser?.uid;
      console.log('hasSubmitted:', this.hasSubmitted);
      
    } catch (error) {
      console.error('Error loading submissions:', error);
      this.errorMessage = 'Failed to load submissions. Please try again.';
    }
  }

  closeExpandedView() {
    this.expandedView = false;
    this.selectedChallenge = null;
  }
}
