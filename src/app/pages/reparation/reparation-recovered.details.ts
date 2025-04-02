declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
      lastAutoTable: { finalY: number };
    }
  }  

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ApiRoutes } from '../../api/api.routes';
import { Reparation, ReparationType } from '../../models/reparation.interface';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
    selector: 'app-reparation-recovered-details',
    standalone: true,
    imports: [CommonModule, PanelModule, ButtonModule, ToastModule],
    template: `
        <p-toast></p-toast>

        <div class="card" *ngIf="reparation()">
            <p-panel>
                <ng-template pTemplate="header">
                    <div class="flex flex-col">
                        <div class="self-start mb-2">
                            <button pButton icon="pi pi-arrow-left" label="Back to List" class="p-button-secondary" (click)="navigateBack()"></button>
                        </div>
                        <h1 class="text-xl md:text-2xl font-bold text-gray-800 m-0">RECOVERED REPARATION DETAILS</h1>
                    </div>
                </ng-template>

                <div class="grid">
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <h5 class="mb-2">Vehicle & Client Information:</h5>
                            <div class="space-y-1">
                                <p><strong>Client:</strong> {{ getClientName() }}</p>
                                <p><strong>Vehicle:</strong> {{ getVehicleInfo() }}</p>
                                <p><strong>Registration:</strong> {{ reparation()?.depositId?.vehicleId?.registrationNumber || 'N/A' }}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h5 class="mb-2">Assigned Mechanics:</h5>
                            <p>{{ getMechanicsNames() }}</p>
                        </div>                        
                    </div>

                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <h5 class="mb-2">Timeline:</h5>
                            <div class="space-y-1">
                                <p><strong>Started:</strong> {{ reparation()?.startedAt | date: 'mediumDate' }}</p>
                                <p><strong>Completed:</strong> {{ reparation()?.completedAt | date: 'mediumDate' }}</p>
                                <p><strong>Recovered:</strong> {{ reparation()?.recoveredAt | date: 'mediumDate' }}</p>
                            </div>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-2">Reparation Status:</h5>
                            <span class="inline-block px-3 py-1 rounded-md mt-2 bg-green-500 text-white"> Recovered </span>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-2">Repair Types:</h5>
                            <p>{{ getRepairTypes() }}</p>
                        </div>
                    </div>
                </div>

                <div class="mb-4" *ngIf="hasAdditionalCosts()">
                    <h5 class="mb-2">Additional Costs:</h5>
                    <div class="border-round border-1 surface-border p-3">
                        <div *ngFor="let cost of reparation()?.additionalCosts" class="mb-2">
                            <p>
                                <strong>{{ cost.description }}:</strong>
                                {{ cost.cost | number: '1.0-0' }} Ar - 
                                {{ cost.date | date: 'mediumDate' }}
                            </p>
                        </div>
                        <p class="font-bold mt-2">Total: {{ calculateTotalCosts() | number: '1.0-0' }} Ar</p>
                    </div>
                </div>

                <div class="self-end mt-4">
                    <button pButton icon="pi pi-file-pdf" label="Export PDF" class="p-button-primary" (click)="exportPDF()"></button>
                </div>
            </p-panel>
        </div>
    `,
    providers: [MessageService]
})
export class ReparationDetailsComponent implements OnInit {
    reparation = signal<Reparation | null>(null);

    constructor(
        private route: ActivatedRoute,
        private apiRoutes: ApiRoutes,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadReparation(id);
        }
    }

    loadReparation(id: string): void {
        this.apiRoutes.getReparationById(id).subscribe({
            next: (data: Reparation) => {
                this.reparation.set(data);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load reparation details',
                    life: 3000
                });
                console.error('Error loading reparation:', err);
            }
        });
    }

    getClientName(): string {
        const client = this.reparation()?.depositId?.vehicleId?.clientId;
        return client ? `${client.lastName} ${client.firstName}` : 'N/A';
    }

    getVehicleInfo(): string {
        const vehicle = this.reparation()?.depositId?.vehicleId;
        return vehicle ? `${vehicle.brandId?.brand || ''} ${vehicle.model || ''}`.trim() || 'N/A' : 'N/A';
    }

    getRepairTypes(): string {
        const repairTypes = this.reparation()?.depositId?.typeReparationIds;
        if (!repairTypes || repairTypes.length === 0) {
            return 'N/A';
        }

        return repairTypes
            .map((type: ReparationType) => `${type.label} (${type.cost || 0} Ar)`)
            .join(', ');
    }

    getMechanicsNames(): string {
        const mechanics = this.reparation()?.mechanics;
        if (!mechanics || mechanics.length === 0) {
            return 'No mechanics assigned';
        }
        return mechanics.map((mechanic: any) => `${mechanic.firstName} ${mechanic.lastName}`).join(', ');
    }

    hasAdditionalCosts(): boolean {
        return !!this.reparation()?.additionalCosts?.length;
    }

    calculateTotalCosts(): number {
        const additionalCosts = this.reparation()?.additionalCosts?.reduce((sum, cost) => sum + cost.cost, 0) || 0;
        const repairTypeCosts = this.reparation()?.depositId?.typeReparationIds?.reduce(
            (sum: number, type: ReparationType) => sum + (type.cost || 0),
            0
        ) || 0;
        return additionalCosts + repairTypeCosts;
    }

    navigateBack(): void {
        window.history.back();
    }

    exportPDF(): void {
        const rep = this.reparation();
        if (!rep) return;
    
        const doc = new jsPDF();

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
                <text x="0" y="40" font-size="30" font-family="sans-serif" fill="#10b981">SS</text>
                <text x="55" y="40" font-size="30" font-family="sans-serif" fill="#000000">Garage</text>
            </svg>
        `;
    
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        if (ctx) {
            const img = new Image();
            img.onload = () => {
                canvas.width = 200;
                canvas.height = 60;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
                const imgData = canvas.toDataURL('image/png');

                doc.addImage(imgData, 'PNG', 10, 10, 60, 18);

                const invoiceDate = rep.recoveredAt
                    ? new Date(rep.recoveredAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                    : 'N/A';
                doc.setFontSize(12);
                doc.text(`Invoice Date: ${invoiceDate}`, 200, 10, { align: 'right' });

                doc.setFontSize(22);
                doc.text('Invoice Details', 10, 50);

                doc.setFontSize(14);
                doc.text(`Client: ${this.getClientName()}`, 10, 70);
                doc.text(`Vehicle: ${this.getVehicleInfo()}`, 10, 80);
                doc.text(`Registration: ${rep.depositId?.vehicleId?.registrationNumber || 'N/A'}`, 10, 90);

                const additionalCostsData = rep.additionalCosts.map((cost) => [
                    cost.description,
                    `${cost.cost} Ar`,
                    cost.date ? new Date(cost.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A',
                ]);

                const repairTypesData = (rep.depositId?.typeReparationIds || []).map((type: ReparationType) => [
                    type.label,
                    `${type.cost} Ar`,
                ]);
    
                let finalY = 100;

                const tableTheme = {
                    headStyles: {
                        fillColor: [16, 185, 129], 
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                    },
                    bodyStyles: {
                        textColor: [0, 0, 0],
                    },
                    alternateRowStyles: {
                        fillColor: [223, 243, 235],
                    },
                };
    
                if (repairTypesData.length > 0) {
                    doc.autoTable({
                        head: [['Repair Type', 'Cost']],
                        body: repairTypesData,
                        startY: finalY,
                        theme: 'grid',
                        styles: tableTheme,
                    });
                    finalY = doc.lastAutoTable.finalY + 10;
                }
    
                if (additionalCostsData.length > 0) {
                    doc.autoTable({
                        head: [['Description', 'Cost', 'Date']],
                        body: additionalCostsData,
                        startY: finalY,
                        theme: 'grid',
                        styles: tableTheme,
                    });
                    finalY = doc.lastAutoTable.finalY + 10;
                }

                doc.setFontSize(16);
                doc.text(`Total: ${this.calculateTotalCosts()} Ar`, 10, finalY);

                doc.save(`invoice-${rep.depositId?.vehicleId?.registrationNumber || 'unknown'}.pdf`);
            };
    
            img.src = 'data:image/svg+xml;base64,' + btoa(svg);
        } else {
            console.error('Canvas context not available');
        }
    }
}