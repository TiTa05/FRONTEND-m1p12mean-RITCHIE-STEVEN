import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Fleet } from '../../models/fleet.interface';

@Component({
    selector: 'app-fleet-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Fleets'"
            [data]="fleets()"
            [columns]="columns"
            [loading]="loading"
            [globalFilterFields]="['place', 'vehicleId', 'clientName']"
        >
        </app-data-table>
    `,
    providers: [MessageService]
})
export class FleetList extends ApiCalls implements OnInit {
    fleets = signal<Fleet[]>([]);
    loading: boolean = true;

    columns: ColumnDefinition[] = [
        {
            field: 'place',
            header: 'Place',
            filterType: 'text',
            style: { 'min-width': '10rem' }
        },
        {
            field: 'vehicleId.registrationNumber',
            header: 'Vehicle',
            filterType: 'text',
            style: { 'min-width': '14rem' }
        },
        {
            field: 'clientName',
            header: 'Client',
            filterType: 'text',
            style: { 'min-width': '14rem' }
        },
    ];

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService
    ) {
        super(apiRoutes);
    }

    ngOnInit() {
        this.apiRoutes.getFleets().subscribe({
            next: (data) => {
                const transformedData = data.map((fleet: any) => ({
                    ...fleet,
                    clientName: fleet.vehicleId?.clientId
                        ? `${fleet.vehicleId.clientId.firstName} ${fleet.vehicleId.clientId.lastName}`
                        : ''
                }));
                this.fleets.set(transformedData);
                this.loading = false;
            },
            error: (err: any) => {
                const errorMessage = err.error?.message || 'An unexpected error occurred. Please try again later.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data fetch Failed',
                    detail: errorMessage
                });
                this.loading = false;
            }
        });
    }
}