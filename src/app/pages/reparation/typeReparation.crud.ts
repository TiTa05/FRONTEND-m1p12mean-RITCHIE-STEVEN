import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { Reparation } from '../../models/reparation.interface';
import { Column, ExportColumn } from '../../models/crud-component.interface';

@Component({
    selector: 'app-reparation-crud',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, 
        ToolbarModule, InputTextModule, DialogModule, ConfirmDialogModule
    ],
    template: `
        <p-toast></p-toast>
        <p-toolbar class="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedReparations()" [disabled]="!selectedReparations || !selectedReparations.length" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="reparations"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['label', 'cost']"
            [(selection)]="selectedReparations"
            [rowHover]="true"
            dataKey="_id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} reparations"
            [showCurrentPageReport]="true"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Reparation Management</h5>
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="label">Label <p-sortIcon field="label" /></th>
                    <th pSortableColumn="cost">Cost <p-sortIcon field="cost" /></th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-reparation>
                <tr>
                    <td><p-tableCheckbox [value]="reparation" /></td>
                    <td>{{ reparation.label }}</td>
                    <td>{{ reparation.cost }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editReparation(reparation)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteReparation(reparation)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="7">
                        <p>No type available at the moment.</p>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="reparationDialog" [style]="{ width: '450px' }" header="Reparation Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="label" class="block font-bold mb-3">Label</label>
                        <input type="text" pInputText id="label" [(ngModel)]="reparation.label" required />
                        <small class="text-red-500" *ngIf="submitted && !reparation.label">Type is required.</small>
                    </div>
                    <div>
                        <label for="cost" class="block font-bold mb-3">Cost</label>
                        <input type="number" pInputText id="cost" [(ngModel)]="reparation.cost" required />
                        <small class="text-red-500" *ngIf="submitted && !reparation.cost">Cost is required.</small>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveReparation()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class ReparationCRUD implements OnInit {
    reparations: Reparation[] = [];
    reparationDialog: boolean = false;
    reparation: Reparation = { label: '', cost: 0 };
    selectedReparations: Reparation[] | null = null;
    submitted: boolean = false;

    constructor(
        private apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadReparations();
    }

    loadReparations(): void {
        this.apiRoutes.getReparations().subscribe({
            next: (data: Reparation[]) => {
                console.log("Fetched reparations:", data); // Debugging line
                this.reparations = data;
            },
            error: (err) => {
                console.error("Error fetching reparations:", err);
            }
        });
    }

    openNew(): void {
        this.reparation = { label: '', cost: 0 };
        this.submitted = false;
        this.reparationDialog = true;
    }

    editReparation(reparation: Reparation): void {
        this.reparation = { ...reparation };
        this.reparationDialog = true;
    }

    deleteReparation(reparation: Reparation): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${reparation.label}?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (reparation._id) {
                    this.apiRoutes.deleteReparation(reparation._id).subscribe({
                        next: () => { 
                            this.reparations = this.reparations.filter((val) => val._id !== reparation._id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Repair deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete repair',
                                life: 3000
                            });
                            console.error('Error deleting repair', error);
                        }
                    });
                } else {
                    console.error("Reparation ID is undefined");
                }                
            }
        });
    }

    deleteSelectedReparations(): void {
        if (!this.selectedReparations || this.selectedReparations.length === 0) {
            return;
        }
    
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected repairs?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deletePromises: Promise<void>[] = (this.selectedReparations ?? []).map(reparation => {
                    return new Promise<void>((resolve, reject) => {
                        if (!reparation._id) {
                            return reject("Reparation ID is null or undefined");
                        }
    
                        this.apiRoutes.deleteReparation(reparation._id).subscribe({
                            next: () => resolve(),
                            error: (error) => reject(error)
                        });
                    });
                });
    
                Promise.all(deletePromises)
                    .then(() => {
                        this.reparations = this.reparations.filter(r => 
                            !this.selectedReparations!.some(sel => sel._id === r._id)
                        );
                        this.selectedReparations = null;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Repairs deleted',
                            life: 3000
                        });
                    })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete some repairs',
                            life: 3000
                        });
                    })
                    .finally(() => {
                        this.loadReparations();
                    });
            }
        });
    }
    

    hideDialog(): void {
        this.reparationDialog = false;
        this.submitted = false;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    saveReparation(): void {
        this.submitted = true;
    
        if (!this.reparation.label?.trim()) return; // Prevent empty labels
    
        if (this.reparation._id) {
            // Update existing reparation
            this.apiRoutes.putReparation(this.reparation._id, this.reparation).subscribe({
                next: (updatedReparation) => {
                    const index = this.findIndexById(this.reparation._id!);
                    if (index !== -1) this.reparations[index] = updatedReparation;
    
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Reparation updated',
                        life: 3000
                    });
                    this.resetForm();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update reparation',
                        life: 3000
                    });
                }
            });
        } else {
            // Create a new reparation
            this.apiRoutes.postReparation(this.reparation).subscribe({
                next: (newReparation) => {
                    this.reparations.push(newReparation);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Reparation added',
                        life: 3000
                    });
                    this.resetForm();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to add reparation',
                        life: 3000
                    });
                }
            });
        }
    }
    
    // Utility method to reset form
    private resetForm(): void {
        this.reparation = { label: '', cost: 0 };
        this.reparationDialog = false;
        this.loadReparations();
    }
    

    findIndexById(id: string): number {
        return this.reparations.findIndex(r => r._id === id);
    }
}