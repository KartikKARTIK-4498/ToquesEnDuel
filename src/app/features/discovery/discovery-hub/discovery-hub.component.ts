import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChallengeService } from '../../../core/services/challenge.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-discovery-hub',
  templateUrl: './discovery-hub.component.html',
  styleUrls: ['./discovery-hub.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DiscoveryHubComponent implements OnInit {
  activeChallenge$: Observable<any> | undefined;
  submissions: any;
  sortedSubmissions: any[] = [];

  constructor(private challengeService: ChallengeService) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  async loadLeaderboard() {
    try {
      const { challenge, submissions } = await this.challengeService.getLatestActiveChallengeAndSubmissions();
      
      if (challenge) {
        this.activeChallenge$ = new Observable(observer => observer.next(challenge));
      }

      if (submissions) {
        this.submissions = submissions;
        // Sort submissions by votes and add rank
        this.sortedSubmissions = submissions
          .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
          .map((submission: any, index: number) => ({
            ...submission,
            rank: index + 1
          }));
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  getRemainingDays(endDate: any): number {
    if (!endDate) return 0;
    const end = new Date(endDate.seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
