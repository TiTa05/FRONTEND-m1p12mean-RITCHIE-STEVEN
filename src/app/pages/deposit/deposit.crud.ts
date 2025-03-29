
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
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ApiCalls } from '../../api/api-calls.abstractclass';

import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { getUserId } from '../../../utils/utils';

@Component({
    selector: 'app-deposit-crud',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule, AutoCompleteModule, DropdownModule],
    template: `
      <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
        <ng-template pTemplate="start">
            <p-button label="New Deposit" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()"></p-button>
            <p-button label="Delete" icon="pi pi-trash" severity="secondary" outlined (onClick)="deleteSelectedDeposits()" [disabled]="!selectedDeposits || !selectedDeposits.length"></p-button>
        </ng-template>
        <ng-template pTemplate="end">
            <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()"></p-button>
        </ng-template>
        </p-toolbar>

        <p-table
        #dt
        [value]="deposits()"
        [paginator]="true"
        [rows]="10"
        [globalFilterFields]="['vehicleId', 'typeReparationIds', 'appointmentDate', 'clientId', 'description']"
        [dataKey]="'_id'"
        [resizableColumns]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} deposits"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10,20,30]"
        [(selection)]="selectedDeposits"
        [tableStyle]="{'min-width':'75rem'}"
        >
        </p-table>

        <ng-template pTemplate="caption">
        <div class="flex items-center justify-between">
            <h5 class="m-0">Deposit Management</h5>
            <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input pInputText type="text" (input)="handleFilter($event, dt)" placeholder="Search..." />
            </span>
        </div>
        </ng-template>

        <ng-template pTemplate="header">
        <tr>
            <th style="width:3rem">
            <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
            </th>
            <th pSortableColumn="vehicleId">Vehicle ID <p-sortIcon field="vehicleId"></p-sortIcon></th>
            <th pSortableColumn="typeReparationIds">Type Réparation <p-sortIcon field="typeReparationIds"></p-sortIcon></th>
            <th pSortableColumn="appointmentDate">Appointment Date <p-sortIcon field="appointmentDate"></p-sortIcon></th>
            <th pSortableColumn="description">Description <p-sortIcon field="description"></p-sortIcon></th>
            <th style="min-width: 12rem"></th>
        </tr>
        </ng-template>

        <ng-template pTemplate="body" let-deposit>
        <tr>
            <td>
            <p-tableCheckbox [value]="deposit"></p-tableCheckbox>
            </td>
            <td>{{ deposit.vehicleId }}</td>
            <td>{{ deposit.typeReparationIds }}</td>
            <td>{{ deposit.appointmentDate | date:'shortDate' }}</td>
            <td>{{ deposit.clientId }}</td>
            <td>{{ deposit.description }}</td>
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

        <p-dialog [(visible)]="depositDialog" [style]="{'width': '450px'}" header="Deposit Details" [modal]="true">
        <ng-template pTemplate="content">
            <div class="p-fluid">
            <div class="field">
                <label for="vehicleId">Vehicle ID</label>
                <p-dropdown 
                    id="vehicleId"
                    [options]="vehicles()"
                    optionLabel="registrationNumber" 
                    optionValue="_id"
                    [(ngModel)]="deposit.vehicleId"
                    placeholder="Select a Vehicle"
                    required
                    (onChange)="onSelectVehicle($event)">
                    <ng-template let-vehicle pTemplate="item">
                        <div>
                            {{ vehicle.registrationNumber }} - {{ vehicle.model }} - {{ vehicle.color }}
                        </div>
                    </ng-template>
                </p-dropdown>
            </div>
            <div class="field">
                <label for="typeReparation">Type de Réparation</label>
                <p-autoComplete
                    [(ngModel)]="selectedTypeReparation"
                    [suggestions]="filteredReparationTypes"
                    (completeMethod)="filterReparationTypes($event)"
                    (onSelect)="onSelect($event)"
                    [dropdown]="true"
                    [forceSelection]="true"
                    [appendTo]="'body'"
                    placeholder="Sélectionner un type de réparation"
                    field="label" >
                </p-autoComplete>

                <small class="text-red-500" *ngIf="submitted && !deposit.typeReparationIds">
                Type de réparation est requis.
                </small>
            </div>

            <div class="field">
                <label for="appointmentDate">Appointment Date</label>
                <input id="appointmentDate" type="date" pInputText [(ngModel)]="deposit.appointmentDate" required />
            </div>
            <div class="field">
                <label for="description">Description</label>
                <textarea id="description" pInputTextarea [(ngModel)]="deposit.description"></textarea>
            </div>  
            </div>
        </ng-template>
        <ng-template pTemplate="footer">
            <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()"></p-button>
            <p-button label="Save" icon="pi pi-check" (click)="saveDeposit()"></p-button>
        </ng-template>
        </p-dialog>

        <p-confirmdialog header="Confirmation" icon="pi pi-exclamation-triangle"></p-confirmdialog>

    `,
    providers: [MessageService, ConfirmationService]
  })
  
  export class DepositCRUD extends ApiCalls implements OnInit {
    filteredReparationTypes: any[] = [];
    typesReparation: any[] = [];
    selectedVehicle: any; 
    selectedTypeReparation: string = '';
    exportCSV() {
        throw new Error('Method not implemented.');
    }
    handleFilter($event: Event,_t22: Table) {
        throw new Error('Method not implemented.');
    }
    hideDialog() {
        this.depositDialog = false;
        this.submitted = false;
    }
    depositDialog: boolean = false;
    deposits = signal<Deposit[]>([]);
    vehicles = signal<Vehicle[]>([]);
    reparationTypes = signal<Reparation[]>([]);
    deposit!: Deposit;
    selectedDeposits!: Deposit[] | null;
    submitted: boolean = false;
    @ViewChild('dt') dt!: Table;
    id: string | null = null;

    // Pour la gestion des filtres des véhicules
    filteredVehicles: Vehicle[] = [];
    filteredTypes: Reparation[] = [];

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
        this.loadVehicles();  // Charger les véhicules pour l'utilisateur connecté
        this.loadTypeReparations(); // Charger les types de réparation
    }

    // Charge les dépôts existants
    loadDeposits() {
        this.apiRoutes.getDeposits().subscribe({
            next: (data) => {
                this.deposits.set(data);
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
                console.log("Véhicules chargés :", data); 
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
    

    // Charge les types de réparation
    loadTypeReparations() {
        this.apiRoutes.getReparations().subscribe({
            next: (data) => {
                console.log("Données récupérées :", data);
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

    // Ouvre le dialogue pour ajouter un nouveau dépôt
    openNew() {
        this.deposit = { 
            vehicleId: '', 
            typeReparationIds: '', 
            appointmentDate: new Date()
        };
        this.submitted = false;
        this.depositDialog = true;
    }    

    // Édite un dépôt existant
    editDeposit(deposit: Deposit) {
        this.deposit = { ...deposit };
        this.depositDialog = true;
    }

    // Supprime les dépôts sélectionnés
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

    // Supprime un dépôt spécifique
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
                            typeReparationIds: '', 
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

    // Sauvegarde le dépôt (création ou modification)
    saveDeposit() {
        this.submitted = true;

        if (this.deposit.vehicleId?.trim() && this.deposit.typeReparationIds?.trim() && this.deposit.appointmentDate) {
            if (this.deposit._id) {
                this.apiRoutes.putDeposit(this.deposit._id, this.deposit).subscribe({
                    next: (updatedDeposit) => {
                        if (this.deposit._id) { // Vérification que _id est défini
                            const index = this.findIndexById(this.deposit._id);
                            let _deposits = this.deposits();
                            if (index !== -1) {
                                _deposits[index] = updatedDeposit;
                                this.deposits.set([..._deposits]);
                            }
                    
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Deposit updated',
                                life: 3000
                            });
                            this.depositDialog = false;
                            this.deposit = { 
                                vehicleId: '', 
                                typeReparationIds: '', 
                                appointmentDate: new Date()
                            };
                            this.loadDeposits();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Invalid deposit ID',
                                life: 3000
                            });
                        }
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
                this.apiRoutes
                    .postDeposit(this.deposit)
                    .subscribe({
                        next: (newDeposit) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Deposit created',
                                life: 3000
                            });
                            this.depositDialog = false;
                            this.deposit = { 
                                vehicleId: '', 
                                typeReparationIds: '', 
                                appointmentDate: new Date()
                            };
                            this.loadDeposits();
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

    // Recherche un dépôt par son ID
    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.deposits().length; i++) {
            if (this.deposits()[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    // Filtre les véhicules en fonction du texte de recherche
    filterVehicles(event: any) {
        const query = event.query.toLowerCase();
        const allVehicles = this.vehicles();
        this.filteredVehicles = allVehicles.filter((vehicle) => vehicle.registrationNumber.toLowerCase().includes(query));
    }

    filterReparationTypes(event: any) {
        console.log('Recherche:', event.query);
        
        const reparationTypesArray = this.reparationTypes();
        
        if (!reparationTypesArray || reparationTypesArray.length === 0) {
            console.error("⚠️ Aucun type de réparation chargé !");
            this.filteredReparationTypes = [];
            return;
        }
    
        this.filteredReparationTypes = reparationTypesArray.filter((type: any) =>
            type.label?.toLowerCase().includes(event.query.toLowerCase())
        );
    
        console.log("Résultats filtrés :", this.filteredReparationTypes);
    }
    

    onSelect(selectedType: any) {
        console.log('Type de réparation sélectionné :', selectedType);
        this.selectedTypeReparation = selectedType._id; // Stocke l'ID et non le label
    }

    onSelectVehicle(event: any) {
        console.log('Véhicule sélectionné :', event);
        this.deposit.vehicleId = event.value?._id || event.value; 
    }
    
    
}