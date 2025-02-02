import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

export interface UploadProgress {
  progress: number;
  downloadUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) {}

  async uploadFile(file: File, path: string): Promise<UploadProgress> {
    try {
      const storageRef = ref(this.storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<UploadProgress>((resolve, reject) => {
        let lastProgress = 0;
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            // Only update if progress has changed
            if (progress > lastProgress) {
              lastProgress = progress;
              // Don't resolve here, just call the progress callback if needed
            }
          },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ progress: 100, downloadUrl });
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error initiating upload:', error);
      throw error;
    }
  }
}
