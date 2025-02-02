import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChallengeService, Challenge, ChallengeSubmission } from '../../../core/services/challenge.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StorageService, UploadProgress } from '../../../core/services/storage.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-challenge',
  templateUrl: './view-challenge.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ViewChallengeComponent implements OnInit {
  challenge: Challenge | null = null;
  submissions: ChallengeSubmission[] = [];
  participants: string[] = [];
  errorMessage = '';
  showSubmissionForm = false;
  hasSubmitted = false;
  isParticipant = false;
  isJoining = false;
  submissionForm: FormGroup;
  uploadProgress: { [key: string]: number } = {};
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  isUploading = false;

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private storageService: StorageService,
    private fb: FormBuilder
  ) {
    this.submissionForm = this.fb.group({
      notes: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit() {
    const challengeId = this.route.snapshot.paramMap.get('id');
    if (challengeId) {
      this.loadChallenge(challengeId);
    }
  }

  async loadChallenge(challengeId: string) {
    try {
      const challenge = await this.challengeService.getChallenge(challengeId);
      if (challenge) {
        this.challenge = challenge;
        this.submissions = await this.challengeService.getChallengeSubmissions(challengeId);
        console.log('submissions:', this.submissions);
        
        // Check if user has already submitted
        const userSubmissions = await this.challengeService.getUserSubmissions(challengeId);
        this.hasSubmitted = userSubmissions.length > 0;
        // Get participants and check if user is participating
        this.participants = await this.challengeService.getChallengeParticipants(challengeId);
        this.isParticipant = await this.challengeService.isParticipant(challengeId);
      } else {
        this.errorMessage = 'Challenge not found.';
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      this.errorMessage = 'Failed to load challenge details.';
    }
  }

  isVideo(url: string): boolean {
    return url?.toLowerCase().match(/\.(mp4|webm|ogg)$/) !== null;
  }

  isImage(url: string): boolean {
    return url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) !== null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.errorMessage = '';
      
      // Convert FileList to Array and filter valid files
      const newFiles = Array.from(input.files).filter(file => {
        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          this.errorMessage = 'Please select only image or video files.';
          return false;
        }
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          this.errorMessage = 'Each file should not exceed 10MB.';
          return false;
        }
        return true;
      });

      // Limit total files to 5
      if (this.selectedFiles.length + newFiles.length > 5) {
        this.errorMessage = 'You can upload a maximum of 5 files.';
        return;
      }

      // Add new files and create previews
      for (const file of newFiles) {
        this.selectedFiles.push(file);
        this.createPreview(file);
      }

      // Reset input
      input.value = '';
    }
  }

  createPreview(file: File) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      this.previewUrls.push(videoUrl);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    delete this.uploadProgress[index];
  }

  async uploadFiles(): Promise<string[]> {
    if (!this.selectedFiles.length) return [];
    
    try {
      this.isUploading = true;
      this.errorMessage = '';
      
      const uploadPromises = this.selectedFiles.map(async (file, index) => {
        try {
          const path = file.type.startsWith('image/') ? 'images' : 'videos';
          const result = await this.storageService.uploadFile(
            file,
            `challenges/${path}`
          );
          
          if (!result.downloadUrl) {
            throw new Error(`Failed to get download URL for file: ${file.name}`);
          }
          
          this.uploadProgress[index] = 100;
          return result.downloadUrl;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          this.uploadProgress[index] = 0;
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter((url): url is string => url !== null);
      
      if (validUrls.length === 0) {
        throw new Error('No files were uploaded successfully');
      }
      
      if (validUrls.length !== this.selectedFiles.length) {
        this.errorMessage = 'Some files failed to upload. You can try again or proceed with the successfully uploaded files.';
      }
      
      return validUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to upload files. Please try again.';
      return [];
    } finally {
      this.isUploading = false;
    }
  }

  async submitChallenge() {
    if (!this.submissionForm.valid || !this.challenge?.id || this.hasSubmitted || this.selectedFiles.length === 0) {
      return;
    }

    try {
      this.errorMessage = '';
      const mediaUrls = await this.uploadFiles();
      
      if (mediaUrls.length === 0) {
        return; // Error message is already set in uploadFiles
      }

      const submission = {
        challengeId: this.challenge.id,
        ...this.submissionForm.value,
        mediaUrls
      };
      
      await this.challengeService.submitChallenge(submission);
      this.showSubmissionForm = false;
      this.submissionForm.reset({
        rating: 5
      });
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
      // Reload challenge data to show new submission
      await this.loadChallenge(this.challenge.id);
      this.errorMessage = '';
    } catch (error) {
      console.error('Error submitting challenge:', error);
      this.errorMessage = 'Failed to submit challenge. Please try again.';
    }
  }

  toggleSubmissionForm() {
    this.showSubmissionForm = !this.showSubmissionForm;
    if (!this.showSubmissionForm) {
      this.submissionForm.reset({
        rating: 5
      });
      this.selectedFiles = [];
      this.previewUrls = [];
      this.uploadProgress = {};
    }
  }

  async toggleParticipation() {
    if (!this.challenge?.id) return;
    
    try {
      this.isJoining = true;
      if (this.isParticipant) {
        await this.challengeService.leaveChallenge(this.challenge.id);
        this.isParticipant = false;
      } else {
        await this.challengeService.joinChallenge(this.challenge.id);
        this.isParticipant = true;
      }
      // Reload participants
      this.participants = await this.challengeService.getChallengeParticipants(this.challenge.id);
    } catch (error) {
      console.error('Error toggling participation:', error);
      this.errorMessage = 'Failed to update participation status.';
    } finally {
      this.isJoining = false;
    }
  }

  getDaysLeft(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
