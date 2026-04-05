import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css'
})
export class EditUserComponent implements OnInit {

  editForm: FormGroup;
  userId!: number;
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  roles = ['ROLE_EMPLOYEE', 'ROLE_SUPPORT_AGENT', 'ROLE_ADMIN', 'ROLE_SYSTEM_ADMIN'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('User ID from route:', this.userId);
    console.log('Token:', localStorage.getItem('accessToken'));

    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        console.log('User data received:', user);
        this.editForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          password: ''
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error fetching user:', err);
        this.errorMessage = 'Failed to load user details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) return;

    // Only send fields that have values
    const formValue = this.editForm.value;
    const payload: any = {
      fullName: formValue.fullName,
      email: formValue.email,
      role: formValue.role
    };

    // Only include password if admin actually typed one
    if (formValue.password && formValue.password.trim() !== '') {
      payload.password = formValue.password;
    }

    this.isSubmitting = true;
    this.userService.updateUser(this.userId, payload).subscribe({
      next: () => {
        this.successMessage = 'User updated successfully!';
        this.errorMessage = '';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Update error:', err);
        this.errorMessage = err.error?.message || 'Failed to update user.';
        this.successMessage = '';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
}