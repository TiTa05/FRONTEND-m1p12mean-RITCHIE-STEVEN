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
import { ApiRoutes } from '../../api/api.routes';
import { Reparation } from '../../models/reparation.interface';
import { Column, ExportColumn } from '../../models/crud-component.interface';

@Component({
    selector: 'app-reparation-crud',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, 
        ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, 
        ConfirmDialogModule
    ],
    template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedReparations()" [disabled]="!selectedReparations || !selectedReparations.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="reparations()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['label', 'cost']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedReparations"
            [rowHover]="true"
            dataKey="_id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} reparations"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Reparation Management</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="label" style="min-width:16rem">
                        Label
                        <p-sortIcon field="label" />
                    </th>
                    <th pSortableColumn="cost" style="min-width:12rem">
                        Cost
                        <p-sortIcon field="cost" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-reparation>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="reparation" />
                    </td>
                    <td style="min-width: 16rem">{{ reparation.label }}</td>
                    <td style="min-width: 12rem">{{ reparation.cost }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editReparation(reparation)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteReparation(reparation)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="4">
                        <p>No reparations available at the moment.</p>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="reparationDialog" [style]="{ width: '450px' }" header="Reparation Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="label" class="block font-bold mb-3">Label</label>
                        <input type="text" pInputText id="label" [(ngModel)]="reparation.label" required autofocus fluid/>
                        <small class="text-red-500" *ngIf="submitted && !reparation.label">Label is required.</small>
                    </div>
                    <div>
                        <label for="cost" class="block font-bold mb-3">Cost</label>
                        <input type="number" pInputText id="cost" [(ngModel)]="reparation.cost" required fluid/>
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
export class ReparationTypeCRUD implements OnInit {
    reparationDialog: boolean = false;
    reparations = signal<Reparation[]>([]);
    reparation: Reparation = { label: '', cost: 0 };
    selectedReparations: Reparation[] | null = null;
    submitted: boolean = false;
    @ViewChild('dt') dt!: Table;
    cols!: Column[];
    exportColumns!: ExportColumn[];

    constructor(
        private apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadReparations();
        this.cols = [
            { field: 'label', header: 'Label' },
            { field: 'cost', header: 'Cost' }
        ];
        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    loadReparations(): void {
        this.apiRoutes.getReparationsType().subscribe({
            next: (data: Reparation[]) => {
                this.reparations.set(data);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load reparations',
                    life: 3000
                });
                console.error("Error loading reparations:", err);
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
                    this.apiRoutes.deleteReparationType(reparation._id).subscribe({
                        next: () => {
                            this.reparations.set(this.reparations().filter(r => r._id !== reparation._id));
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Reparation deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete reparation',
                                life: 3000
                            });
                            console.error('Error deleting reparation', error);
                        }
                    });
                }
            }
        });
    }

    deleteSelectedReparations(): void {
        if (!this.selectedReparations || this.selectedReparations.length === 0) return;

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected reparations?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deletePromises = this.selectedReparations!.map(reparation => {
                    return new Promise<void>((resolve, reject) => {
                        if (!reparation._id) return reject('Missing reparation ID');
                        
                        this.apiRoutes.deleteReparationType(reparation._id).subscribe({
                            next: () => resolve(),
                            error: (err) => reject(err)
                        });
                    });
                });

                Promise.all(deletePromises)
                    .then(() => {
                        this.reparations.set(this.reparations().filter(r => 
                            !this.selectedReparations!.some(s => s._id === r._id)
                        ));
                        this.selectedReparations = null;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Reparations deleted',
                            life: 3000
                        });
                    })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete some reparations',
                            life: 3000
                        });
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

        if (!this.reparation.label?.trim()) return;

        if (this.reparation._id) {
            this.apiRoutes.putReparationType(this.reparation._id, this.reparation).subscribe({
                next: (updatedReparation) => {
                    const index = this.reparations().findIndex(r => r._id === updatedReparation._id);
                    if (index !== -1) {
                        const updated = [...this.reparations()];
                        updated[index] = updatedReparation;
                        this.reparations.set(updated);
                    }
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
            this.apiRoutes.postReparationType(this.reparation).subscribe({
                next: (newReparation) => {
                    this.reparations.set([...this.reparations(), newReparation]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Reparation created',
                        life: 3000
                    });
                    this.resetForm();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create reparation',
                        life: 3000
                    });
                }
            });
        }
    }

    private resetForm(): void {
        this.reparation = { label: '', cost: 0 };
        this.reparationDialog = false;
        this.submitted = false;
    }
}