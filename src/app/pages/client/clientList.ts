import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { User } from '../../models/user.interface';
@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Clients'"
            [data]="users()"
            [columns]="columns"
            [loading]="loading"
            [globalFilterFields]="['firstName', 'lastName', 'email', 'phoneNumber']"
        >
        </app-data-table>
    `,
    providers: [MessageService]
})
export class ClientList extends ApiCalls implements OnInit {
    users = signal<User[]>([]);
    loading: boolean = true;

    columns: ColumnDefinition[] = [
        {
            field: 'picture',
            header: 'Picture',
            template: 'picture',
            style: { 'min-width': '10rem' }
        },
        {
            field: 'firstName',
            header: 'First Name',
            filterType: 'text',
            style: { 'min-width': '10rem' }
        },
        {
            field: 'lastName',
            header: 'Last Name',
            filterType: 'text',
            style: { 'min-width': '10rem' }
        },
        {
            field: 'phoneNumber',
            header: 'Phone Number',
            filterType: 'text',
            style: { 'min-width': '10rem' }
        },
        {
            field: 'email',
            header: 'Email',
            filterType: 'text',
            style: { 'min-width': '14rem' }
        }
    ];

    constructor( 
        apiRoutes: ApiRoutes, 
        private messageService: MessageService
    ) {
        super(apiRoutes);
    }

    ngOnInit() {
        this.apiRoutes.getClients().subscribe({
            next: (data) => {
                this.users.set(data);
                this.loading = false;
            },
            error: (err: any) => {
                const errorMessage = err.error?.message || 'An unexpected error occurred. Please try again later.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data fetch Failed',
                    detail: errorMessage
                });
            }
        });
    }
}
