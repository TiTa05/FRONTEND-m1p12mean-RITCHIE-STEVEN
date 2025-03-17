import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiRoutes } from '../../api/api.routes';
import { ApiCalls } from '../../api/api-calls.abstractclass';
@Component({
    selector: 'app-example',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div>
            <h1>Test des Appels API</h1>
            <button (click)="testGet()">Tester GET</button>
            <button (click)="testPost()">Tester POST</button>
            <button (click)="testPut()">Tester PUT</button>
            <button (click)="testDelete()">Tester DELETE</button>
            <div *ngIf="response">
                <h2>Réponse :</h2>
                <pre>{{ response | json }}</pre>
            </div>
        </div>
    `
})
export class ApiCallTest extends ApiCalls implements OnInit {
    response: any;

    constructor(apiRoutes: ApiRoutes) {
        super(apiRoutes);
    }

    ngOnInit(): void {}

    testGet(): void {
        this.apiRoutes.getArticles().subscribe({
            next: (data) => {
                this.response = data;
                console.log('GET Response:', data);
            },
            error: (err) => console.error('Erreur GET:', err)
        });
    }

    testPost(): void {
        const newArticle = { title: 'Nouvel Article', content: 'Contenu du nouvel article' };
        this.apiRoutes.postArticles(newArticle).subscribe({
            next: (data) => {
                this.response = data;
                console.log('POST Response:', data);
            },
            error: (err) => console.error('Erreur POST:', err)
        });
    }

    testPut(): void {
        const updatedArticle = { title: 'Article Mis à Jour', content: 'Contenu mis à jour' };
        this.apiRoutes.putArticles(100, updatedArticle).subscribe({
            next: (data) => {
                this.response = data;
                console.log('PUT Response:', data);
            },
            error: (err) => console.error('Erreur PUT:', err)
        });
    }

    testDelete(): void {
        this.apiRoutes.deleteArticles(2).subscribe({
            next: () => {
                this.response = { message: 'Article supprimé' };
                console.log('DELETE Response: Article supprimé');
            },
            error: (err) => console.error('Erreur DELETE:', err)
        });
    }
}