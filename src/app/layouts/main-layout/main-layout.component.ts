import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChallengeService } from '../../core/services/challenge.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  userPhotoUrl: string = 'assets/default-avatar.png';
  userName: string = '';
  isDropdownOpen = false;
  isAuthenticated = false;
  activeChallenge: any;
  showRedDot: boolean = false;
  isDropdownOpen2: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private challengeService: ChallengeService
  ) {
    this.isAuthenticated = !!this.authService.currentUser;
  }

  ngOnInit() {
    this.isAuthenticated = !!this.authService.currentUser;
    this.loadUserProfile();
    this.checkActiveChallenge();
  }

  async loadUserProfile() {
    const user = await this.authService.currentUser
    if (user) {
      this.userPhotoUrl = user.photoURL || 'assets/default-avatar.png';
      this.userName = user.displayName || 'User';
    }
  }

  async checkActiveChallenge() {
    const activeChallenges = await this.challengeService.getActiveChallenges();
    this.activeChallenge = activeChallenges[0];
    const viewedChallengeId = localStorage.getItem('viewedChallengeId');
    this.showRedDot = !viewedChallengeId || viewedChallengeId !== this.activeChallenge?.id;
  }

  viewChallenge() {
    if (this.activeChallenge) {
      localStorage.setItem('viewedChallengeId', this.activeChallenge.id);
      this.showRedDot = false;
      this.isDropdownOpen2 = true; // Open dropdown when viewing challenge
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdown2() {
    this.isDropdownOpen2 = !this.isDropdownOpen2;
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  get currentRoute(): string {
    return this.router.url;
  }
}
