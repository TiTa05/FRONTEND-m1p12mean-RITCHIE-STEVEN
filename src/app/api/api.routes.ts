// src/app/api.routes.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class ApiRoutes {
    private host = 'http://localhost:3000';
    private articleUrl = `${this.host}/articles`;

    constructor(private apiService: ApiService) {}

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
