import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  username = '';
  password = '';

  auth = inject(AuthService);
  router = inject(Router);

  onRegister() {
    this.auth.register(this.username, this.password).subscribe({
      next: () => {
        alert('Registration successful. Please login.');
        this.router.navigate(['/login']);
      },
      error: (err: { error: { message?: string } }) => {
        alert(err.error?.message || 'Registration failed');
      },
    });
  }
}
