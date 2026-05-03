import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService, UserResponse, UserSearchFilters } from '../../../../core/services/user';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit, OnDestroy {

  // --- Data ---
  users: UserResponse[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // --- Filters ---
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  // --- Pagination ---
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // --- Side Panel ---
  selectedUser: UserResponse | null = null;
  showPanel = false;

  // --- Confirmation Dialog ---
  showConfirmDialog = false;
  userToDeactivate: UserResponse | null = null;

  // --- Search Debounce ---
  private searchSubject = new Subject<string>();
  private searchSubscription: any;

  // --- Role Options ---
  roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'ROLE_EMPLOYEE', label: 'Employee' },
    { value: 'ROLE_SUPPORT_AGENT', label: 'Support Agent' },
    { value: 'ROLE_ADMIN', label: 'HR Admin' },
    { value: 'ROLE_SYSTEM_ADMIN', label: 'System Admin' }
  ];

  // --- Status Options ---
  statusOptions = [
    { value: '', label: 'All Users' },
    { value: 'true', label: 'Active Only' },
    { value: 'false', label: 'Inactive Only' }
  ];

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // --------------------------------------------------
  //  SEARCH DEBOUNCE SETUP
  // --------------------------------------------------

  private setupSearchDebounce(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),           // wait 300ms after last keystroke
        distinctUntilChanged()       // skip if same value as previous
      )
      .subscribe(() => {
        this.currentPage = 0;        // reset to first page on new search
        this.fetchUsers();
      });
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  // --------------------------------------------------
  //  FILTER CHANGE HANDLERS
  // --------------------------------------------------

  onRoleChange(): void {
    this.currentPage = 0;
    this.fetchUsers();
  }

  onStatusChange(): void {
    this.currentPage = 0;
    this.fetchUsers();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.searchSubject.next('');     // trigger debounced search with empty value
    this.fetchUsers();               // immediate reload without waiting for debounce
  }

  // --------------------------------------------------
  //  PAGINATION
  // --------------------------------------------------

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchUsers();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Returns array of page numbers for pagination controls (max 5)
  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // "Showing 1 to 10 of 55 users"
  get fromRecord(): number {
    if (this.totalElements === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  get toRecord(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  // --------------------------------------------------
  //  SIDE PANEL
  // --------------------------------------------------

  openPanel(user: UserResponse): void {
    this.selectedUser = user;
    this.showPanel = true;
  }

  closePanel(): void {
    this.selectedUser = null;
    this.showPanel = false;
  }

  navigateToEdit(): void {
    if (this.selectedUser) {
      this.router.navigate(['/admin/users/edit', this.selectedUser.id]);
    }
  }

  // --------------------------------------------------
  //  DEACTIVATION (from panel or table)
  // --------------------------------------------------

  openConfirmDialog(user: UserResponse): void {
    this.userToDeactivate = user;
    this.showConfirmDialog = true;
  }

  cancelDeactivation(): void {
    this.userToDeactivate = null;
    this.showConfirmDialog = false;
  }

  confirmDeactivation(): void {
    if (!this.userToDeactivate) return;

    this.userService.deactivateUser(this.userToDeactivate.id).subscribe({
      next: (updatedUser) => {
        // Update user in the local list
        this.users = this.users.map(u =>
          u.id === updatedUser.id ? updatedUser : u
        );
        // Update selected user if panel is open for this user
        if (this.selectedUser && this.selectedUser.id === updatedUser.id) {
          this.selectedUser = updatedUser;
        }
        this.successMessage = `${updatedUser.fullName} has been deactivated.`;
        this.errorMessage = '';
        this.userToDeactivate = null;
        this.showConfirmDialog = false;
        this.autoClearMessages();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to deactivate user.';
        this.successMessage = '';
        this.userToDeactivate = null;
        this.showConfirmDialog = false;
        this.autoClearMessages();
      }
    });
  }

  // --------------------------------------------------
  //  API CALL
  // --------------------------------------------------

  loadUsers(): void {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: UserSearchFilters = {
      page: this.currentPage,
      size: this.pageSize
    };

    // Only add filters if they have values
    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }
    if (this.selectedRole) {
      filters.role = this.selectedRole;
    }
    if (this.selectedStatus !== '' && this.selectedStatus !== null) {
      filters.active = this.selectedStatus === 'true';
    }

    this.userService.searchUsers(filters).subscribe({
      next: (response) => {
        this.users = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        this.autoClearMessages();
      }
    });
  }

  // --------------------------------------------------
  //  UTILITY
  // --------------------------------------------------

  private autoClearMessages(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}