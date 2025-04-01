import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, ColumnDefinition } from '../../layout/component/app.datatable';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Fleet } from '../../models/fleet.interface';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { catchError, throwError, of, finalize } from 'rxjs';

@Component({
    selector: 'app-fleet-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TagModule, ToastModule, ProgressBarModule, ButtonModule, DialogModule, DatePickerModule, FormsModule],
    template: `
        <p-toast></p-toast>
        <app-data-table [title]="'Fleets'" [data]="fleets()" [columns]="columns" [loading]="loading" [rows]="12" [globalFilterFields]="['place', 'repaarationId', 'clientName', 'startDate', 'status']" [customTemplates]="{ release: releaseTemplate }">
            <ng-template #releaseTemplate let-rowData>
                <div class="action-buttons" *ngIf="rowData.status === 'completed'">
                    <button pButton icon="pi pi-fw pi-angle-double-right" [rounded]="true" [outlined]="true" class="p-button-success mr-2" (click)="onComplete(rowData)" [disabled]="processingTransaction"></button>
                </div>
            </ng-template>
        </app-data-table>

        <p-dialog [(visible)]="statusDialog" [style]="{ width: '450px' }" header="Mark as Recovered" [modal]="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="recoveryDate" class="block font-bold mb-3">Recovery Date</label>
                    <p-datePicker [(ngModel)]="recoveryDate" [showIcon]="true" inputId="recoveryDate" dateFormat="yy-mm-dd" [required]="true" class="w-full" [appendTo]="'body'" fluid> </p-datePicker>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" text (click)="statusDialog = false" [disabled]="processingTransaction" />
                <p-button label="Confirm" icon="pi pi-check" (click)="confirmStatusChange()" [loading]="processingTransaction" />
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService]
})
export class FleetList extends ApiCalls implements OnInit {
    fleets = signal<Fleet[]>([]);
    loading: boolean = true;
    statusDialog: boolean = false;
    recoveryDate: Date | null = null;
    selectedReparation: any = null;
    processingTransaction: boolean = false;

    columns: ColumnDefinition[] = [
        {
            field: 'place',
            header: 'Place',
            filterType: 'text',
            style: { 'min-width': '10rem' }
        },
        {
            field: 'vehicleRegistration',
            header: 'Vehicle',
            filterType: 'text',
            style: { 'min-width': '14rem' }
        },
        {
            field: 'clientName',
            header: 'Client',
            filterType: 'text',
            style: { 'min-width': '14rem' }
        },
        {
            field: 'startDate',
            header: 'Start Date',
            filterType: 'date',
            template: 'date',
            style: { 'min-width': '12rem' }
        },
        {
            field: 'completedDate',
            header: 'Completed Date',
            filterType: 'date',
            template: 'date',
            style: { 'min-width': '12rem' }
        },
        {
            field: 'status',
            header: 'Status',
            filterType: 'text',
            style: { 'min-width': '12rem' }
        },
        {
            field: 'release',
            header: 'Release',
            template: 'release',
            style: { 'min-width': '12rem', 'text-align': 'center' }
        }
    ];

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService
    ) {
        super(apiRoutes);
    }

    ngOnInit() {
        this.loadFleets();
    }

    loadFleets() {
        this.loading = true;
        this.apiRoutes.getFleets().subscribe({
            next: (data) => {
                const transformedData = data.map((fleet: any) => {
                    const status = fleet.reparationId?.status || 'N/A';

                    return {
                        ...fleet,
                        clientName: fleet.reparationId?.depositId?.vehicleId?.clientId ? `${fleet.reparationId.depositId.vehicleId.clientId.firstName} ${fleet.reparationId.depositId.vehicleId.clientId.lastName}` : '',
                        vehicleRegistration: fleet.reparationId?.depositId?.vehicleId?.registrationNumber || 'N/A',
                        startDate: fleet.reparationId?.startedAt ? new Date(fleet.reparationId.startedAt) : null,
                        completedDate: fleet.reparationId?.completedAt ? new Date(fleet.reparationId.completedAt) : null,
                        status: status
                    };
                });

                this.fleets.set(transformedData);
                this.loading = false;
            },
            error: (err: any) => {
                this.showError(err.error?.message || 'Failed to load fleets');
                this.loading = false;
            }
        });
    }

    onComplete(reparation: any) {
        if (this.processingTransaction) return;

        this.selectedReparation = reparation;
        this.recoveryDate = new Date();
        this.statusDialog = true;
    }

    confirmStatusChange() {
        if (this.processingTransaction) {
            return;
        }

        if (!this.selectedReparation || !this.recoveryDate) {
            this.showError('Please select a recovery date');
            return;
        }

        const fleetId = this.selectedReparation._id;
        const reparationId = this.selectedReparation.reparationId?._id;
        const originalReparationStatus = this.selectedReparation.reparationId?.status;
        const originalReparationRecoveredAt = this.selectedReparation.reparationId?.recoveredAt;

        if (!reparationId) {
            this.showError('No reparation linked to this fleet');
            return;
        }

        const originalFleets = [...this.fleets()];
        this.processingTransaction = true;
        let transactionFailed = false;

        this.apiRoutes
            .putReparation(reparationId, {
                status: 'recovered',
                recoveredAt: this.recoveryDate
            })
            .pipe(
                catchError((err) => {
                    transactionFailed = true;
                    this.showError('Failed to update reparation status');
                    return throwError(() => err);
                })
            )
            .subscribe({
                next: () => {
                    this.apiRoutes
                        .putFleet(fleetId, {
                            reparationId: null
                        })
                        .pipe(
                            catchError((err) => {
                                transactionFailed = true;
                                this.showError('Failed to update fleet - rolling back changes');

                                return this.apiRoutes
                                    .putReparation(reparationId, {
                                        status: originalReparationStatus,
                                        recoveredAt: originalReparationRecoveredAt
                                    })
                                    .pipe(
                                        catchError((rollbackErr) => {
                                            this.showError('Critical error: Failed to rollback changes. Manual intervention required.');
                                            console.error('Rollback error:', rollbackErr);
                                            return throwError(() => rollbackErr);
                                        }),
                                        finalize(() => {
                                            this.fleets.set(originalFleets);
                                            return throwError(() => err);
                                        })
                                    );
                            }),
                            finalize(() => {
                                this.processingTransaction = false;

                                if (!transactionFailed) {
                                    const updatedFleets = this.fleets().map((fleet) => {
                                        if (fleet._id !== fleetId) return fleet;

                                        return {
                                            ...fleet,
                                            reparationId: null,
                                            completedDate: null,
                                            vehicleRegistration: 'N/A',
                                            startDate: null,
                                            status: 'N/A',
                                            clientName: ''
                                        };
                                    });
                                    this.fleets.set(updatedFleets);
                                    this.showSuccess('Vehicle marked as recovered successfully');
                                    this.resetDialog();
                                } else {
                                    this.fleets.set(originalFleets);
                                }
                            })
                        )
                        .subscribe({
                            error: () => {
                                transactionFailed = true;
                            }
                        });
                },
                error: () => {
                    this.processingTransaction = false;
                    transactionFailed = true;
                }
            });
    }

    private showError(message: string) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 3000
        });
    }

    private showSuccess(message: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000
        });
    }

    private resetDialog() {
        this.statusDialog = false;
        this.selectedReparation = null;
        this.recoveryDate = null;
    }
}
