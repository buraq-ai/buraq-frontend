import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css'
})
export class CreateUserComponent {

  createUserForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;
  createdUser: any = null;

  roles = [
    { value: 'ROLE_EMPLOYEE', label: 'Employee' },
    { value: 'ROLE_SUPPORT_AGENT', label: 'Support Agent' },
    { value: 'ROLE_HR_ADMIN', label: 'HR Admin' },
    { value: 'ROLE_SYSTEM_ADMIN', label: 'System Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.createUserForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', [Validators.required]]
    });
  }

  get f() {
    return this.createUserForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.createUserForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.createdUser = null;

    this.userService.createUser(this.createUserForm.value).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.createdUser = response;
          this.successMessage = 'User created successfully!';
          this.createUserForm.reset();
        });
      },
      error: (err: any) => {
        console.log('Full error object:', err);

        this.ngZone.run(() => {
          this.isLoading = false;

          if (err.status === 409) {
            this.errorMessage = err.error?.message || 'A user with this email already exists.';
          } else if (err.status === 403) {
            this.errorMessage = 'You do not have permission to create users.';
          } else if (err.status === 400) {
            this.errorMessage = 'Please check the form data and try again.';
          } else {
            this.errorMessage = 'Something went wrong. Please try again.';
          }

          console.log('Setting error message:', this.errorMessage);

          this.cdr.detectChanges();
        });
      }
    });
  }

  createAnother() {
    this.successMessage = '';
    this.errorMessage = '';
    this.createdUser = null;
  }

  goToUsersList() {
    this.router.navigate(['/admin/users']);
  }
}