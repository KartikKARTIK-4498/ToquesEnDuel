import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Check localStorage on service initialization
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.router.navigate(['/dashboard']);
    }
  }

  get currentUser(): User | null {
    const savedUser = localStorage.getItem('user');
    return this.auth.currentUser || (savedUser ? JSON.parse(savedUser) : null);
  }

  getUserId() {
    return this.currentUser?.uid;
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      await this.router.navigate(['/dashboard']);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      await this.router.navigate(['/dashboard']);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      await this.router.navigate(['/dashboard']);
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      // Clear user data from localStorage
      localStorage.removeItem('user');
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getUserEmail() {
    return this.auth.currentUser?.email;
  }
}
