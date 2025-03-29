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
import { Vehicle } from '../../models/vehicle.interface';
import { Column, ExportColumn } from '../../models/crud-component.interface';
import { Brand } from '../../models/brand.interface';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { getUserId } from '../../../utils/utils';

@Component({
    selector: 'app-vehicle-crud',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule, AutoCompleteModule, DropdownModule],
    template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedVehicles()" [disabled]="!selectedVehicles || !selectedVehicles.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="vehicles()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['registrationNumber', 'brand', 'model', 'color', 'energy']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedVehicles"
            [rowHover]="true"
            dataKey="_id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} vehicles"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Vehicle Management</h5>
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
                    <th pSortableColumn="registrationNumber" style="min-width:16rem">
                        Registration Number
                        <p-sortIcon field="registrationNumber" />
                    </th>
                    <th pSortableColumn="brand" style="min-width:16rem">
                        Brand
                        <p-sortIcon field="brand" />
                    </th>
                    <th pSortableColumn="model" style="min-width:16rem">
                        Model
                        <p-sortIcon field="model" />
                    </th>
                    <th pSortableColumn="color" style="min-width:16rem">
                        Color
                        <p-sortIcon field="color" />
                    </th>
                    <th pSortableColumn="energy" style="min-width:16rem">
                        Energy
                        <p-sortIcon field="energy" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-vehicle>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="vehicle" />
                    </td>
                    <td style="min-width: 16rem">{{ vehicle.registrationNumber }}</td>
                    <td style="min-width: 16rem">{{ vehicle.brandId.brand }}</td>
                    <td style="min-width: 16rem">{{ vehicle.model }}</td>
                    <td style="min-width: 16rem">{{ vehicle.color }}</td>
                    <td style="min-width: 16rem">{{ vehicle.energy }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editVehicle(vehicle)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteVehicle(vehicle)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="7">
                        <p>No vehicles available at the moment.</p>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="vehicleDialog" [style]="{ width: '450px' }" header="Vehicle Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div class="flex flex-col">
                        <label for="registrationNumber" class="block font-bold mb-3">Registration Number</label>
                        <input type="text" pInputText id="registrationNumber" [(ngModel)]="vehicle.registrationNumber" class="w-full" required autofocus />
                        <small class="text-red-500" *ngIf="submitted && !vehicle.registrationNumber">Registration number is required.</small>
                    </div>
                    <div class="flex flex-col">
                        <label for="brand" class="block font-bold mb-3">Brand</label>
                        <p-autoComplete
                            [(ngModel)]="selectedBrand"
                            [suggestions]="filteredBrands"
                            (completeMethod)="filterBrands($event)"
                            (onSelect)="onBrandSelect($event)"
                            [dropdown]="true"
                            [forceSelection]="true"
                            [appendTo]="'body'"
                            placeholder="Search or select a brand"
                            field="brand"
                            class="w-full"
                            [style]="{ width: '100%' }"
                        ></p-autoComplete>
                        <small class="text-red-500" *ngIf="submitted && !vehicle.brandId">Brand is required.</small>
                    </div>

                    <div class="flex flex-col">
                        <label for="model" class="block font-bold mb-3">Model</label>
                        <input type="text" pInputText id="model" [(ngModel)]="vehicle.model" class="w-full" required />
                        <small class="text-red-500" *ngIf="submitted && !vehicle.model">Model is required.</small>
                    </div>

                    <div class="flex flex-row gap-4">
                        <div class="flex-1">
                            <label for="color" class="block font-bold mb-3">Color</label>
                            <input type="text" pInputText id="color" [(ngModel)]="vehicle.color" class="w-full" required />
                            <small class="text-red-500" *ngIf="submitted && !vehicle.color">Color is required.</small>
                        </div>

                        <div class="flex-1">
                            <label for="energy" class="block font-bold mb-3">Energy</label>
                            <p-dropdown [options]="energyOptions" [(ngModel)]="vehicle.energy" id="energy" placeholder="Select Energy" [showClear]="true" [appendTo]="'body'" class="w-full"></p-dropdown>
                            <small class="text-red-500" *ngIf="submitted && !vehicle.energy">Energy is required.</small>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveVehicle()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class VehicleCRUD extends ApiCalls implements OnInit {
    vehicleDialog: boolean = false;
    vehicles = signal<Vehicle[]>([]);
    brands = signal<Brand[]>([]);
    filteredBrands: Brand[] = [];
    vehicle!: Vehicle;
    selectedVehicles!: Vehicle[] | null;
    submitted: boolean = false;
    @ViewChild('dt') dt!: Table;
    exportColumns!: ExportColumn[];
    cols!: Column[];
    id: string | null = null;
    selectedBrand: any;

    energyOptions = [
        { label: 'Gas', value: 'Gas' },
        { label: 'Diesel', value: 'Diesel' },
        { label: 'Electric', value: 'Electric' }
    ];

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super(apiRoutes);
        const token = localStorage.getItem('token');
        this.id = token ? getUserId(token) : null;
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadVehicles();
        this.loadBrands();

        this.cols = [
            { field: 'registrationNumber', header: 'Registration Number' },
            { field: 'brandId.brand', header: 'Brand' },
            { field: 'model', header: 'Model' },
            { field: 'color', header: 'Color' },
            { field: 'energy', header: 'Energy' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    loadVehicles() {
        this.apiRoutes.getVehicleByClientId(this.id || '').subscribe({
            next: (data) => {
                this.vehicles.set(data);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load vehicles',
                    life: 3000
                });
                console.error('Error loading vehicles', error);
            }
        });
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

    filterBrands(event: any) {
        const query = event.query.toLowerCase();
        const allBrands = this.brands();
        this.filteredBrands = allBrands.filter((brand) => brand.brand.toLowerCase().includes(query));
    }

    onBrandSelect(event: any) {
        this.vehicle.brandId = event.value._id;
    }
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.vehicle = { _id: '', registrationNumber: '', brandId: '', model: '', color: '', energy: 'Gas', clientId: this.id };
        this.selectedBrand = null;
        this.submitted = false;
        this.vehicleDialog = true;
    }

    editVehicle(vehicle: Vehicle) {
        this.vehicle = { ...vehicle };
        this.selectedBrand = this.brands().find((brand) => brand._id === (vehicle.brandId as unknown as Brand)?._id);
        this.vehicleDialog = true;
    }

    deleteSelectedVehicles() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected vehicles?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (this.selectedVehicles) {
                    const deletePromises = this.selectedVehicles.map(
                        (vehicle) =>
                            new Promise<void>((resolve, reject) => {
                                this.apiRoutes.deleteVehicle(vehicle._id).subscribe({
                                    next: () => resolve(),
                                    error: (error) => reject(error)
                                });
                            })
                    );

                    Promise.all(deletePromises)
                        .then(() => {
                            this.vehicles.set(this.vehicles().filter((val) => !this.selectedVehicles?.includes(val)));
                            this.selectedVehicles = null;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Vehicles deleted',
                                life: 3000
                            });
                        })
                        .catch(() => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete some vehicles',
                                life: 3000
                            });
                        })
                        .finally(() => {
                            this.loadVehicles();
                        });
                }
            }
        });
    }

    hideDialog() {
        this.vehicleDialog = false;
        this.submitted = false;
    }

    deleteVehicle(vehicle: Vehicle) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + vehicle.registrationNumber + '?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.apiRoutes.deleteVehicle(vehicle._id).subscribe({
                    next: () => {
                        this.vehicles.set(this.vehicles().filter((val) => val._id !== vehicle._id));
                        this.vehicle = { _id: '', registrationNumber: '', brandId: '', model: '', color: '', energy: 'Gas', clientId: this.id };
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Vehicle deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete vehicle',
                            life: 3000
                        });
                        console.error('Error deleting vehicle', error);
                    }
                });
            }
        });
    }

    saveVehicle() {
        this.submitted = true;

        if (this.vehicle.registrationNumber?.trim() && this.vehicle.brandId?.trim() && this.vehicle.model?.trim() && this.vehicle.color?.trim() && this.vehicle.energy?.trim()) {
            if (this.vehicle._id) {
                this.apiRoutes.putVehicle(this.vehicle._id, this.vehicle).subscribe({
                    next: (updatedVehicle) => {
                        const index = this.findIndexById(this.vehicle._id);
                        let _vehicles = this.vehicles();
                        if (index !== -1) {
                            _vehicles[index] = updatedVehicle;
                            this.vehicles.set([..._vehicles]);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Vehicle updated',
                            life: 3000
                        });
                        this.vehicleDialog = false;
                        this.vehicle = { _id: '', registrationNumber: '', brandId: '', model: '', color: '', energy: 'Gas', clientId: this.id };
                        this.loadVehicles();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update vehicle',
                            life: 3000
                        });
                        console.error('Error updating vehicle', error);
                    }
                });
            } else {
                this.apiRoutes
                    .postVehicle({
                        ...this.vehicle,
                        _id: undefined
                    })
                    .subscribe({
                        next: (newVehicle) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Vehicle created',
                                life: 3000
                            });
                            this.vehicleDialog = false;
                            this.vehicle = { _id: '', registrationNumber: '', brandId: '', model: '', color: '', energy: 'Gas', clientId: this.id };
                            this.loadVehicles();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to create vehicle',
                                life: 3000
                            });
                            console.error('Error creating vehicle', error);
                        }
                    });
            }
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.vehicles().length; i++) {
            if (this.vehicles()[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    }
}
