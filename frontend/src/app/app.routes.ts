import { Routes } from '@angular/router';
import { InstructorDashboard } from './pages/instructor-dashboard/instructor-dashboard';
import { HomeComponent } from './pages/home/home';
import { Analytics } from './components/analytics/analytics';
import { CertificateComponent } from './components/certificate/certificate';
import { AssignmentsComponent } from './components/assignments/assignments';
import { EnrollmentComponent } from './components/enrollment/enrollment';
import { CoursesComponent } from './components/courses/courses';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { DiscussionsComponent } from './components/discussions/discussions';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.About)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register)
  },
  {
    path: 'verification',
    loadComponent: () => import('./pages/verification/verification').then(m => m.VerificationComponent)
  },
  {
    path: 'instructor-dashboard',
    component: InstructorDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['instructor', 'admin'] }
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
    canActivate: [AuthGuard]
  },
  {
    path: 'instructors',
    loadComponent: () => import('./pages/instructors/instructors').then(m => m.Instructors)
  },
  {
    path: 'analytics',
    component: Analytics,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['instructor', 'admin'] }
  },
  {
    path: 'certificates',
    component: CertificateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'assignments',
    component: AssignmentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'enrollment',
    component: EnrollmentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'courses',
    component: CoursesComponent,
    // No guard here so all users can see all courses
  },
  {
    path: 'mycourses',
    loadComponent: () => import('./pages/mycourses/mycourses').then(m => m.Mycourses),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./components/users/users').then(m => m.Users),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./components/users/user-detail').then(m => m.UserDetail),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./components/users/user-edit').then(m => m.UserEdit),
  },
  {
    path: 'content',
    loadComponent: () => import('./components/content/content').then(m => m.Content),
    canActivate: [AuthGuard]
  },
  {
    path: 'content/:courseId/:enrollmentId',
    loadComponent: () => import('./components/content/content').then(m => m.Content),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-editor/:courseId',
    loadComponent: () => import('./pages/course-editor/course-editor').then(m => m.CourseEditor),
    canActivate: [AuthGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized').then(m => m.Unauthorized)
  },
  {
    path: 'discussions',
    component: DiscussionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'courses/:courseId/discussions',
    component: DiscussionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];
