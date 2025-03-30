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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiRoutes } from '../../api/api.routes';
import { Deposit } from '../../models/deposit.interface';
import { Vehicle } from '../../models/vehicle.interface';
import { Reparation } from '../../models/reparation.interface';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextarea } from 'primeng/inputtextarea';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { getUserId } from '../../../utils/utils';
import { ExportColumn, Column } from '../../models/crud-component.interface';
import { ReparationRejectedList } from '../reparation/reparation-rejected.list';
@Component({
    selector: 'app-deposit-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        AutoCompleteModule,
        DropdownModule,
        DatePickerModule,
        InputTextarea,
        MultiSelectModule,
        ReparationRejectedList
    ],
    template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template pTemplate="start">
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()"></p-button>
                <p-button label="Delete" icon="pi pi-trash" severity="secondary" outlined (onClick)="deleteSelectedDeposits()" [disabled]="!selectedDeposits || !selectedDeposits.length"></p-button>
            </ng-template>
            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()"></p-button>
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="deposits()"
            [paginator]="true"
            [rows]="10"
            [columns]="cols"
            [globalFilterFields]="['vehicleId', 'typeReparationIds', 'appointmentDate', 'clientId', 'description']"
            [dataKey]="'_id'"
            [resizableColumns]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} deposits"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
            [(selection)]="selectedDeposits"
            [tableStyle]="{ 'min-width': '75rem' }"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Deposit Management</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template pTemplate="header">
                <tr>
                    <th style="width:3rem">
                        <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                    </th>
                    <th pSortableColumn="vehicleId">Vehicle <p-sortIcon field="vehicleId"></p-sortIcon></th>
                    <th pSortableColumn="typeReparationIds">Repair Types <p-sortIcon field="typeReparationIds"></p-sortIcon></th>
                    <th pSortableColumn="appointmentDate">Appointment Date <p-sortIcon field="appointmentDate"></p-sortIcon></th>
                    <th pSortableColumn="description">Description <p-sortIcon field="description"></p-sortIcon></th>
                    <th pSortableColumn="totalPrice">Total Price <p-sortIcon field="totalPrice"></p-sortIcon></th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-deposit>
                <tr>
                    <td>
                        <p-tableCheckbox [value]="deposit"></p-tableCheckbox>
                    </td>
                    <td>{{ getVehicleInfo(deposit.vehicleId._id) }}</td>
                    <td>{{ getReparationInfo(deposit.typeReparationIds) }}</td>
                    <td>{{ deposit.appointmentDate | date: 'mediumDate' }}</td>
                    <td>{{ deposit.description }}</td>
                    <td>{{ calculateTotalPrice(deposit.typeReparationIds) | number: '1.0-0' }} Ar</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editDeposit(deposit)"></p-button>
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteDeposit(deposit)"></p-button>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="7">No deposits found.</td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="depositDialog" [style]="{ width: '550px' }" header="Deposit Details" [modal]="true">
            <ng-template pTemplate="content">
                <div class="p-fluid">
                    <div class="field mb-4">
                        <label for="vehicleId" class="font-bold mb-2 block">Vehicle</label>
                        <p-autoComplete
                            id="vehicleId"
                            [suggestions]="filteredVehicles"
                            (completeMethod)="filterVehicles($event)"
                            field="registrationNumber"
                            [dropdown]="true"
                            [forceSelection]="true"
                            [(ngModel)]="selectedVehicle"
                            placeholder="Search for a vehicle"
                            [required]="true"
                            styleClass="w-full"
                            (onSelect)="onVehicleSelect($event)"
                        >
                            <ng-template let-vehicle pTemplate="item">
                                <div>{{ vehicle.registrationNumber }} - {{ vehicle.model }} - {{ vehicle.color }}</div>
                            </ng-template>
                        </p-autoComplete>
                        <small class="text-red-500" *ngIf="submitted && !deposit.vehicleId">Vehicle is required.</small>
                    </div>

                    <div class="field mb-4">
                        <label for="typeReparation" class="font-bold mb-2 block">Repair Types</label>
                        <p-autoComplete
                            id="typeReparation"
                            [suggestions]="filteredRepairs"
                            (completeMethod)="filterRepairs($event)"
                            field="label"
                            [dropdown]="true"
                            [multiple]="true"
                            [forceSelection]="true"
                            [(ngModel)]="selectedRepairs"
                            placeholder="Search for repair types"
                            [required]="true"
                            styleClass="w-full"
                            (onSelect)="onRepairsSelect()"
                            (onUnselect)="onRepairsSelect()"
                        >
                            <ng-template let-repair pTemplate="item">
                                <div>{{ repair.label }} - {{ repair.cost | number: '1.0-0' }}</div>
                            </ng-template>
                            <ng-template let-repair pTemplate="selectedItem">
                                <div>{{ repair.label }} - {{ repair.cost | number: '1.0-0' }}</div>
                            </ng-template>
                        </p-autoComplete>
                        <small class="text-red-500" *ngIf="submitted && (!selectedRepairs || selectedRepairs.length === 0)">At least one repair type is required.</small>
                    </div>

                    <div class="field mb-4">
                        <label for="appointmentDate" class="font-bold mb-2 block">Appointment Date</label>
                        <p-datePicker id="appointmentDate" [(ngModel)]="deposit.appointmentDate" [showIcon]="true" dateFormat="yy-mm-dd" [required]="true" styleClass="w-full" [appendTo]="'body'"></p-datePicker>
                        <small class="text-red-500" *ngIf="submitted && !deposit.appointmentDate">Date is required.</small>
                    </div>

                    <div class="field mb-4">
                        <label for="description" class="font-bold mb-2 block">Description</label>
                        <textarea id="description" pInputTextarea [(ngModel)]="deposit.description" rows="3" styleClass="w-full" fluid></textarea>
                    </div>

                    <div class="field mb-4 text-right">
                        <span class="font-bold">Total Price: </span>
                        <span class="text-xl">{{ calculateSelectedTotal() | number: '1.0-0' }} Ar</span>
                    </div>
                </div>
            </ng-template>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" (onClick)="hideDialog()" styleClass="p-button-text"></p-button>
                <p-button label="Save" icon="pi pi-check" (onClick)="saveDeposit()"></p-button>
            </ng-template>
        </p-dialog>

        <p-confirmDialog [style]="{ width: '450px' }"></p-confirmDialog>
        <div class='mt-10'>
            <app-reparation-rejected-list></app-reparation-rejected-list>
        </div>
    `,
    providers: [MessageService, ConfirmationService]
})
export class DepositCRUD extends ApiCalls implements OnInit {
    depositDialog: boolean = false;
    deposits = signal<Deposit[]>([]);
    vehicles = signal<Vehicle[]>([]);
    reparationTypes = signal<Reparation[]>([]);
    deposit: any = {
        vehicleId: '',
        typeReparationIds: [],
        appointmentDate: new Date()
    };
    selectedDeposits: Deposit[] | null = null;
    submitted: boolean = false;
    @ViewChild('dt') dt!: Table;
    id: string | null = null;

    selectedVehicle: Vehicle | null = null;
    filteredVehicles: Vehicle[] = [];

    selectedRepairs: Reparation[] = [];
    filteredRepairs: Reparation[] = [];
    exportColumns!: ExportColumn[];
    cols!: Column[];
    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super(apiRoutes);
        const token = localStorage.getItem('token');
        this.id = token ? getUserId(token) : null;
    }

    ngOnInit() {
        this.loadDeposits();
        this.loadVehicles();
        this.loadTypeReparations();
        this.cols = [
            { field: 'vehicle', header: 'Vehicle' },
            { field: 'repairTypes', header: 'Repair Types' },
            { field: 'appointmentDateFormatted', header: 'Appointment Date' },
            { field: 'description', header: 'Description' },
            { field: 'totalPrice', header: 'Total Price' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    loadDeposits() {
        this.apiRoutes.getUnassignedDepositsByClient(this.id || '').subscribe({
            next: (data) => {
                const transformedDeposits = data.map((deposit: any) => this.transformDeposit(deposit));
                this.deposits.set(transformedDeposits);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load deposits',
                    life: 3000
                });
                console.error('Error loading deposits', error);
            }
        });
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

    loadTypeReparations() {
        this.apiRoutes.getReparationsType().subscribe({
            next: (data) => {
                this.reparationTypes.set(data);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load repair types',
                    life: 3000
                });
                console.error('Error loading repair types', error);
            }
        });
    }

    getVehicleInfo(vehicleId: string): string {
        const vehicle = this.vehicles().find((v) => v._id === vehicleId);
        return vehicle ? `${vehicle.registrationNumber} - ${vehicle.model}` : 'Vehicle not found';
    }

    getReparationInfo(typeIds: Reparation[]): string {
        if (!typeIds || !Array.isArray(typeIds)) {
            return 'No repair types assigned';
        }

        return typeIds
            .map((id) => {
                const repType = this.reparationTypes().find((r) => r._id === id._id);
                return repType ? repType.label : 'Unknown repair type';
            })
            .join(', ');
    }

    calculateTotalPrice(typeIds: Reparation[]): number {
        if (!typeIds || !Array.isArray(typeIds)) {
            return 0;
        }

        return typeIds.reduce((total, id) => {
            const repType = this.reparationTypes().find((r) => r._id === id._id);
            return total + (repType?.cost || 0);
        }, 0);
    }

    calculateSelectedTotal(): number {
        if (!this.selectedRepairs || this.selectedRepairs.length === 0) {
            return 0;
        }

        return this.selectedRepairs.reduce((total, repair) => total + (repair.cost || 0), 0);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    openNew() {
        this.deposit = {
            vehicleId: '',
            typeReparationIds: [],
            appointmentDate: new Date()
        };
        this.selectedVehicle = null;
        this.selectedRepairs = [];
        this.submitted = false;
        this.depositDialog = true;
    }

    editDeposit(deposit: Deposit) {
        this.deposit = { ...deposit };

        if (!Array.isArray(this.deposit.typeReparationIds)) {
            this.deposit.typeReparationIds = [this.deposit.typeReparationIds].filter(Boolean);
        }

        if (this.deposit.appointmentDate && typeof this.deposit.appointmentDate === 'string') {
            this.deposit.appointmentDate = new Date(this.deposit.appointmentDate);
        }

        this.selectedVehicle = this.vehicles().find((v) => v._id === this.deposit.vehicleId._id) || null;
        this.selectedRepairs = this.reparationTypes().filter((repair) => this.deposit.typeReparationIds.map((typeReparation: Reparation) => typeReparation._id).includes(repair._id || ''));

        this.depositDialog = true;
    }

    filterVehicles(event: any) {
        const query = event.query.toLowerCase();
        this.filteredVehicles = this.vehicles().filter((vehicle) => vehicle.registrationNumber.toLowerCase().includes(query) || vehicle.model.toLowerCase().includes(query) || (vehicle.color && vehicle.color.toLowerCase().includes(query)));
    }

    onVehicleSelect(event: any) {
        if (event && event.value._id) {
            this.deposit.vehicleId = event.value._id;
        }
    }

    filterRepairs(event: any) {
        const query = event.query.toLowerCase();
        this.filteredRepairs = this.reparationTypes().filter((repair) => repair.label.toLowerCase().includes(query));
    }

    onRepairsSelect() {
        this.deposit.typeReparationIds = this.selectedRepairs.map((repair) => repair._id || '');
    }

    deleteSelectedDeposits() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected deposits?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (this.selectedDeposits) {
                    const deletePromises = this.selectedDeposits.map(
                        (deposit) =>
                            new Promise<void>((resolve, reject) => {
                                this.apiRoutes.deleteDeposit(deposit._id!).subscribe({
                                    next: () => resolve(),
                                    error: (error) => reject(error)
                                });
                            })
                    );

                    Promise.all(deletePromises)
                        .then(() => {
                            this.deposits.set(this.deposits().filter((val) => !this.selectedDeposits?.includes(val)));
                            this.selectedDeposits = null;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Deposits deleted',
                                life: 3000
                            });
                        })
                        .catch(() => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete some deposits',
                                life: 3000
                            });
                        })
                        .finally(() => {
                            this.loadDeposits();
                        });
                }
            }
        });
    }

    deleteDeposit(deposit: Deposit) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this deposit?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.apiRoutes.deleteDeposit(deposit._id!).subscribe({
                    next: () => {
                        this.deposits.set(this.deposits().filter((val) => val._id !== deposit._id));
                        this.deposit = {
                            vehicleId: '',
                            typeReparationIds: [],
                            appointmentDate: new Date()
                        };
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Deposit deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete deposit',
                            life: 3000
                        });
                        console.error('Error deleting deposit', error);
                    }
                });
            }
        });
    }

    hideDialog() {
        this.depositDialog = false;
        this.submitted = false;
    }

    transformDeposit(deposit: any): any {
        return {
            ...deposit,
            vehicle: this.getVehicleInfo(deposit.vehicleId._id),
            repairTypes: this.getReparationInfo(deposit.typeReparationIds),
            appointmentDateFormatted: new Date(deposit.appointmentDate).toLocaleDateString(),
            description: deposit.description || 'No description provided',
            totalPrice: `${this.calculateTotalPrice(deposit.typeReparationIds).toLocaleString()} Ar`
        };
    }

    saveDeposit() {
        this.submitted = true;
        if (this.deposit.vehicleId && this.deposit.typeReparationIds.length > 0 && this.deposit.appointmentDate) {
            if (this.deposit._id) {
                this.apiRoutes.putDeposit(this.deposit._id, this.deposit).subscribe({
                    next: (updatedDeposit) => {
                        const enrichedDeposit = this.transformDeposit(updatedDeposit);

                        const index = this.findIndexById(this.deposit._id!);
                        let _deposits = this.deposits();
                        if (index !== -1) {
                            _deposits[index] = enrichedDeposit;
                            this.deposits.set([..._deposits]);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Deposit updated',
                            life: 3000
                        });
            
                        this.resetForm();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update deposit',
                            life: 3000
                        });
                        console.error('Error updating deposit', error);
                    }
                });
            } else {
                this.apiRoutes.postDeposit(this.deposit).subscribe({
                    next: (newDeposit) => {
                        const transformedDeposit = this.transformDeposit(newDeposit);

                        this.deposits.set([...this.deposits(), transformedDeposit]);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Deposit created',
                            life: 3000
                        });
                        this.resetForm();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to create deposit',
                            life: 3000
                        });
                        console.error('Error creating deposit', error);
                    }
                });
            }
        }
    }

    findIndexById(id: string): number {
        return this.deposits().findIndex((deposit) => deposit._id === id);
    }

    resetForm() {
        this.deposit = {
            vehicleId: '',
            typeReparationIds: [],
            appointmentDate: new Date()
        };
        this.selectedVehicle = null;
        this.selectedRepairs = [];
        this.depositDialog = false;
        this.submitted = false;
    }
}
