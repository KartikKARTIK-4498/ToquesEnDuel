import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import   
 { ForumService } from '../forum.service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css'],
  standalone: true,
  imports:[FormsModule, CommonModule, RouterLink, RouterModule]
})
export class DiscussionComponent implements OnInit {
  topic: any | null = null;
  newReplyContent: string = '';
  isReplyingTo: string | null = null; // To track which reply is being replied to

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const topicId = params.get('id');
      if (topicId) {
        this.fetchTopicDetails(topicId);
      }
    });
  }

  async fetchTopicDetails(topicId: string) {
    try {
      this.topic = await this.forumService.getTopicById(topicId);
      console.log('topic.content', this.topic.content)
    } catch (error) {
      console.error('Error fetching topic details:', error);
      // Handle the error appropriately
    }
  }

  canDeleteReply(reply: any): boolean {
    const currentUserId = this.authService.getUserId();
    return reply.userId === currentUserId || this.topic.createdBy === currentUserId; 
  }

  deleteReply(replyId: string) {
    if (confirm('Are you sure you want to delete this reply?')) {
      this.forumService.deleteReply(this.topic.id, replyId)
        .then(() => {
          // Refresh the topic details after deleting the reply
          this.fetchTopicDetails(this.topic.id);
        })
        .catch(error => {
          console.error('Error deleting reply:', error);
          // Handle the error appropriately
        });
    }
  }

  replyToReply(reply: any) {
    this.isReplyingTo = reply.id;
    this.newReplyContent = ''; // Clear the reply content input
  }

  async addReply(parentReplyId: string | null = null) {
    const currentUserId = this.authService.getUserId();
    const currentUser = await this.authService.getCurrentUser();
    const currentUsername = currentUser?.displayName || 'Anonymous';
    const currentUserImageUrl = currentUser?.photoURL || 'path/to/default-profile-image.jpg';
  
    const newReply = {
      id: this.generateRandomId(), // You'll likely generate a unique ID here
      userId: currentUserId,
      username: currentUsername,
      userImageUrl: currentUserImageUrl,
      content: this.newReplyContent,
      createdOn: new Date().toISOString().slice(0, 16), // Or use serverTimestamp() if you're storing timestamps in Firestore
      replies: [] 
    };

    if (!this.topic.replies) {
      this.topic.replies = [];
    }

    if (parentReplyId) {
      // Find the parent reply and add the new reply to its replies array
      const parentReply = this.findReplyById(this.topic.replies, parentReplyId);
      if (parentReply) {
        parentReply.replies.push(newReply);
      }
    } else {
      // Add the new reply to the main topic's replies array
      this.topic.replies.push(newReply);
    }

    this.newReplyContent = '';
    this.isReplyingTo = null;

    // Update the topic in Firestore (you'll need to implement this in your ForumService)
    this.forumService.updateTopic(this.topic.id, this.topic)
      .then(() => {
        // Handle successful update
      })
      .catch(error => {
        console.error('Error adding reply:', error);
        // Handle the error appropriately
      });
  }

  // Helper function to find a reply by ID (you might need to adjust this based on your data structure)
  private findReplyById(replies: any[], replyId: string): any | null {
    for (const reply of replies) {
      if (reply.id === replyId) {
        return reply;
      } else if (reply.replies && reply.replies.length > 0) {
        const foundReply = this.findReplyById(reply.replies, replyId);
        if (foundReply) {
          return foundReply;
        }
      }
    }
    return null;
  }

  private generateRandomId(): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${randomString}`;   
  
  }

}
