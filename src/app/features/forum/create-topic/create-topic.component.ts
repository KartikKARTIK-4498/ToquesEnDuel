import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ForumService } from '../forum.service';
import { Router, ActivatedRoute, RouterLink, RouterModule } from '@angular/router';


import { FormControlName, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { from, Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-topic',
  templateUrl: './create-topic.component.html',
  styleUrls: ['./create-topic.component.css'],
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule, ReactiveFormsModule, ]
})
export class CreateTopicComponent implements OnInit  {
  // @ViewChild('content') contentTextarea!: ElementRef;
  topic: any = {
    title: '',
    content: '',
  };
  topicId: string | null = null;
  isEditing: boolean = false;




  constructor(
    private forumService: ForumService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.topicId = params.get('id'); 
      if (this.topicId) {
        this.isEditing = true; 
        this.fetchTopicDetails();
      }
    });
  }



  async fetchTopicDetails() {
    if (this.topicId) {
      try {
        this.topic = await this.forumService.getTopicById(this.topicId);
      
      } catch (error) {
        console.error('Error fetching topic details:', error);
      }
    }
  }

  async submitTopic() {
    const currentUser = await this.authService.getCurrentUser(); 
    if (currentUser) { 
      this.topic.createdBy = currentUser.uid;
      this.topic.createdByUsername = currentUser.displayName || '';
    } else {
      alert('user not found');
      return;
    }

    if (this.isEditing) {
      this.forumService.updateTopic(this.topicId!, this.topic)
        .then(() => {
          alert('Topic updated successfully!');
          this.router.navigate(['community']);
        })
        .catch(error => {
          console.error('Error updating topic:', error);
        });
    } else {
      this.forumService.createTopic(this.topic)
        .then(() => {
          alert('Topic created successfully!');
          this.router.navigate(['community']);
        })
        .catch(error => {
          console.error('Error creating topic:', error);
        });
    }
  }

  onContentChange(content: any) {
    this.topic.content = content;
  }

  // onImageUpload(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.forumService.uploadImage(file, 'topic_images/') 
  //       .then(downloadURL => {
  //         // Insert the image into the editor at the current cursor position
  //         const img = <img src="${downloadURL}" alt="Uploaded Image">;
  //         this.topic.content += img; 
  //       })
  //       .catch(error => {
  //         console.error('Error uploading image:', error);
  //         // Handle the error appropriately
  //       });
  //   }
  // }

}