import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export interface RoleGuardData {
  roles: string[];
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: any): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkRole(route.data);
  }

  canActivateChild(childRoute: any): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkRole(childRoute.data);
  }

  private checkRole(data: RoleGuardData): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        const requiredRoles = data.roles || [];
        const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.includes(user.role);

        if (hasRequiredRole) {
          return true;
        } else {
          // Redirect to unauthorized page or specified redirect
          const redirectTo = data.redirectTo || '/unauthorized';
          this.router.navigate([redirectTo]);
          return false;
        }
      })
    );
  }
} 