import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('Intercepteur actif. URL de la requête :', req.url);

        return next.handle(req).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        console.log('Réponse interceptée pour URL :', req.url);

                        const body = event.body; 
                        if (body && body.extractToken) {
                            console.log('ExtractToken est activé pour cette réponse.');

                            const authorizationHeader = event.headers.get('Authorization');
                            if (authorizationHeader) {
                                console.log('Header Authorization trouvé :', authorizationHeader);

                                if (authorizationHeader.startsWith('Bearer ')) {
                                    const token = authorizationHeader.replace('Bearer ', '');
                                    console.log('Token extrait :', token);

                                    localStorage.setItem('token', token);
                                    console.log('Token sauvegardé dans le localStorage.');
                                } else {
                                    console.log('Le header Authorization ne contient pas de Bearer Token.');
                                }
                            } else {
                                console.log('Header Authorization introuvable.');
                            }
                        } else {
                            console.log('ExtractToken est désactivé pour cette réponse.');
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
