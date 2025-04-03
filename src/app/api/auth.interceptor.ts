import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        const body = event.body;
                        if (body && body.extractToken) {
                            const authorizationHeader = event.headers.get('Authorization');
                            if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
                                const token = authorizationHeader.replace('Bearer ', '');
                                localStorage.setItem('token', token);
                            }
                        }
                    }
                },
                error: (error) => {
                    console.error('Erreur interceptée :', error);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    console.warn('Erreur 401 : Redirection vers login');
                    localStorage.removeItem('token');
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}