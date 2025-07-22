import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  usernameOrEmail = '';
  password = '';

  auth = inject(AuthService);
  router = inject(Router);

  onLogin() {
    this.auth.login(this.usernameOrEmail, this.password).subscribe({
      next: () => {
        alert('Login successful');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error.message || 'Login failed');
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
