import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, UserResponse } from '../../../../core/services/user';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {

  users: UserResponse[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Confirmation dialog state
  showConfirmDialog = false;
  selectedUser: UserResponse | null = null;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        console.log('Users received:', data);
        console.log('Is array:', Array.isArray(data));
        this.users = data;
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('isLoading:', this.isLoading);
        console.log('users length:', this.users.length);
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  openConfirmDialog(user: UserResponse): void {
    this.selectedUser = user;
    this.showConfirmDialog = true;
  }

  cancelDeactivation(): void {
    this.showConfirmDialog = false;
    this.selectedUser = null;
  }

  confirmDeactivation(): void {
    if (!this.selectedUser) return;

    this.userService.deactivateUser(this.selectedUser.id).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(u =>
          u.id === updatedUser.id ? updatedUser : u
        );
        this.successMessage = `${updatedUser.fullName} has been deactivated successfully.`;
        this.errorMessage = '';
        this.showConfirmDialog = false;
        this.selectedUser = null;
        this.cdr.detectChanges();

        // Auto-hide after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to deactivate user.';
        this.successMessage = '';
        this.showConfirmDialog = false;
        this.selectedUser = null;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 3000);

        
      }
    });
  }
}