import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ChallengeComponent } from './features/challenge/challenge.component';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/landing',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        // canActivate: [authGuard]
      },
      {
        path: 'challenge',
        component: ChallengeComponent,
        // canActivate: [authGuard]
      },
      
      {
        path: 'community',
        loadComponent: () => 
          import('./features/forum/overview/overview.component').then(m => m.ForumOverviewComponent)
      },
      { 
        path: 'forum/create-topic', 
        loadComponent: () => import('./features/forum/create-topic/create-topic.component').then(m => m.CreateTopicComponent) 
      },
      { 
        path: 'forum/manage-topic', 
        loadComponent: () => import('./features/forum/manage-topic/manage-topic.component').then(m => m.ManageTopicComponent) 
      },
      { 
        path: 'forum/topic/:id', 
        loadComponent: () => import('./features/forum/discussion/discussion.component').then(m => m.DiscussionComponent) 
      },
      { 
        path: 'forum/edit-topic/:id', 
        loadComponent: () => import('./features/forum/create-topic/create-topic.component').then(m => m.CreateTopicComponent) 
      },
      {
        path: 'challenges/:id',
        loadComponent: () => import('./features/challenge/view-challenge/view-challenge.component').then(m => m.ViewChallengeComponent)
      },
      {
        path: 'discovery',
        children: [
          {
            path: '',
            loadComponent: () => 
              import('./features/discovery/discovery-hub/discovery-hub.component').then(m => m.DiscoveryHubComponent)
          },
          {
            path: 'video/:id',
            loadComponent: () => 
              import('./features/discovery/video-detail/video-detail.component').then(m => m.VideoDetailComponent)
          }
        ]
      }
    ]
  },
  {
    path: 'landing',
    component: LandingComponent
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [publicGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
      }
    ]
  }
];
