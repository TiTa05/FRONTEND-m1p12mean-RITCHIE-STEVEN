import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        const body = event.body;
                        if (body && body.extractToken) {
                            const authorizationHeader = event.headers.get('Authorization');
                            if (authorizationHeader) {
                                if (authorizationHeader.startsWith('Bearer ')) {
                                    const token = authorizationHeader.replace('Bearer ', '');

                                    localStorage.setItem('token', token);
                                }
                            }
                        }
                    }
                },
                error: (error) => {
                    console.error('Erreur interceptée :', error);
                }
            })
        );
    }
}
