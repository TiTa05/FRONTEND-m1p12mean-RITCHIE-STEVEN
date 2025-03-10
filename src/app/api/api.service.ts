import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) {}

    private getHeaders(includeToken: boolean = true): HttpHeaders {
        const headers = new HttpHeaders();
        if (includeToken) {
            const token = localStorage.getItem('token');
            if (token) {
                return headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return headers;
    }

    getCall(url: string, includeToken: boolean = true): Observable<any> {
        return this.http.get(url, { headers: this.getHeaders(includeToken) });
    }

    postCall(url: string, data: any, includeToken: boolean = true): Observable<any> {
        return this.http.post(url, data, { headers: this.getHeaders(includeToken) });
    }

    putCall(url: string, data: any, includeToken: boolean = true): Observable<any> {
        return this.http.put(url, data, { headers: this.getHeaders(includeToken) }); 
    }

    deleteCall(url: string, includeToken: boolean = true): Observable<any> {
        return this.http.delete(url, { headers: this.getHeaders(includeToken) }); 
    }
}
