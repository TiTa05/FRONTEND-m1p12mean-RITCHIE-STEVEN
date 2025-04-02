import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { getUserId, getUserRole } from '../../../utils/utils';
@Component({
    selector: 'app-reparation-recovered-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule, ProgressBarModule, ButtonModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Recovered Reparations'"
            [data]="reparations()"
            [columns]="columns"
            [loading]="loading"
            [rows]="10"
            [globalFilterFields]="['vehicleRegistration', 'clientName', 'status']"
            [customTemplates]="{ details: detailsTemplate }"
        >
            <ng-template #detailsTemplate let-rowData>
                <div class="action-buttons">
                    <button
                        pButton
                        icon="pi pi-fw pi-eye"
                        [rounded]="true"
                        [outlined]="true"
                        class="p-button-info"
                        (click)="viewDetails(rowData)"
                    ></button>
                </div>
            </ng-template>
        </app-data-table>
    `,
    providers: [MessageService]
})
export class ReparationRecoveredList extends ApiCalls implements OnInit {
    reparations = signal<any[]>([]);
    loading: boolean = true;
    userId!: string | null;
    userType!: number | null;

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
            field: 'recoveredDate',
            header: 'Recovered Date',
            filterType: 'date',
            template: 'date',
            style: { 'min-width': '12rem' }
        },
        {
            field: 'details',
            header: 'Details',
            template: 'details',
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
        this.userId = token ? getUserId(token) : '';
        this.userType = token ? getUserRole(token) : null;
    }

    ngOnInit() {
        this.loadReparations();
    }

    loadReparations() {
        if(this.userType === 1){
            this.apiRoutes.getReparationByStatusAndClient('recovered',this.userId || '').subscribe({
                next: (data) => {
                    const transformedData = data.map((reparation: any) => ({
                        ...reparation,
                        _id: reparation._id,
                        clientName: reparation.depositId?.vehicleId?.clientId
                            ? `${reparation.depositId.vehicleId.clientId.firstName} ${reparation.depositId.vehicleId.clientId.lastName}`
                            : 'N/A',
                        vehicleRegistration: reparation.depositId?.vehicleId?.registrationNumber || 'N/A',
                        startDate: reparation.startedAt ? new Date(reparation.startedAt) : null,
                        completedDate: reparation.completedAt ? new Date(reparation.completedAt) : null,
                        recoveredDate: reparation.recoveredAt ? new Date(reparation.recoveredAt) : null,
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
        else{
            this.apiRoutes.getReparationByStatus('recovered').subscribe({
                next: (data) => {
                    const transformedData = data.map((reparation: any) => ({
                        ...reparation,
                        _id: reparation._id,
                        clientName: reparation.depositId?.vehicleId?.clientId
                            ? `${reparation.depositId.vehicleId.clientId.firstName} ${reparation.depositId.vehicleId.clientId.lastName}`
                            : 'N/A',
                        vehicleRegistration: reparation.depositId?.vehicleId?.registrationNumber || 'N/A',
                        startDate: reparation.startedAt ? new Date(reparation.startedAt) : null,
                        completedDate: reparation.completedAt ? new Date(reparation.completedAt) : null,
                        recoveredDate: reparation.recoveredAt ? new Date(reparation.recoveredAt) : null,
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
        
    }

    viewDetails(reparation: any) {
        this.router.navigate(['/reparation/reparation-details', reparation._id]);
    }
}