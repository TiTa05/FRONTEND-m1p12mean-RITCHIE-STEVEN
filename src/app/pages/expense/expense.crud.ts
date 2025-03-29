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
import { DatePickerModule } from 'primeng/datepicker'; // Updated import
import { ApiRoutes } from '../../api/api.routes';
import { Column, ExportColumn } from '../../models/crud-component.interface';

interface Expense {
    _id?: string;
    label: string;
    amount: number;
    date: Date;
}

@Component({
    selector: 'app-expense-crud',
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
        DatePickerModule // Replace Calendar with DatePicker
    ],
    template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedExpenses()" [disabled]="!selectedExpenses || !selectedExpenses.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="expenses()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['label', 'amount']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedExpenses"
            [rowHover]="true"
            dataKey="_id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} expenses"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Expense Management</h5>
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
                    <th pSortableColumn="amount" style="min-width:12rem">
                        Amount
                        <p-sortIcon field="amount" />
                    </th>
                    <th pSortableColumn="date" style="min-width:12rem">
                        Date
                        <p-sortIcon field="date" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-expense>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="expense" />
                    </td>
                    <td style="min-width: 16rem">{{ expense.label }}</td>
                    <td style="min-width: 12rem">{{ expense.amount | number:'1.0-0' }} Ar</td>
                    <td style="min-width: 12rem">{{ expense.date | date: 'mediumDate' }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editExpense(expense)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteExpense(expense)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="5">
                        <p>No expenses available at the moment.</p>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="expenseDialog" [style]="{ width: '450px' }" header="Expense Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="label" class="block font-bold mb-3">Label</label>
                        <input type="text" pInputText id="label" [(ngModel)]="expense.label" required autofocus fluid/>
                        <small class="text-red-500" *ngIf="submitted && !expense.label">Label is required.</small>
                    </div>
                    <div>
                        <label for="amount" class="block font-bold mb-3">Amount</label>
                        <input type="number" pInputText id="amount" [(ngModel)]="expense.amount" required fluid/>
                        <small class="text-red-500" *ngIf="submitted && !expense.amount">Amount is required.</small>
                    </div>
                    <div>
                        <label for="date" class="block font-bold mb-3">Date</label>
                        <p-datePicker id="date" [(ngModel)]="expense.date" [showIcon]="true" dateFormat="yy-mm-dd"  [appendTo]="'body'" [required]="true" fluid></p-datePicker>
                        <small class="text-red-500" *ngIf="submitted && !expense.date">Date is required.</small>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveExpense()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class ExpenseCRUD implements OnInit {
    expenseDialog: boolean = false;
    expenses = signal<Expense[]>([]);
    expense: Expense = { label: '', amount: 0, date: new Date() };
    selectedExpenses: Expense[] | null = null;
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
        this.loadExpenses();
        this.cols = [
            { field: 'label', header: 'Label' },
            { field: 'amount', header: 'Amount' },
            { field: 'date', header: 'Date' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    loadExpenses(): void {
        this.apiRoutes.getExpenses().subscribe({
            next: (data: Expense[]) => {
                this.expenses.set(data);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load expenses',
                    life: 3000
                });
                console.error('Error loading expenses:', err);
            }
        });
    }

    openNew(): void {
        this.expense = { label: '', amount: 0, date: new Date() };
        this.submitted = false;
        this.expenseDialog = true;
    }

    editExpense(expense: Expense): void {
        this.expense = { ...expense };
        this.expenseDialog = true;
    }

    deleteExpense(expense: Expense): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${expense.label}?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (expense._id) {
                    this.apiRoutes.deleteExpense(expense._id).subscribe({
                        next: () => {
                            this.expenses.set(this.expenses().filter((e) => e._id !== expense._id));
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Expense deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete expense',
                                life: 3000
                            });
                            console.error('Error deleting expense', error);
                        }
                    });
                }
            }
        });
    }

    deleteSelectedExpenses(): void {
        if (!this.selectedExpenses || this.selectedExpenses.length === 0) return;

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected expenses?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deletePromises = this.selectedExpenses!.map((expense) => {
                    return new Promise<void>((resolve, reject) => {
                        if (!expense._id) return reject('Missing expense ID');

                        this.apiRoutes.deleteExpense(expense._id).subscribe({
                            next: () => resolve(),
                            error: (err) => reject(err)
                        });
                    });
                });

                Promise.all(deletePromises)
                    .then(() => {
                        this.expenses.set(this.expenses().filter((e) => !this.selectedExpenses!.some((s) => s._id === e._id)));
                        this.selectedExpenses = null;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Expenses deleted',
                            life: 3000
                        });
                    })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete some expenses',
                            life: 3000
                        });
                    });
            }
        });
    }

    hideDialog(): void {
        this.expenseDialog = false;
        this.submitted = false;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    saveExpense(): void {
        this.submitted = true;

        if (!this.expense.label?.trim() || !this.expense.amount || !this.expense.date) return;

        if (this.expense._id) {
            this.apiRoutes.putExpense(this.expense._id, this.expense).subscribe({
                next: (updatedExpense) => {
                    const index = this.expenses().findIndex((e) => e._id === updatedExpense._id);
                    if (index !== -1) {
                        const updated = [...this.expenses()];
                        updated[index] = updatedExpense;
                        this.expenses.set(updated);
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Expense updated',
                        life: 3000
                    });
                    this.resetForm();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update expense',
                        life: 3000
                    });
                }
            });
        } else {
            this.apiRoutes.postExpense(this.expense).subscribe({
                next: (newExpense) => {
                    this.expenses.set([...this.expenses(), newExpense]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Expense created',
                        life: 3000
                    });
                    this.resetForm();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create expense',
                        life: 3000
                    });
                }
            });
        }
    }

    private resetForm(): void {
        this.expense = { label: '', amount: 0, date: new Date() };
        this.expenseDialog = false;
        this.submitted = false;
    }
}
