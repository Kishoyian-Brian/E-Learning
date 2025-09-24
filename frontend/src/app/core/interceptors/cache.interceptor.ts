import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // Check if request should be cached
    const cacheKey = this.getCacheKey(request);
    const cachedResponse = this.getCachedResponse(cacheKey);

    if (cachedResponse) {
      return of(new HttpResponse({ body: cachedResponse }));
    }

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cacheResponse(cacheKey, event.body);
        }
      })
    );
  }

  private getCacheKey(request: HttpRequest<any>): string {
    return `${request.method}:${request.url}:${JSON.stringify(request.params)}`;
  }

  private getCachedResponse(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private cacheResponse(key: string, data: any): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL
    };
    this.cache.set(key, entry);
  }

  // Method to clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Method to clear specific cache entry
  clearCacheEntry(url: string): void {
    for (const [key] of this.cache) {
      if (key.includes(url)) {
        this.cache.delete(key);
      }
    }
  }
} 