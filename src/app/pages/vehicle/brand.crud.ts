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
import { Brand } from '../../models/brand.interface';
import { Column, ExportColumn } from '../../models/crud-component.interface';

@Component({
    selector: 'app-brand-crud',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],
    template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedBrands()" [disabled]="!selectedBrands || !selectedBrands.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="brands()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['brand']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedBrands"
            [rowHover]="true"
            dataKey="_id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} brands"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Brand Management</h5>
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
                    <th pSortableColumn="brand" style="min-width:16rem">
                        Brand Name
                        <p-sortIcon field="brand" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-brand>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="brand" />
                    </td>
                    <td style="min-width: 16rem">{{ brand.brand }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editBrand(brand)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteBrand(brand)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="4">
                        <p>No brands available at the moment.</p>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="brandDialog" [style]="{ width: '450px' }" header="Brand Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Brand Name</label>
                        <input type="text" pInputText id="name" [(ngModel)]="brand.brand" required autofocus fluid />
                        <small class="text-red-500" *ngIf="submitted && !brand.brand">Brand name is required.</small>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveBrand()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class BrandCRUD extends ApiCalls implements OnInit {
    brandDialog: boolean = false;
    brands = signal<Brand[]>([]);
    brand!: Brand;
    selectedBrands!: Brand[] | null;
    submitted: boolean = false;
    @ViewChild('dt') dt!: Table;
    exportColumns!: ExportColumn[];
    cols!: Column[];

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super(apiRoutes);
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadBrands();

        this.cols = [
            { field: 'brand', header: 'Brand Name' },
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    loadBrands() {
        this.apiRoutes.getBrands().subscribe({
            next: (data) => {
                this.brands.set(data);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load brands',
                    life: 3000
                });
                console.error('Error loading brands', error);
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.brand = { _id: '', brand: '' };
        this.submitted = false;
        this.brandDialog = true;
    }

    editBrand(brand: Brand) {
        this.brand = { ...brand };
        this.brandDialog = true;
    }

    deleteSelectedBrands() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected brands?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (this.selectedBrands) {
                    // Use Promise.all to wait for all delete operations to complete
                    const deletePromises = this.selectedBrands.map(
                        (brand) =>
                            new Promise<void>((resolve, reject) => {
                                this.apiRoutes.deleteBrand(brand._id).subscribe({
                                    next: () => resolve(),
                                    error: (error) => reject(error)
                                });
                            })
                    );

                    Promise.all(deletePromises)
                        .then(() => {
                            this.brands.set(this.brands().filter((val) => !this.selectedBrands?.includes(val)));
                            this.selectedBrands = null;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Brands deleted',
                                life: 3000
                            });
                        })
                        .catch(() => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete some brands',
                                life: 3000
                            });
                        })
                        .finally(() => {
                            this.loadBrands();
                        });
                }
            }
        });
    }

    hideDialog() {
        this.brandDialog = false;
        this.submitted = false;
    }

    deleteBrand(brand: Brand) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + brand.brand + '?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.apiRoutes.deleteBrand(brand._id).subscribe({
                    next: () => {
                        this.brands.set(this.brands().filter((val) => val._id !== brand._id));
                        this.brand = { _id: '', brand: '' };
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Brand deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete brand',
                            life: 3000
                        });
                        console.error('Error deleting brand', error);
                    }
                });
            }
        });
    }

    saveBrand() {
        this.submitted = true;

        if (this.brand.brand?.trim()) {
            if (this.brand._id) {
                // Update an existing brand
                this.apiRoutes.putBrand(this.brand._id, this.brand).subscribe({
                    next: (updatedBrand) => {
                        const index = this.findIndexById(this.brand._id);
                        let _brands = this.brands();
                        if (index !== -1) {
                            _brands[index] = updatedBrand;
                            this.brands.set([..._brands]);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Brand updated',
                            life: 3000
                        });
                        this.brandDialog = false;
                        this.brand = { _id: '', brand: '' };
                        this.loadBrands(); // Refresh the list
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update brand',
                            life: 3000
                        });
                        console.error('Error updating brand', error);
                    }
                });
            } else {
                // Create a new brand
                this.apiRoutes.postBrand({ brand: this.brand.brand }).subscribe({
                    next: (newBrand) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Brand created',
                            life: 3000
                        });
                        this.brandDialog = false;
                        this.brand = { _id: '', brand: '' };
                        this.loadBrands();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to create brand',
                            life: 3000
                        });
                        console.error('Error creating brand', error);
                    }
                });
            }
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.brands().length; i++) {
            if (this.brands()[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    }
}
