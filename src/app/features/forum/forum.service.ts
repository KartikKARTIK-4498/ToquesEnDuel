import { Injectable } from '@angular/core';
import { 
    Firestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    Timestamp,
    serverTimestamp,
    getDoc,
    query,
    where
} from '@angular/fire/firestore';
import { getDownloadURL, Storage, uploadBytes } from '@angular/fire/storage';
import { ref } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  constructor(private firestore: Firestore, private storage: Storage) {} 

  async createTopic(topicData: any) {
    try {
      const topicsCollection = collection(this.firestore, 'topics');
      
      // Add `createdOn` and `updatedOn` timestamps
      topicData.createdOn = new Date().toISOString().slice(0, 16);
      topicData.updatedOn = new Date().toISOString().slice(0, 16);

      const docRef = await addDoc(topicsCollection, topicData);
      console.log('Topic created with ID:', docRef.id);
      return docRef.id; 
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  async getAllTopics(): Promise<any[]> {
    try {
      const topicsCollection = collection(this.firestore, 'topics');
      const querySnapshot = await getDocs(topicsCollection);

      const topics: any = [];
      querySnapshot.forEach((doc) => {
        const topicData = doc.data();
        topics.push({ id: doc.id, ...topicData });
      });

      return topics;
    } catch (error) {
      console.error('Error fetching all topics:', error);
      return [];
    }
  }

  async getTopicById(topicId: string): Promise<any> {
    try {
      const topicDocRef = doc(this.firestore, 'topics', topicId);
      const docSnap = await getDoc(topicDocRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.error('Topic not found with ID:', topicId);
        throw new Error('Topic not found'); 
      }
    } catch (error) {
      console.error('Error fetching topic by ID:', error);
      throw error;
    }
  }

  async updateTopic(topicId: string, topicData: any) {
    try {
      const topicDocRef = doc(this.firestore, 'topics', topicId);

      // Update `updatedOn` timestamp
      topicData.updatedOn = new Date().toISOString().slice(0, 16);


      await updateDoc(topicDocRef, topicData);
      console.log('Topic updated successfully:', topicId);
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  }

  async deleteTopic(topicId: string) {
    try {
      const topicDocRef = doc(this.firestore, 'topics', topicId);
      await deleteDoc(topicDocRef);
      console.log('Topic deleted successfully:', topicId);
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  async deleteReply(topicId: string, replyId: string) {
    try {
      const topicDocRef = doc(this.firestore, 'topics', topicId);
      const topicSnap = await getDoc(topicDocRef);

      if (topicSnap.exists()) {
        const topicData: any = topicSnap.data();
        const updatedReplies = this.deleteReplyRecursively(topicData.replies, replyId);

        await updateDoc(topicDocRef, { replies: updatedReplies });
        console.log('Reply deleted successfully:', replyId);
      } else {
        console.error('Topic not found with ID:', topicId);
        throw new Error('Topic not found');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }

  private deleteReplyRecursively(replies: any[], replyIdToDelete: string): any[] {
    return replies.map(reply => {
      if (reply.id === replyIdToDelete) {
        return null; // Delete this reply and its sub-replies
      } else if (reply.replies && reply.replies.length > 0) {
        reply.replies = this.deleteReplyRecursively(reply.replies, replyIdToDelete).filter(r => r !== null); 
      }
      return reply; 
    }).filter(r => r !== null);
  }

  async uploadImage(file: File, folderPath: string = 'topic_images/'): Promise<string> {
    const filePath = `${folderPath}${new Date().getTime()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async getTopicsCreatedByUser(userId: string): Promise<any[]> {
    try {
      const topicsQuery = query(collection(this.firestore, 'topics'), where('createdBy', '==', userId));
      const querySnapshot = await getDocs(topicsQuery);

      const topics: any = [];
      querySnapshot.forEach((doc) => {
        const topicData = doc.data();
        topics.push({ id: doc.id, ...topicData });
      });

      return topics;
    } catch (error) {
      console.error('Error fetching topics created by user:', error);
      return [];
    }
  }

}