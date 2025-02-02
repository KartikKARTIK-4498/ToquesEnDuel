import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    try {
      await this.authService.login(
        this.loginForm.get('email')?.value,
        this.loginForm.get('password')?.value
      );
      this.router.navigate(['/']);
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    this.error = '';

    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  signInWithGoogle() {
    // Implement Google Sign-in logic
    console.log('Sign in with Google clicked');
  }

  continueAsGuest() {
    localStorage.setItem('guest', 'true');
    this.router.navigate(['/dashboard']);

    // Implement guest login logic
    console.log('Continue as guest clicked');
  }
}
