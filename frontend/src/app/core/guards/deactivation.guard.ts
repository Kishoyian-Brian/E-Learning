import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeactivationGuard implements CanDeactivate<CanComponentDeactivate> {
  
  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    if (!component.canDeactivate) {
      return true;
    }

    const result = component.canDeactivate();
    
    if (result instanceof Observable) {
      return result;
    } else if (result instanceof Promise) {
      return result;
    } else {
      return result;
    }
  }
} 