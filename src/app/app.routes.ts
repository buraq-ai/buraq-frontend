import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { CreateUserComponent } from './features/admin/users/create-user/create-user';
import { EditUserComponent } from './features/admin/users/edit-user/edit-user';
import { UserListComponent } from './features/admin/users/user-list/user-list';
import { AiQueryComponent } from './features/dashboard/ai-query/ai-query';
import { TicketDetailComponent } from './features/tickets/ticket-detail/ticket-detail';

export const routes: Routes = [
    // Public routes
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    // Authenticated routes — accessible by all logged-in users
    {
        path: 'dashboard',
        component: AiQueryComponent,
        canActivate: [authGuard]
    },

    // Ticket statistics dashboard — System Admin only
    {
        path: 'dashboard/stats',
        loadComponent: () => import('./features/dashboard/ticket-stats/ticket-stats')
            .then(m => m.TicketStatsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SYSTEM_ADMIN'] }
    },

    // AI Metrics dashboard — System Admin only
    {
        path: 'dashboard/ai-metrics',
        loadComponent: () => import('./features/dashboard/ai-metrics/ai-metrics')
            .then(m => m.AiMetricsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SYSTEM_ADMIN'] }
    },

        // System Health dashboard — System Admin only
    {
        path: 'dashboard/health',
        loadComponent: () => import('./features/dashboard/health/health')
            .then(m => m.HealthComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SYSTEM_ADMIN'] }
    },
        
        // Tickets — authenticated employees
    {
        path: 'tickets',
        loadComponent: () => import('./features/tickets/my-tickets/my-tickets').then(m => m.MyTicketsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'tickets/:id',
        component: TicketDetailComponent,
        canActivate: [authGuard]
    },

        // Agent dashboard — Support Agent or System Admin
    {
        path: 'agent/tickets',
        loadComponent: () => import('./features/agent/tickets/agent-ticket-list/agent-ticket-list')
            .then(m => m.AgentTicketListComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SUPPORT_AGENT', 'ROLE_SYSTEM_ADMIN'] }
    },

        // Admin ticket management — System Admin only
    {
        path: 'admin/tickets',
        loadComponent: () => import('./features/admin/tickets/admin-ticket-list/admin-ticket-list')
            .then(m => m.AdminTicketListComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SYSTEM_ADMIN'] }
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
    {
        path: 'admin/users/edit/:id',
        component: EditUserComponent,
        data: { roles: 'ROLE_SYSTEM_ADMIN' }
    },
    {
        path: 'admin/users',
        component: UserListComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROLE_SYSTEM_ADMIN'] }
    },

    // Unauthorized page
    { path: 'unauthorized', component: UnauthorizedComponent },

    // Fallback
    { path: '**', redirectTo: '/login' }
];