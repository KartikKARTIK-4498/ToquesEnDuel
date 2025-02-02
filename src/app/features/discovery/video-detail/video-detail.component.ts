import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DiscoveryService } from '../../../core/services/discovery.service';
import { CulturalVideo } from '../../../core/models/discovery.model';
import { Observable, switchMap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.scss']
})
export class VideoDetailComponent implements OnInit {
  video$: Observable<CulturalVideo | null>;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private discoveryService: DiscoveryService,
    private sanitizer: DomSanitizer
  ) {
    this.video$ = this.route.params.pipe(
      switchMap(params => this.discoveryService.getVideoById(params['id']))
    );
  }

  ngOnInit() {}

  async likeVideo(videoId: string) {
    try {
      await this.discoveryService.likeVideo(videoId);
    } catch (error: any) {
      this.error = error.message;
    }
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getReadableDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
