import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Fleet } from '../../models/fleet.interface';

@Component({
    selector: 'app-fleet-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule, ProgressBarModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Fleets'"
            [data]="fleets()"
            [columns]="columns"
            [loading]="loading"
            [rows]="12"
            [globalFilterFields]="['place', 'reparationId', 'clientName', 'startDate', 'status']"
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
            field: 'vehicleRegistration',
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
        {
            field: 'startDate',
            header: 'Start Date',
            filterType: 'date',
            template: 'date',
            style: { 'min-width': '12rem' }
        },
        {
            field: 'completedDate',
            header: 'Completed Date',
            filterType: 'date',
            template: 'date',
            style: { 'min-width': '12rem' }
        },
        {
            field: 'status',
            header: 'Status',
            filterType: 'text',
            style: { 'min-width': '12rem' }
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
                const transformedData = data.map((fleet: any) => {
                    const status = fleet.reparationId?.status || 'N/A';

                    return {
                        ...fleet,
                        clientName: fleet.reparationId?.depositId?.vehicleId?.clientId
                            ? `${fleet.reparationId.depositId.vehicleId.clientId.firstName} ${fleet.reparationId.depositId.vehicleId.clientId.lastName}`
                            : '',
                        vehicleRegistration: fleet.reparationId?.depositId?.vehicleId?.registrationNumber || 'N/A',
                        startDate: fleet.reparationId?.startedAt ? new Date(fleet.reparationId.startedAt) : null,
                        completedDate: fleet.reparationId?.completedAt ? new Date(fleet.reparationId.completedAt) : null,
                        status: status
                    };
                });

                this.fleets.set(transformedData);
                this.loading = false;
            },
            error: (err: any) => {
                const errorMessage = err.error?.message || 'An unexpected error occurred. Please try again later.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data Fetch Failed',
                    detail: errorMessage
                });
                this.loading = false;
            }
        });
    }
}