import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { getUserId } from '../../../utils/utils';

@Component({
    selector: 'app-reparation-rejected-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule, ProgressBarModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Rejected Reparations'"
            [data]="rejectedReparations()"
            [columns]="columns"
            [loading]="loading"
            [rows]="10"
            [globalFilterFields]="['clientName', 'refusalReason', 'vehicleRegistration', 'appointmentDate', 'typeOfRepairs', 'status']"
        >
        </app-data-table>
    `,
    providers: [MessageService]
})
export class ReparationRejectedList extends ApiCalls implements OnInit {
    rejectedReparations = signal<any[]>([]);
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
            field: 'appointmentDate',
            header: 'Appointment Date',
            filterType: 'date',
            template: 'date',
            style: { 'min-width': '14rem' }
        },
        {
            field: 'typeOfRepairs',
            header: 'Type of Repairs',
            filterType: 'text',
            style: { 'min-width': '18rem' }
        },
        {
            field: 'refusalReason',
            header: 'Refusal Reason',
            filterType: 'text',
            style: { 'min-width': '14rem' }
        },
        {
            field: 'status',
            header: 'Status',
            filterType: 'text',
            style: { 'min-width': '12rem' }
        }
    ];

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService
    ) {
        super(apiRoutes);
        const token = localStorage.getItem('token');
        this.id = token ? getUserId(token) : null;
    }

    ngOnInit() {
        this.loadReparationRejected();
    }

    loadReparationRejected() {
        this.apiRoutes.getReparationRejectedByClientId(this.id || '').subscribe({
            next: (data) => {
                const transformedData = data.map((reparation: any) => ({
                    ...reparation,
                    vehicleRegistration: reparation.depositId?.vehicleId?.registrationNumber || 'N/A',
                    appointmentDate: reparation.depositId?.appointmentDate
                        ? new Date(reparation.depositId.appointmentDate).toLocaleDateString()
                        : 'N/A',
                    typeOfRepairs: reparation.depositId?.typeReparationIds ? reparation.depositId.typeReparationIds.map((type: any) => type.label).join(', ') : 'N/A',
                    refusalReason: reparation.refusalReason || 'No reason provided',
                    status: reparation.status || 'N/A'
                }));

                this.rejectedReparations.set(transformedData);
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
