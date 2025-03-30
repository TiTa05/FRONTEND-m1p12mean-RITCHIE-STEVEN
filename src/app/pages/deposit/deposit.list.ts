import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { MessageService } from 'primeng/api';
import { Deposit } from '../../models/deposit.interface';
import { User } from '../../models/user.interface';
import { Fleet } from '../../models/fleet.interface';
import { InputTextarea } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-deposit-list',
    standalone: true,
    imports: [CommonModule, FormsModule, DataTableComponent, TagModule, AutoCompleteModule, DialogModule, ButtonModule, ToastModule, InputTextarea, MultiSelectModule, DropdownModule, DatePickerModule],
    template: `
        <p-toast></p-toast>
        <app-data-table
            [title]="'Deposits'"
            [data]="deposits()"
            [columns]="columns"
            [loading]="loading"
            [globalFilterFields]="['clientName', 'vehicle', 'appointmentDate', 'typeOfRepair', 'description']"
            [customTemplates]="{ actions: actionsTemplate }"
        >
            <ng-template #actionsTemplate let-rowData>
                <div class="action-buttons">
                    <button pButton icon="pi pi-fw pi-times" [rounded]="true" [outlined]="true" class="p-button-danger mr-2" (click)="onReject(rowData)"></button>
                    <button pButton icon="pi pi-fw pi-check" [rounded]="true" [outlined]="true" class="p-button-success" (click)="onAccept(rowData)"></button>
                </div>
            </ng-template>
        </app-data-table>
        <p-dialog header="Reject Deposit" [(visible)]="rejectModalVisible" [modal]="true" styleClass="p-fluid" [style]="{ width: '450px' }">
            <div class="field mb-4">
                <label for="rejectReason" class="font-bold mb-2 block">Motif</label>
                <textarea id="rejectReason" pInputTextarea rows="3" [(ngModel)]="rejectReason" placeholder="Enter reason for rejection" class="w-full" fluid></textarea>
                <small class="text-red-500" *ngIf="submitted && !rejectReason">Reject reason is required.</small>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-fw pi-times" (click)="rejectModalVisible = false"  styleClass="p-button-text"></p-button>
                <p-button label="Confirm" icon="pi pi-fw pi-check" (click)="confirmReject()"></p-button>
            </ng-template>
        </p-dialog>
        <p-dialog header="Accept Deposit" [(visible)]="acceptModalVisible" [modal]="true" styleClass="p-fluid" [style]="{ width: '450px' }">
            <div class="field mb-4">
                <label for="mechanics" class="font-bold mb-2 block">Mécanicien(s)</label>
                <p-autoComplete
                    [suggestions]="filteredMechanics"
                    (completeMethod)="filterMechanics($event)"
                    [(ngModel)]="selectedMechanics"
                    field="firstName"
                    [multiple]="true"
                    [dropdown]="true"
                    placeholder="Search mechanics"
                    class="w-full"
                    [appendTo]="'body'"
                    fluid
                >
                    <ng-template let-mechanic pTemplate="item">
                        <div>{{ mechanic.firstName }} {{ mechanic.lastName }}</div>
                    </ng-template>
                </p-autoComplete>
                <small class="text-red-500" *ngIf="submitted && selectedMechanics.length == 0">Mechanics is required.</small>
            </div>
            <div class="field mb-4">
                <label for="fleet" class="font-bold mb-2 block">Fleet</label>
                <p-autoComplete
                    id="fleet"
                    [suggestions]="filteredFleet"
                    (completeMethod)="filterFleet($event)"
                    [(ngModel)]="selectedFleet"
                    field="place"
                    [dropdown]="true"
                    placeholder="Search fleet"
                    class="w-full"
                    [appendTo]="'body'"
                    fluid
                ></p-autoComplete>
                <small class="text-red-500" *ngIf="submitted && !selectedFleet">Fleet is required.</small>
            </div>
            <div class="field mb-4">
                <label for="startDate" class="font-bold mb-2 block">Start Date</label>
                <p-datePicker id="startDate" [(ngModel)]="startDate" placeholder="Select the start date" [showIcon]="true" class="w-full" [appendTo]="'body'" fluid />
                <small class="text-red-500" *ngIf="submitted && !startDate">Start Date is required.</small>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-fw pi-times" (click)="acceptModalVisible = false" styleClass="p-button-text"></p-button>
                <p-button label="Confirm" icon="pi pi-fw pi-check" (click)="confirmAccept()"></p-button>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService]
})
export class DepositList extends ApiCalls implements OnInit {
    deposits = signal<Deposit[]>([]);
    mechanics = signal<User[]>([]);
    fleets = signal<Fleet[]>([]);
    loading = true;
    rejectModalVisible = false;
    acceptModalVisible = false;
    rejectReason = '';
    selectedMechanics: User[] = [];
    selectedFleet: Fleet | null = null;
    filteredMechanics: User[] = [];
    filteredFleet: Fleet[] = [];
    submitted: boolean = false;
    selectedDepositId = '';
    startDate: Date;
    columns: ColumnDefinition[] = [
        { field: 'clientName', header: 'Client Name', filterType: 'text', style: { 'min-width': '14rem' } },
        { field: 'vehicle', header: 'Vehicle', filterType: 'text', style: { 'min-width': '18rem' } },
        { field: 'appointmentDate', header: 'Appointment Date', filterType: 'date', template: 'date', style: { 'min-width': '14rem' } },
        { field: 'typeOfRepair', header: 'Type of Repair', filterType: 'text', style: { 'min-width': '14rem' } },
        { field: 'description', header: 'Description', filterType: 'text', style: { 'min-width': '18rem' } },
        { field: 'actions', header: 'Actions', template: 'actions', style: { 'min-width': '10rem', 'text-align': 'center' } }
    ];
    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService
    ) {
        super(apiRoutes);
        this.startDate = new Date();
    }
    ngOnInit() {
        this.loadInitialData();
    }
    private loadInitialData(): void {
        this.loadDeposits();
        this.loadMechanics();
        this.loadFleet();
    }
    private loadDeposits(): void {
        this.loading = true;
        this.apiRoutes.getUnassignedDeposits().subscribe({
            next: (data) => {
                this.deposits.set(this.transformDepositData(data));
                this.loading = false;
            },
            error: (err) => this.handleError(err, 'Failed to load deposits')
        });
    }
    private loadMechanics(): void {
        this.apiRoutes.getAvailableMechanics().subscribe({
            next: (data) => {
                this.mechanics.set(data);
            },
            error: (err) => this.handleError(err, 'Failed to load mechanics')
        });
    }
    private loadFleet(): void {
        this.apiRoutes.getAvailableFleet().subscribe({
            next: (data) => {
                this.fleets.set(data);
            },
            error: (err) => this.handleError(err, 'Failed to load fleet')
        });
    }
    private transformDepositData(data: any[]): Deposit[] {
        return data.map((deposit) => ({
            ...deposit,
            clientName: deposit.vehicleId?.clientId ? `${deposit.vehicleId.clientId.firstName} ${deposit.vehicleId.clientId.lastName}` : '',
            vehicle: deposit.vehicleId ? `${deposit.vehicleId.registrationNumber} - ${deposit.vehicleId.model}` : 'N/A',
            appointmentDate: new Date(deposit.appointmentDate).toLocaleDateString(),
            typeOfRepair: deposit.typeReparationIds?.map((rep: any) => rep.label).join(', ') || 'N/A',
            description: deposit.description || 'N/A'
        }));
    }
    private handleError(err: any, summary: string = 'Error'): void {
        const errorMessage = err.error?.message || 'An unexpected error occurred. Please try again later.';
        this.messageService.add({
            severity: 'error',
            summary,
            detail: errorMessage
        });
        this.loading = false;
    }
    onReject(deposit: Deposit) {
        this.selectedDepositId = deposit._id || '';
        this.submitted = false;
        this.rejectReason = '';
        this.rejectModalVisible = true;
    }
    confirmReject() {
        this.submitted = true;
        if (this.rejectReason) {
            const data = {
                status: 'rejected',
                refusalReason: this.rejectReason,
                depositId: this.selectedDepositId
            };

            this.apiRoutes.postReparation(data).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Rejected',
                        detail: `Deposit has been rejected with reason: ${this.rejectReason}`
                    });

                    this.deposits.set(
                        this.deposits().filter((deposit) => deposit._id !== this.selectedDepositId)
                    );

                    this.rejectModalVisible = false;
                    this.rejectReason = '';
                    this.submitted = false;
                },
                error: (err) => {
                    const errorMessage = err.error?.message || 'An error occurred while rejecting the deposit.';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: errorMessage
                    });
                }
            });
        }
    }
    onAccept(deposit: Deposit) {
        this.selectedDepositId = deposit._id || '';
        this.submitted = false;
        this.selectedFleet = null;
        this.selectedMechanics = [];
        this.acceptModalVisible = true;
    }
    confirmAccept() {
        this.submitted = true; 
        if (this.selectedMechanics.length > 0 && this.selectedFleet && this.startDate) {
            const data = {
                mechanics: this.selectedMechanics.map((mechanic) => mechanic._id),
                fleet: this.selectedFleet._id,
                description: 'Accepted deposit',
                status: 'in_progress',
                depositId: this.selectedDepositId,
                startedAt: this.startDate
            };
            this.apiRoutes.postReparation(data).subscribe({
                next: (reparationResponse) => {
                    this.apiRoutes.putFleet(this.selectedFleet?._id || '', { reparationId: reparationResponse._id }).subscribe({
                        next: (fleetResponse) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Accepted',
                                detail: 'Deposit has been accepted and assigned to selected mechanics and fleet.'
                            });
                            this.mechanics.set(
                                this.mechanics().filter((mechanic) =>
                                    !this.selectedMechanics.some((selectedMechanic) => selectedMechanic._id === mechanic._id)
                                )
                            );
                            this.fleets.set(
                                this.fleets().filter((fleet) => fleet._id !== this.selectedFleet?._id)
                            );

                            this.deposits.set(
                                this.deposits().filter((deposit) => deposit._id !== this.selectedDepositId)
                            );    
                            this.acceptModalVisible = false;
                            this.selectedMechanics = [];
                            this.selectedFleet = null;
                            this.submitted = false;
                        },
                        error: (err) => {
                            this.rollbackReparation(reparationResponse._id);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'An error occurred while assigning the fleet. Changes have been rolled back.'
                            });
                        }
                    });
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'An error occurred while creating the reparation.'
                    });
                }
            });
        }
    }
    private rollbackReparation(reparationId: string): void {
        this.apiRoutes.deleteReparation(reparationId).subscribe({
            next: () => {
                console.log(`Reparation ${reparationId} successfully rolled back.`);
            },
            error: (err) => {
                console.error(`Failed to rollback reparation ${reparationId}:`, err.message);
            }
        });
    }

    filterMechanics(event: any) {
        const query = event.query.toLowerCase();
        this.filteredMechanics = this.mechanics().filter(
            (mechanic) =>
                `${mechanic.firstName.toLowerCase()} ${mechanic.lastName?.toLowerCase()}`.includes(query) ||
                mechanic.firstName.toLowerCase().includes(query) ||
                mechanic.lastName?.toLowerCase().includes(query)
        );
    }
    filterFleet(event: any) {
        const query = event.query.toLowerCase();
        this.filteredFleet = this.fleets().filter((fleet) => fleet.place.toString().toLowerCase().includes(query));
    }
}
