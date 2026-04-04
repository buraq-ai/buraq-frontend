import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { CreateUserComponent } from './features/admin/users/create-user/create-user';

export const routes: Routes = [
    // Public routes
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    // Authenticated routes
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },

    // Admin only
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SYSTEM_ADMIN'] }
    },

    // Admin or System Admin
    {
        path: 'documents',
        loadComponent: () => import('./features/documents/documents').then(m => m.Documents),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_SYSTEM_ADMIN'] }
    },

    {
        path: 'admin/users/create',
        component: CreateUserComponent,
        canActivate: [roleGuard],
        data: { roles: 'ROLE_SYSTEM_ADMIN' }
    },

    // Unauthorized page
    { path: 'unauthorized', component: UnauthorizedComponent },

    // Fallback
    { path: '**', redirectTo: '/login' }
];