import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importer le Router
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { getUserId } from '../../../utils/utils';

@Component({
    selector: 'app-reparation-assigned-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule, ProgressBarModule, ButtonModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Reparations Assigned to Mechanic'"
            [data]="reparations()"
            [columns]="columns"
            [loading]="loading"
            [rows]="10"
            [globalFilterFields]="['vehicleRegistration', 'clientName', 'status']"
            [customTemplates]="{ manage: manageTemplate }"
        >
            <ng-template #manageTemplate let-rowData>
                <div class="action-buttons">
                    <button
                        pButton
                        icon="pi pi-fw pi-angle-double-right"
                        [rounded]="true"
                        [outlined]="true"
                        class="p-button-success mr-2"
                        (click)="onComplete(rowData)"
                    ></button>
                </div>
            </ng-template>
        </app-data-table>
    `,
    providers: [MessageService]
})
export class ReparationAssignedMechanicList extends ApiCalls implements OnInit {
    reparations = signal<any[]>([]);
    loading: boolean = true;
    id: string | null = null;

    columns: ColumnDefinition[] = [
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
            field: 'status',
            header: 'Status',
            filterType: 'text',
            style: { 'min-width': '10rem' }
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
            field: 'manage',
            header: 'Manage',
            template: 'manage',
            style: { 'min-width': '12rem', 'text-align': 'center' }
        }
    ];

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private router: Router
    ) {
        super(apiRoutes);
        const token = localStorage.getItem('token');
        this.id = token ? getUserId(token) : null;
    }

    ngOnInit() {
        this.loadReparations();
    }

    loadReparations() {
        this.apiRoutes.getReparationAssignedToAMechanic(this.id || '').subscribe({
            next: (data) => {
                const transformedData = data.map((reparation: any) => ({
                    ...reparation,
                    clientName: reparation.depositId?.vehicleId?.clientId
                        ? `${reparation.depositId.vehicleId.clientId.firstName} ${reparation.depositId.vehicleId.clientId.lastName}`
                        : 'N/A',
                    vehicleRegistration: reparation.depositId?.vehicleId?.registrationNumber || 'N/A',
                    startDate: reparation.startedAt ? new Date(reparation.startedAt) : null,
                    completedDate: reparation.completedAt ? new Date(reparation.completedAt) : null,
                    status: reparation.status || 'N/A'
                }));

                this.reparations.set(transformedData);
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

    onComplete(reparation: any) {
        this.router.navigate(['/reparation/reparation-details-mechanic', reparation._id]);
    }
}