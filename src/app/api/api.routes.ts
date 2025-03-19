// src/app/api.routes.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class ApiRoutes {
    private host = 'http://localhost:5000';
    private loginUrl = `${this.host}/auth/login`;
    private clientUrl = `${this.host}/auth/client`;
    private articleUrl = `${this.host}/articles`;

    constructor(private apiService: ApiService) {}

    // login
    login(data: any): Observable<any> {
        return this.apiService.postCall(this.loginUrl, data, false);
    }
    // client
    signUp(data: any): Observable<any> {
        return this.apiService.postCall(this.clientUrl, data, false);
    }

    getClients(): Observable<any> {
        return this.apiService.getCall(this.clientUrl);
    }
    // articles test
    getArticles(): Observable<any> {
        return this.apiService.getCall(this.articleUrl);
    }

    postArticles(data: any): Observable<any> {
        return this.apiService.postCall(this.articleUrl, data);
    }

    putArticles(id: number,data: any): Observable<any> {
        return this.apiService.putCall(`${this.articleUrl}/${id}`, data);
    }

    deleteArticles(id: number): Observable<any> {
        return this.apiService.deleteCall(`${this.articleUrl}/${id}`);
    }
}
