import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { DatePickerModule } from 'primeng/datepicker';
import { ApiRoutes } from '../../api/api.routes';
import { Column, ExportColumn } from '../../models/crud-component.interface';
import { User } from '../../models/user.interface';
import { AdditionalCost, Reparation } from '../../models/reparation.interface';

@Component({
    selector: 'app-reparation-detail',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule, PanelModule, DatePickerModule],
    template: `
        <p-toast></p-toast>

        <div class="card mb-4" *ngIf="reparation()">
            <p-toolbar styleClass="mb-4">
                <ng-template pTemplate="start">
                    <h5 class="m-0">Additional Costs Management</h5>
                </ng-template>
                <ng-template pTemplate="end">
                    <p-button label="Back to List" icon="pi pi-arrow-left" severity="secondary" class="mr-2" (onClick)="navigateToPrevious()" />
                    <p-button label="New Cost" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" [disabled]="reparation()?.status !== 'in_progress'"/>
                    <p-button severity="secondary" label="Delete Selected" icon="pi pi-trash" outlined (onClick)="deleteSelectedCosts()" [disabled]="!selectedCosts || !selectedCosts.length" />
                    <p-button label="Export" icon="pi pi-upload" severity="secondary" class="ml-2" (onClick)="exportCSV()" />
                </ng-template>
            </p-toolbar>

            <p-table
                #dt
                [value]="additionalCosts()"
                [rows]="10"
                [columns]="cols"
                [paginator]="true"
                [globalFilterFields]="['description', 'cost', 'date']"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedCosts"
                [rowHover]="true"
                dataKey="_id"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} additional costs"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
            >
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between">
                        <div><strong>Total Additional Costs:</strong> {{ calculateTotalCosts() | number: '1.0-0' }} Ar</div>
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 3rem">
                            <p-tableHeaderCheckbox [disabled]="reparation()?.status !== 'in_progress'"/>
                        </th>
                        <th pSortableColumn="description" style="min-width:16rem">
                            Description
                            <p-sortIcon field="description" />
                        </th>
                        <th pSortableColumn="cost" style="min-width:12rem">
                            Cost
                            <p-sortIcon field="cost" />
                        </th>
                        <th pSortableColumn="date" style="min-width:12rem">
                            Date
                            <p-sortIcon field="date" />
                        </th>
                        <th style="min-width: 12rem"></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-cost>
                    <tr>
                        <td style="width: 3rem">
                            <p-tableCheckbox [value]="cost" [disabled]="reparation()?.status !== 'in_progress'"/>
                        </td>
                        <td style="min-width: 16rem">{{ cost.description }}</td>
                        <td style="min-width: 12rem">{{ cost.cost | number: '1.0-0' }} Ar</td>
                        <td style="min-width: 12rem">{{ cost.date | date: 'mediumDate' }}</td>
                        <td>
                            <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editCost(cost)" [disabled]="reparation()?.status !== 'in_progress'"/>
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteCost(cost)" [disabled]="reparation()?.status !== 'in_progress'"/>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5">
                            <p>No additional costs available for this reparation.</p>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="summary">
                    <div class="flex align-items-center justify-content-between">{{ additionalCosts().length }} additional costs total</div>
                </ng-template>
            </p-table>
        </div>

        <div class="card" *ngIf="reparation()">
            <p-panel>
                <ng-template pTemplate="header">
                    <div class="text-xl md:text-2xl font-bold text-gray-800">REPARATION DETAILS</div>
                </ng-template>
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <h5 class="mb-2">Vehicle & Client Information:</h5>
                            <ng-container *ngIf="reparation() as reparation">
                                <div class="space-y-1">
                                    <p><strong>Client:</strong> {{ reparation.depositId?.vehicleId?.clientId?.lastName || 'N/A' }} {{ reparation.depositId?.vehicleId?.clientId?.firstName || 'N/A' }}</p>
                                    <p><strong>Vehicle:</strong> {{ reparation.depositId?.vehicleId?.brandId?.brand || 'N/A' }} {{ reparation.depositId?.vehicleId?.model || 'N/A' }}</p>
                                    <p><strong>Registration:</strong> {{ reparation.depositId?.vehicleId?.registrationNumber || 'N/A' }}</p>
                                </div>
                            </ng-container>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-2">Repair Types:</h5>
                            <p>{{ getRepairTypes() }}</p>
                        </div>
                    </div>
                    <div class="mb-4">
                            <h5 class="mb-2">Assigned Mechanics:</h5>
                            <p>{{ getMechanicsNames() }}</p>
                        </div>
                    <div class="col-12 md:col-6">
                        <div class="mb-4">
                            <div class="flex items-center gap-2">
                                <h5 class="mb-0">Reparation Status:</h5>
                                <p-button icon="pi pi-sync" [text]="true" severity="secondary" (click)="toggleReparationStatus()" [label]="reparation()?.status === 'in_progress' ? 'Mark as Completed' : 'Reopen'"> </p-button>
                            </div>
                            <ng-container *ngIf="reparation() as reparation">
                                <span
                                    class="inline-block px-3 py-1 rounded-md mt-2"
                                    [ngClass]="{
                                        'bg-yellow-500 text-white': reparation.status === 'in_progress',
                                        'bg-green-500 text-white': reparation.status === 'completed'
                                    }"
                                >
                                    {{ getStatusLabel(reparation.status) }}
                                </span>
                            </ng-container>
                        </div>  
                    </div>
                </div>
            </p-panel>
        </div>

        <p-dialog [(visible)]="costDialog" [style]="{ width: '450px' }" header="Additional Cost Details" [modal]="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <input type="text" pInputText id="description" [(ngModel)]="cost.description" required autofocus class="w-full" />
                    <small class="text-red-500" *ngIf="submitted && !cost.description">Description is required.</small>
                </div>
                <div>
                    <label for="cost" class="block font-bold mb-3">Cost</label>
                    <input type="number" pInputText id="cost" [(ngModel)]="cost.cost" required class="w-full" />
                    <small class="text-red-500" *ngIf="submitted && (cost.cost === undefined || cost.cost === null)">Cost is required.</small>
                </div>
                <div>
                    <label for="date" class="block font-bold mb-3">Date</label>
                    <p-datePicker [(ngModel)]="cost.date" [showIcon]="true" inputId="date" dateFormat="yy-mm-dd" [required]="true" class="w-full" [appendTo]="'body'" fluid></p-datePicker>
                    <small class="text-red-500" *ngIf="submitted && !cost.date">Date is required.</small>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveCost()" />
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="statusDialog" [style]="{ width: '450px' }" header="Change Status to Completed" [modal]="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="completionDate" class="block font-bold mb-3">Completion Date</label>
                    <p-datePicker [(ngModel)]="completionDate" [showIcon]="true" inputId="completionDate" dateFormat="yy-mm-dd" [required]="true" class="w-full" [appendTo]="'body'" fluid></p-datePicker>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" text (click)="statusDialog = false" />
                <p-button label="Confirm" icon="pi pi-check" (click)="confirmStatusChange()" />
            </ng-template>
        </p-dialog>
        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class ReparationDetailsComponent implements OnInit {
    reparationId: string = '';
    reparation = signal<Reparation | null>(null);
    additionalCosts = signal<AdditionalCost[]>([]);

    costDialog: boolean = false;

    cost: AdditionalCost = { description: '', cost: 0, date: new Date() };

    selectedCosts: AdditionalCost[] | null = null;
    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;
    cols!: Column[];
    exportColumns!: ExportColumn[];

    statusDialog: boolean = false;
    completionDate: Date = new Date();

    constructor(
        private route: ActivatedRoute,
        private apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.reparationId = id;
                this.loadReparation();
            }
        });

        this.cols = [
            { field: 'description', header: 'Description' },
            { field: 'cost', header: 'Cost' },
            { field: 'date', header: 'Date' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    loadReparation(): void {
        this.apiRoutes.getReparationById(this.reparationId).subscribe({
            next: (data: Reparation) => {
                this.reparation.set(data);
                const costsWithDates = data.additionalCosts.map((cost) => ({
                    ...cost,
                    date: cost.date ? new Date(cost.date) : new Date()
                }));
                this.additionalCosts.set(costsWithDates || []);
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

    getRepairTypes(): string {
        if (!this.reparation() || !this.reparation()?.depositId?.typeReparationIds) {
            return 'N/A';
        }
        return this.reparation()
            ?.depositId?.typeReparationIds.map((type: any) => type.label)
            .join(', ');
    }

    getMechanicsNames(): string {
        const reparation = this.reparation();
        if (!reparation || !reparation.mechanics || reparation.mechanics.length === 0) {
            return 'No mechanics assigned';
        }
        return reparation.mechanics.map((mechanic: User) => `${mechanic.firstName} ${mechanic.lastName}`).join(', ');
    }

    calculateTotalCosts(): number {
        return this.additionalCosts().reduce((sum, cost) => sum + cost.cost, 0);
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    navigateToPrevious(): void {
        window.history.back();
    }

    openNew(): void {
        this.cost = { description: '', cost: 0, date: new Date() };
        this.submitted = false;
        this.costDialog = true;
    }

    editCost(cost: AdditionalCost): void {
        this.cost = { ...cost };
        this.costDialog = true;
    }

    deleteCost(cost: AdditionalCost): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete this additional cost?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const updatedReparation = { ...this.reparation()! };
                updatedReparation.additionalCosts = updatedReparation.additionalCosts.filter((c) => c !== cost && c._id !== cost._id);
                this.updateReparation(updatedReparation, 'Cost deleted successfully');
            }
        });
    }

    deleteSelectedCosts(): void {
        if (!this.selectedCosts || this.selectedCosts.length === 0) return;

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected costs?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const updatedReparation = { ...this.reparation()! };
                updatedReparation.additionalCosts = updatedReparation.additionalCosts.filter((c) => !this.selectedCosts!.some((s) => s === c || s._id === c._id));
                this.updateReparation(updatedReparation, 'Selected costs deleted successfully', () => {
                    this.selectedCosts = null;
                });
            }
        });
    }

    hideDialog(): void {
        this.costDialog = false;
        this.statusDialog = false;
        this.submitted = false;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    saveCost(): void {
        this.submitted = true;

        if (!this.cost.description?.trim() || this.cost.cost === undefined || !this.cost.date) {
            return;
        }

        const currentReparation = this.reparation()!;
        const updatedReparation = { ...currentReparation };
        const updatedCosts = [...updatedReparation.additionalCosts];

        const existingIndex = updatedCosts.findIndex((c) => c._id === this.cost._id);

        if (existingIndex !== -1) {
            updatedCosts[existingIndex] = { ...this.cost };
        } else {
            const newCost = { ...this.cost, _id: `temp-${Date.now()}` };
            updatedCosts.push(newCost);
        }

        updatedReparation.additionalCosts = updatedCosts;

        this.updateReparation(updatedReparation, existingIndex !== -1 ? 'Cost updated successfully' : 'Cost added successfully');
    }

    updateReparation(updates: Partial<Reparation>, successMessage: string, callback?: () => void): void {
        const currentReparation = this.reparation()!;

        this.apiRoutes.putReparation(this.reparationId, updates).subscribe({
            next: (result: Reparation) => {
                const mergedReparation = {
                    ...currentReparation,
                    ...result,
                    depositId: currentReparation.depositId,
                    mechanics: currentReparation.mechanics,
                    additionalCosts: result.additionalCosts.map((cost) => ({
                        ...cost,
                        date: cost.date ? new Date(cost.date) : new Date()
                    }))
                };

                this.reparation.set(mergedReparation);
                this.additionalCosts.set(mergedReparation.additionalCosts);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: successMessage,
                    life: 3000
                });

                if (callback) callback();
                this.hideDialog();
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update reparation',
                    life: 3000
                });
                console.error('Error updating reparation', error);
            }
        });
    }

toggleReparationStatus(): void {
    if (this.reparation()?.status === 'in_progress') {
        this.statusDialog = true;
        this.completionDate = new Date();
    } else {
        this.confirmStatusChange();
    }
}

confirmStatusChange(): void {
    const newStatus = this.reparation()?.status === 'in_progress' ? 'completed' : 'in_progress';
    const updates: Partial<Reparation> = {
        status: newStatus,
        completedAt: newStatus === 'completed' ? this.completionDate : null
    };

    this.apiRoutes.putReparation(this.reparationId, updates).subscribe({
        next: (updatedReparation) => {
            const currentReparation = this.reparation()!;
            const mergedReparation = {
                ...currentReparation,
                ...updatedReparation,
                depositId: currentReparation.depositId,
                mechanics: currentReparation.mechanics,
                additionalCosts: currentReparation.additionalCosts
            };

            this.reparation.set(mergedReparation);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Status changed to ${this.getStatusLabel(newStatus)}`,
                life: 3000
            });
            this.statusDialog = false;
        },
        error: (err) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update status',
                life: 3000
            });
            console.error('Error updating status:', err);
        }
    });
}
}
