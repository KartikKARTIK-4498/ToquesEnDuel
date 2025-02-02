import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface Recipe {
  id: number;
  title: string;
  image: string;
}

interface RecipeVideo {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
}

interface Challenge {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  image: string;
  status: 'upcoming' | 'completed';
}

interface CommunityMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent {

  constructor(private router: Router) {}

  activeTab: 'upcoming' | 'completed' = 'upcoming';
  selectedDateRange: string = '';
  memberCount: number = 2.4;

  featuredRecipe: Recipe = {
    id: 1,
    title: 'Spicy Chicken Kebab',
    image: 'assets/recipes/chicken-kebab.jpg',
  };

  recipeVideos: RecipeVideo[] = [
    {
      id: 1,
      title: 'Velvet Blueberry Mousse',
      videoUrl: 'assets/videos/blueberry-mousse.mp4',
      thumbnailUrl: 'assets/spot1.png'
    },
    {
      id: 2,
      title: 'Spicy Chicken Kebab',
      videoUrl: 'assets/videos/chicken-kebab.mp4',
      thumbnailUrl: 'assets/spot2.png'
    },
    {
      id: 3,
      title: 'Silken White Sauce Pasta',
      videoUrl: 'assets/videos/white-sauce-pasta.mp4',
      thumbnailUrl: 'assets/spot3.png'
    }
  ];

  communityMembers: CommunityMember[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Food Creator',
      avatar: 'assets/rev1.png'
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      role: 'Chef',
      avatar: 'assets/rev2.png'
    },
    {
      id: 3,
      name: 'James Kim',
      role: 'Food Blogger',
      avatar: 'assets/rev1.png'
    },
    {
      id: 4,
      name: 'Lisa Wang',
      role: 'Food Creator',
      avatar: 'assets/rev2.png'
    }
  ];

  challenges: Challenge[] = [
    {
      id: 1,
      title: 'Italian Week Challenge',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 0, 7),
      image: 'assets/challenges/italian.jpg',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Asian Fusion Week',
      startDate: new Date(2024, 0, 8),
      endDate: new Date(2024, 0, 14),
      image: 'assets/challenges/asian.jpg',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Mediterranean Delights',
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 0, 21),
      image: 'assets/challenges/mediterranean.jpg',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'French Cuisine Week',
      startDate: new Date(2024, 0, 22),
      endDate: new Date(2024, 0, 28),
      image: 'assets/challenges/french.jpg',
      status: 'upcoming'
    }
  ];

  currentTestimonial = 0;

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Riya Kapoor',
      role: 'Food Creator',
      avatar: 'assets/rev1.png',
      content: 'My sister and I used a recipe from this platform and loved it! The easy instructions and great community features made cooking together a blast. We\'re excited to try more!'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      role: 'Chef',
      avatar: 'assets/rev2.png',
      content: 'The community here is amazing! I\'ve learned so many new techniques and made great friends. The weekly challenges keep me motivated to try new recipes.'
    }
  ];

  setActiveTab(tab: 'upcoming' | 'completed') {
    this.activeTab = tab;
  }

  getFilteredChallenges() {
    return this.challenges.filter(challenge => challenge.status === this.activeTab);
  }

  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentTestimonial = this.currentTestimonial === 0 
      ? this.testimonials.length - 1 
      : this.currentTestimonial - 1;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  login() {
    this.router.navigate(['/auth/login']);
    }

}
