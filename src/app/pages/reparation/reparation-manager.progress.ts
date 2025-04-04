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
    selector: 'app-reparation-manager-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule, ProgressBarModule, ButtonModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Repair Progress Overview'"
            [data]="reparations()"
            [columns]="columns"
            [loading]="loading"
            [rows]="10"
            [globalFilterFields]="['vehicleRegistration', 'clientName', 'status', 'mechanicNames']"
            [customTemplates]="{ manage: manageTemplate }"
        >
        <ng-template #manageTemplate let-rowData>
            <div class="action-buttons">
                <button
                    pButton
                    label="Details"
                    icon="pi pi-fw pi-eye"
                    class="p-button-info"
                    (click)="viewDetails(rowData)"
                ></button>
            </div>
        </ng-template>
        </app-data-table>
    `,
    providers: [MessageService]
})
export class ReparairProgressManager extends ApiCalls implements OnInit {

    reparations = signal<any[]>([]);
    loading: boolean = true;

    columns: ColumnDefinition[] = [
        { field: 'vehicleRegistration', header: 'Vehicle', filterType: 'text', style: { 'min-width': '10rem' }},
        { field: 'model', header: 'Model', filterType: 'text', style: { 'min-width': '10rem' }},
        { field: 'color', header: 'Color', filterType: 'text', style: { 'min-width': '8rem' }},
        { field: 'clientName', header: 'Client', filterType: 'text', style: { 'min-width': '12rem' }},
        { field: 'mechanicNames', header: 'Mechanics', filterType: 'text', style: { 'min-width': '12rem' }},
        { field: 'status', header: 'Status', filterType: 'text', style: { 'min-width': '10rem' }},
        { field: 'startDate', header: 'Start Date', filterType: 'date', template: 'date', style: { 'min-width': '12rem' }},
        { field: 'completedDate', header: 'Completed Date', filterType: 'date', template: 'date', style: { 'min-width': '12rem' }},
        { field: 'manage', header: 'Manage', template: 'manage', style: { 'min-width': '10rem', 'text-align': 'center' }}
    ];

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private router: Router
    ) {
        super(apiRoutes);
    }

    ngOnInit() {
        this.loadAllReparations();
    }

    loadAllReparations() {
        this.apiRoutes.getReparations().subscribe({
            next: (data: any[]) => {
                const transformedData = data
                    .map((rep: any) => ({
                        ...rep,
                        model: rep.depositId?.vehicleId?.model || 'N/A',
                        color: rep.depositId?.vehicleId?.color || 'N/A',
                        vehicleRegistration: rep.depositId?.vehicleId?.registrationNumber || 'N/A',
                        clientName: rep.depositId?.vehicleId?.clientId
                            ? rep.depositId.vehicleId.clientId.firstName + ' ' + rep.depositId.vehicleId.clientId.lastName
                            : 'N/A',
                        mechanicNames: rep.mechanics?.map((m: any) => `${m.firstName} ${m.lastName}`).join(', ') || 'Aucun',
                        startDate: rep.startedAt ? new Date(rep.startedAt) : null,
                        completedDate: rep.completedAt ? new Date(rep.completedAt) : null,
                        status: rep.status || 'N/A'
                    }))
                    // Filtrer les réparations pour exclure celles avec les statuts 'rejected' ou 'recovered'
                    .filter((rep: any) => rep.status !== 'rejected' && rep.status !== 'recovered');
    
                this.reparations.set(transformedData);
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err?.error?.message || 'Impossible de charger les réparations.'
                });
                this.loading = false;
            }
        });
    }
    

    viewDetails(reparation: any) {
        this.router.navigate(['/reparation/repair-manager-details', reparation._id]);
    }
}