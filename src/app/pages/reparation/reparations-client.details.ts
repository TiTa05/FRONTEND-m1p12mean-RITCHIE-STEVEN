import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRoutes } from '../../api/api.routes';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { PanelModule } from 'primeng/panel';
import { User } from '../../models/user.interface';

@Component({
    selector: 'app-reparation-details-client',
    standalone: true,
    imports: [CommonModule, ToastModule, TagModule, ButtonModule, PanelModule, ProgressBarModule],
    template: `
       <p-toast></p-toast>
        <div *ngIf="repairDetails">
            <p-panel>
                <ng-template pTemplate="header">
                    <div class="text-xl md:text-2xl font-bold text-gray-800">REPARATION DETAILS</div>
                </ng-template>
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <h5 class="mb-2">Vehicle & Client Information:</h5>
                            <div class="space-y-1">
                                <p><strong>Client:</strong> {{ repairDetails.clientName || 'N/A' }} ( Vous )</p>
                                <p><strong>Vehicle:</strong> {{ repairDetails.vehicleBrand || 'N/A' }} {{ repairDetails.vehicleModel || 'N/A' }}</p>
                                <p><strong>Registration:</strong> {{ repairDetails.vehicleRegistration || 'N/A' }}</p>
                            </div>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-2">Repair Types:</h5>
                            <p>{{ getRepairTypes(repairDetails) }}</p>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-2">Additional Costs:</h5>
                            <div *ngIf="repairDetails.additionalCosts.length > 0; else noCosts">
                                <ul>
                                    <li *ngFor="let cost of repairDetails.additionalCosts">
                                        <strong>{{ cost.description }}:</strong> {{ cost.cost | currency:'USD' }} on {{ cost.date }}
                                    </li>
                                </ul>
                            </div>
                            <ng-template #noCosts>
                                <p>No additional costs recorded.</p>
                            </ng-template>
                        </div>

                    </div>
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <h5 class="mb-2">Repair Status:</h5>
                            <span
                                class="inline-block px-3 py-1 rounded-md mt-2"
                                [ngClass]="{
                                    'bg-yellow-500 text-white': repairDetails.status === 'in_progress',
                                    'bg-green-500 text-white': repairDetails.status === 'completed'
                                }"  
                            >
                                {{ repairDetails.status | uppercase }}
                            </span>
                        </div>
                    </div>
                </div>
            </p-panel>
            <div class="flex justify-between mt-4">
                <button pButton label="Back to Repairs List" icon="pi pi-arrow-left" (click)="backToRepairsList()"></button>
            </div>
        </div>

    `,
    providers: [MessageService]
})
export class RepairDetailsClientComponent implements OnInit {

    repairDetails: any = null;
    loading: boolean = true;
    repairId: string | null = null;
    reparation: any;

    constructor(
        private route: ActivatedRoute,
        private apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private router: Router
    ) {}

    getStatusLabel(status: string): string {
        switch (status) {
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    }

    ngOnInit(): void {
        // Récupère l'ID de la réparation à partir des paramètres de la route
        this.repairId = this.route.snapshot.paramMap.get('id');

        if (this.repairId) {
            this.loadRepairDetails();
        } else {
            this.loading = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Repair ID missing',
                detail: 'No repair ID found in the route parameters.'
            });
        }
    }
    
    getRepairTypes(data: any): string {
        if (!data || !data.depositId?.typeReparationIds) {
            return 'N/A';
        }
    
        return data.depositId.typeReparationIds
            .map((type: any) => `${type.label} (Cost: ${type.cost || 'N/A'})`) // Inclure le prix avec le label
            .join(', ');
    }
    

    // Charge les détails de la réparation
    loadRepairDetails(): void {
        if (this.repairId) {
            this.apiRoutes.getReparationById(this.repairId).subscribe({
                next: (data: any) => {
                    this.repairDetails = this.transformRepairDetailsData(data);
                    this.loading = false;
                },
                error: (err: any) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed to fetch repair details',
                        detail: err.error?.message || 'An unexpected error occurred.'
                    });
                    this.loading = false;
                }
            });
        }
    }

    // Transformation des données des réparations pour un format plus adapté au template
    transformRepairDetailsData(data: any): any {
        return {
            ...data,
            clientName: `${data.depositId?.vehicleId?.clientId?.firstName || 'N/A'} ${data.depositId?.vehicleId?.clientId?.lastName || 'N/A'}`,
            vehicleRegistration: data.depositId?.vehicleId?.registrationNumber || 'N/A',
            vehicleBrand: data.depositId?.vehicleId?.brandId?.brand || 'N/A',
            vehicleModel: data.depositId?.vehicleId?.model || 'N/A',
            repairTypes: this.getRepairTypes(data),
            additionalCosts: data.additionalCosts?.map((cost: any) => ({
                description: cost.description || 'N/A',
                cost: cost.cost || 0,
                date: cost.date ? new Date(cost.date).toLocaleDateString() : 'N/A'
            })) || [],
            status: data.status || 'N/A',
            startedAt: data.startedAt ? new Date(data.startedAt) : null,
            completedAt: data.completedAt ? new Date(data.completedAt) : null
        };
    }


    // Retour à la liste des réparations
    backToRepairsList(): void {
        this.router.navigate(['/reparation/reparation-client-list']);
    }
}

