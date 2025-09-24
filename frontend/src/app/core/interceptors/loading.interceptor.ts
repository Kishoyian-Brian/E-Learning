import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.totalRequests++;
    this.showLoading();

    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.hideLoading();
        }
      })
    );
  }

  private showLoading(): void {
    // You can inject a loading service here
    // this.loadingService.show();
    
    // For now, we'll use a simple approach
    const loadingElement = document.getElementById('global-loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  }

  private hideLoading(): void {
    // You can inject a loading service here
    // this.loadingService.hide();
    
    // For now, we'll use a simple approach
    const loadingElement = document.getElementById('global-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
} 