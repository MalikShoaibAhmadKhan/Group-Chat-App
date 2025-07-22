import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  profileForm = this.createForm();
  photoPreview: string | ArrayBuffer | null = null;

  ngOnInit() {
    this.userService.fetchProfile();
    this.userService.userChanges().subscribe(user => {
      if (user) {
        this.profileForm.patchValue({ name: user.username });
        if (user.photo) this.photoPreview = user.photo;
      }
    });
  }

  createForm() {
    return this.fb.group({
      name: ['', Validators.required],
      password: [''],
      newPassword: [''],
      photo: [null as File | null | undefined],
    });
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.profileForm.patchValue({ photo: file });
      const reader = new FileReader();
      reader.onload = e => this.photoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    const formData = new FormData();
    const value = this.profileForm.value;
    formData.append('name', value.name || '');
    formData.append('password', value.password || '');
    formData.append('newPassword', value.newPassword || '');
    if (value.photo) formData.append('photo', value.photo);
    this.userService.updateProfile(formData);
    alert('Profile saved!');
    if (typeof window !== 'undefined') {
      window.location.reload(); // Force reload to use new token everywhere
    }
  }
} 