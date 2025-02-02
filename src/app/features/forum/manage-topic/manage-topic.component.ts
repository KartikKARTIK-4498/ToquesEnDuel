import { Component, OnInit } from '@angular/core';
import { ForumService } from '../forum.service';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-manage-topic',
  templateUrl: './manage-topic.component.html',
  styleUrls: ['./manage-topic.component.css'],
  standalone: true,
  imports:[RouterLink, RouterModule, CommonModule]
})
export class ManageTopicComponent implements OnInit {
  myTopics: any[] = [];

  constructor(
    private forumService: ForumService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchMyTopics();
  }

  async fetchMyTopics() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.myTopics = await this.forumService.getTopicsCreatedByUser(userId);
    } else {
      // Handle the case where the user is not authenticated
      console.error('User not authenticated. Cannot fetch topics.');
    }
  }

  deleteTopic(topicId: string) {
    if (confirm('Are you sure you want to delete this topic?')) {
      this.forumService.deleteTopic(topicId)
        .then(() => {
          this.myTopics = this.myTopics.filter(t => t.id !== topicId);
        })
        .catch(error => {
          console.error('Error deleting topic:', error);
          // Handle the error appropriately
        });
    }
  }
}