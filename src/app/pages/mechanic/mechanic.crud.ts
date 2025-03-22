import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { Column, ExportColumn } from '../../models/crud-component.interface';
import { Country } from '../../models/country.interface';
import { MechanicForm } from '../../models/mechanic-form.interface';
import { COUNTRIES } from '../../../utils/utils';
@Component({
    selector: 'app-mechanic-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        PasswordModule,
        InputMaskModule,
        DropdownModule,
        FileUploadModule,
        DividerModule
    ],
    template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedMechanics()" [disabled]="!selectedMechanics || !selectedMechanics.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="mechanics()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['firstName', 'lastName', 'email', 'phoneNumber']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedMechanics"
            [rowHover]="true"
            dataKey="_id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} mechanics"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Mechanic Management</h5>
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
                    <th pSortableColumn="firstName" style="min-width:10rem">
                        Picture
                        <p-sortIcon field="picture" />
                    </th>
                    <th pSortableColumn="firstName" style="min-width:10rem">
                        First Name
                        <p-sortIcon field="firstName" />
                    </th>
                    <th pSortableColumn="lastName" style="min-width:10rem">
                        Last Name
                        <p-sortIcon field="lastName" />
                    </th>
                    <th pSortableColumn="email" style="min-width:14rem">
                        Email
                        <p-sortIcon field="email" />
                    </th>
                    <th pSortableColumn="phoneNumber" style="min-width:12rem">
                        Phone Number
                        <p-sortIcon field="phoneNumber" />
                    </th>
                    <th pSortableColumn="phoneNumber" style="min-width:12rem">
                        Salary
                        <p-sortIcon field="salary" />
                    </th>
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-mechanic>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="mechanic" />
                    </td>
                    <td style="min-width: 5rem">
                        <img *ngIf="mechanic.picture" [src]="'data:image/png;base64,' + mechanic.picture" alt="{{ mechanic.firstName }}'s picture" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;" />
                        <span *ngIf="!mechanic.picture" style="text-align: center; font-size: 14px; line-height: 1.5;"> N/A </span>
                    </td>
                    <td style="min-width: 10rem">{{ mechanic.firstName }}</td>
                    <td style="min-width: 10rem">{{ mechanic.lastName }}</td>
                    <td style="min-width: 14rem">{{ mechanic.email }}</td>
                    <td style="min-width: 12rem">{{ mechanic.phoneNumber }}</td>
                    <td style="min-width: 12rem">{{ mechanic.salary | number: '1.2-2' }} Ar</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editMechanic(mechanic)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteMechanic(mechanic)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="6">
                        <p>No mechanics available at the moment.</p>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="mechanicDialog" [style]="{ width: '650px' }" header="Mechanic Details" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-column md:flex-row gap-4">
                        <div class="flex-1">
                            <label for="firstName" class="block font-bold mb-2">First Name</label>
                            <input type="text" pInputText id="firstName" [(ngModel)]="mechanic.firstName" required autofocus class="w-full" />
                            <small class="text-red-500" *ngIf="submitted && !mechanic.firstName">First name is required.</small>
                        </div>
                        <div class="flex-1">
                            <label for="lastName" class="block font-bold mb-2">Last Name</label>
                            <input type="text" pInputText id="lastName" [(ngModel)]="mechanic.lastName" required class="w-full" />
                            <small class="text-red-500" *ngIf="submitted && !mechanic.lastName">Last name is required.</small>
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block font-bold mb-2">Email</label>
                        <input type="email" pInputText id="email" [(ngModel)]="mechanic.email" required class="w-full" />
                        <small class="text-red-500" *ngIf="submitted && !mechanic.email">Email is required.</small>
                    </div>

                    <div>
                        <label for="phone" class="block font-bold mb-2">Phone Number</label>
                        <div style="display: flex; width: 100%;">
                            <div style="width: 150px; margin-right: 10px;">
                                <p-dropdown [options]="countries" [(ngModel)]="mechanic.countryCode" optionLabel="name" [showClear]="false" styleClass="w-full">
                                    <ng-template let-country pTemplate="item">
                                        <div class="flex items-center">
                                            <span class="flag !w-[20px] !h-[15px] inline-block" [ngClass]="country.flag"></span>
                                            <span class="ml-2">{{ country.name }} ({{ country.dialCode }})</span>
                                        </div>
                                    </ng-template>
                                    <ng-template let-country pTemplate="selectedItem">
                                        <div class="flex items-center">
                                            <span class="flag !w-[20px] !h-[15px] inline-block" [ngClass]="country.flag"></span>
                                            <span class="ml-2">{{ country.dialCode }}</span>
                                        </div>
                                    </ng-template>
                                </p-dropdown>
                            </div>
                            <div style="flex: 1;">
                                <p-inputMask id="phone" [(ngModel)]="mechanic.phone" [mask]="selectedCountry.format" placeholder="{{ selectedCountry.format }}" styleClass="w-full" inputStyleClass="w-full"> </p-inputMask>
                            </div>
                        </div>
                        <small class="text-red-500" *ngIf="submitted && (!mechanic.countryCode || !mechanic.phone)">Complete phone number is required.</small>
                    </div>

                    <div>
                        <label for="salary" class="block font-bold mb-2">Salary</label>
                        <input type="number" pInputText id="salary" [(ngModel)]="mechanic.salary" required class="w-full" min="0" placeholder="Enter salary" />
                        <small class="text-red-500" *ngIf="submitted && !mechanic.salary && mechanic.salary !== 0">Salary is required.</small>
                    </div>

                    <div *ngIf="!mechanic._id">
                        <label for="password" class="block font-bold mb-2">Password</label>
                        <p-password id="password" [(ngModel)]="mechanic.password" [toggleMask]="true" [feedback]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
                        <small class="text-red-500" *ngIf="submitted && !mechanic.password">Password is required.</small>
                    </div>

                    <p-divider></p-divider>

                    <div>
                        <label class="block font-bold mb-2">Profile Picture</label>
                        <p-fileUpload
                            #fileUpload
                            [showUploadButton]="false"
                            [showCancelButton]="false"
                            [multiple]="false"
                            accept="image/*"
                            [maxFileSize]="800000"
                            (onSelect)="onFileSelect($event)"
                            (onRemove)="onFileRemove()"
                            chooseLabel="Select Image"
                            styleClass="w-full"
                            [style]="{ width: '100%' }"
                            [customUpload]="true"
                        >
                            <ng-template pTemplate="content">
                                <div class="flex flex-col items-center p-3 h-full" *ngIf="!selectedFile && !previewUrl">
                                    <div class="flex flex-col items-center flex-grow">
                                        <i class="pi pi-image text-4xl text-primary mb-2"></i>
                                        <span class="text-muted-color text-center">Drag and drop an image here or click to select</span>
                                    </div>
                                    <span class="text-muted-color text-sm text-center">Max size: 800KB</span>
                                </div>
                                <div *ngIf="selectedFile || previewUrl" class="flex justify-content-center p-3">
                                    <div class="relative">
                                        <img [src]="previewUrl" alt="Preview" class="w-24 h-24 rounded-full object-cover" />
                                        <button type="button" pButton icon="pi pi-times" class="p-button-rounded p-button-danger p-button-sm absolute -top-2 -right-2" (click)="removeImage(fileUpload)"></button>
                                    </div>
                                </div>
                            </ng-template>
                        </p-fileUpload>
                        <small class="text-red-500" *ngIf="fileError">{{ fileError }}</small>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveMechanic()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class MechanicCRUD extends ApiCalls implements OnInit {
    mechanicDialog: boolean = false;
    mechanics = signal<MechanicForm[]>([]);
    mechanic!: MechanicForm;
    selectedMechanics!: MechanicForm[] | null;
    submitted: boolean = false;
    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    fileError: string | null = null;
    @ViewChild('dt') dt!: Table;
    exportColumns!: ExportColumn[];
    cols!: Column[];
    countries: Country[];
    selectedCountry: Country;

    constructor(
        apiRoutes: ApiRoutes,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super(apiRoutes);
        this.countries = COUNTRIES;

        this.selectedCountry = this.countries[0];
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadMechanics();
        this.cols = [
            { field: 'firstName', header: 'First Name' },
            { field: 'lastName', header: 'Last Name' },
            { field: 'email', header: 'Email' },
            { field: 'phoneNumber', header: 'Phone Number' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    loadMechanics() {
        this.apiRoutes.getMechanics().subscribe({
            next: (data) => {
                this.mechanics.set(data);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load mechanics',
                    life: 3000
                });
                console.error('Error loading mechanics', error);
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.mechanic = {
            _id: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            countryCode: this.countries[0],
            phone: '',
            password: '',
            salary: 0
        };
        this.submitted = false;
        this.mechanicDialog = true;
        this.selectedFile = null;
        this.previewUrl = null;
        this.fileError = null;
    }

    editMechanic(mechanic: MechanicForm) {
        this.mechanic = { ...mechanic };

        if (mechanic.phoneNumber && !mechanic.countryCode) {
            const phoneNumberParts = mechanic.phoneNumber.split(' ');
            const dialCode = phoneNumberParts[0];
            const phoneNumber = phoneNumberParts.slice(1).join(' ');

            const country = this.countries.find((c) => c.dialCode === dialCode);
            if (country) {
                this.mechanic.countryCode = country;
                this.mechanic.phone = phoneNumber;
                this.selectedCountry = country;
            }
        }

        if (mechanic.picture) {
            console.log();
            this.previewUrl = `data:image/png;base64,${mechanic.picture}`;
        }

        this.mechanicDialog = true;
    }

    deleteSelectedMechanics() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected mechanics?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (this.selectedMechanics) {
                    const deletePromises = this.selectedMechanics.map(
                        (mechanic) =>
                            new Promise<void>((resolve, reject) => {
                                this.apiRoutes.deleteUSer(mechanic._id).subscribe({
                                    next: () => resolve(),
                                    error: (error) => reject(error)
                                });
                            })
                    );

                    Promise.all(deletePromises)
                        .then(() => {
                            this.mechanics.set(this.mechanics().filter((val) => !this.selectedMechanics?.includes(val)));
                            this.selectedMechanics = null;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Mechanics deleted',
                                life: 3000
                            });
                        })
                        .catch(() => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete some mechanics',
                                life: 3000
                            });
                        })
                        .finally(() => {
                            this.loadMechanics();
                        });
                }
            }
        });
    }

    hideDialog() {
        this.mechanicDialog = false;
        this.submitted = false;
    }

    deleteMechanic(mechanic: MechanicForm) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + mechanic.firstName + ' ' + mechanic.lastName + '?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.apiRoutes.deleteUSer(mechanic._id).subscribe({
                    next: () => {
                        this.mechanics.set(this.mechanics().filter((val) => val._id !== mechanic._id));
                        this.mechanic = { _id: '', firstName: '', lastName: '', email: '', phoneNumber: '', salary: 0 };
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Mechanic deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete mechanic',
                            life: 3000
                        });
                        console.error('Error deleting mechanic', error);
                    }
                });
            }
        });
    }

    onFileSelect(event: any) {
        this.fileError = null;
        const files = event.files;

        if (files.length > 0) {
            const file = files[0];

            if (file.size > 800000) {
                this.fileError = 'File size exceeds 800KB limit';
                this.removeImage();
                return;
            }

            if (!file.type.match('image.*')) {
                this.fileError = 'Only images are allowed';
                this.removeImage();
                return;
            }

            this.selectedFile = file;

            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl = reader.result;
            };
            reader.readAsDataURL(file);
        }
    }

    onFileRemove() {
        this.removeImage();
    }

    removeImage(fileUpload?: any) {
        this.selectedFile = null;
        this.previewUrl = null;
        this.fileError = null;

        if (fileUpload) {
            fileUpload.clear();
        }
    }

    saveMechanic() {
        this.submitted = true;

        if (
            this.mechanic.firstName?.trim() &&
            this.mechanic.lastName?.trim() &&
            this.mechanic.email?.trim() &&
            this.mechanic.countryCode &&
            this.mechanic.phone?.trim() &&
            (this.mechanic._id || this.mechanic.password?.trim()) &&
            this.mechanic.salary !== null &&
            this.mechanic.salary !== undefined &&
            this.mechanic.salary >= 0
        ) {
            const formData = new FormData();
            formData.append('firstName', this.mechanic.firstName);
            formData.append('lastName', this.mechanic.lastName);
            formData.append('email', this.mechanic.email);
            formData.append('phoneNumber', `${this.mechanic.countryCode.dialCode} ${this.mechanic.phone}`);
            formData.append('salary', this.mechanic.salary.toString());
            if (!this.mechanic._id) {
                formData.append('password', this.mechanic.password!);
            }

            if (this.selectedFile) {
                formData.append('picture', this.selectedFile);
            }

            if (this.mechanic._id) {
                this.apiRoutes.putMechanic(this.mechanic._id, formData).subscribe({
                    next: (updatedMechanic) => {
                        const index = this.findIndexById(this.mechanic._id);
                        let _mechanics = this.mechanics();
                        if (index !== -1) {
                            _mechanics[index] = updatedMechanic;
                            this.mechanics.set([..._mechanics]);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Mechanic updated',
                            life: 3000
                        });
                        this.mechanicDialog = false;
                        this.mechanic = { _id: '', firstName: '', lastName: '', email: '', phoneNumber: '', salary: 0 };
                        this.loadMechanics();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update mechanic',
                            life: 3000
                        });
                        console.error('Error updating mechanic', error);
                    }
                });
            } else {
                this.apiRoutes.postMechanic(formData).subscribe({
                    next: (newMechanic) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Mechanic created',
                            life: 3000
                        });
                        this.mechanicDialog = false;
                        this.mechanic = { _id: '', firstName: '', lastName: '', email: '', phoneNumber: '', salary: 0 };
                        this.loadMechanics();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to create mechanic',
                            life: 3000
                        });
                        console.error('Error creating mechanic', error);
                    }
                });
            }
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.mechanics().length; i++) {
            if (this.mechanics()[i]._id === id) {
                index = i;
                break;
            }
        }
        return index;
    }
}
