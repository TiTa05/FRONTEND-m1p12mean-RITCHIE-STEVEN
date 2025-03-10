import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) {}

    getCall(url: string): Observable<any> {
        return this.http.get(url);
    }

    postCall(url: string, data: any): Observable<any> {
        return this.http.post(url, data);
    }

    putCall(url: string, data: any): Observable<any> {
        return this.http.put(url, data);
    }

    deleteCall(url: string): Observable<any> {
        return this.http.delete(url);
    }
}
