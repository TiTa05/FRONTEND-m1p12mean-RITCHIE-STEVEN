import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { Country } from '../../models/country.interface';
import { COUNTRIES } from '../../../utils/utils';
import { getUserId } from '../../../utils/utils';

@Component({
    selector: 'app-user-update',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, FileUploadModule, ToastModule, MessagesModule, RippleModule, DividerModule, InputMaskModule, DropdownModule, AppFloatingConfigurator],
    providers: [MessageService],
    template: `
        <app-floating-configurator />
        <div class="card p-6 shadow-md">
            <div class="text-center mb-6">
                <h3 class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-2">Update Profile</h3>
                <p class="text-muted-color">Modify Your Account Details</p>
            </div>

            <p-toast></p-toast>

            <form [formGroup]="updateForm" (ngSubmit)="onSubmit()" class="mt-4">
                <div class="flex flex-column md:flex-row gap-4">
                    <div class="flex-1 mb-4">
                        <label for="firstName" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">First Name</label>
                        <input pInputText id="firstName" type="text" formControlName="firstName" class="w-full" />
                        <small *ngIf="submitted && f['firstName'].errors" class="p-error block mt-1 text-red-500">First name is required</small>
                    </div>
                    <div class="flex-1 mb-4">
                        <label for="lastName" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Last Name</label>
                        <input pInputText id="lastName" type="text" formControlName="lastName" class="w-full" />
                        <small *ngIf="submitted && f['lastName'].errors" class="p-error block mt-1 text-red-500">Last name is required</small>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="email" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Email</label>
                    <input pInputText id="email" type="email" formControlName="email" class="w-full" />
                    <small *ngIf="submitted && f['email'].errors?.['required']" class="p-error block mt-1 text-red-500">Email is required</small>
                    <small *ngIf="submitted && f['email'].errors?.['email']" class="p-error block mt-1 text-red-500">Please enter a valid email address</small>
                </div>

                <div class="mb-4">
                    <label for="phone" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Phone Number</label>
                    <div style="display: flex; width: 100%;">
                        <div style="width: 150px; margin-right: 10px;">
                            <p-dropdown [options]="countries" formControlName="countryCode" optionLabel="name" [showClear]="false" styleClass="w-full">
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
                            <p-inputMask id="phone" formControlName="phone" [mask]="selectedCountry.format" placeholder="{{ selectedCountry.format }}" styleClass="w-full" inputStyleClass="w-full"> </p-inputMask>
                        </div>
                    </div>
                    <small *ngIf="submitted && (f['phone'].errors || f['countryCode'].errors)" class="p-error block mt-1 text-red-500"> Complete phone number is required </small>
                </div>

                <div class="mb-4">
                    <label for="password" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Password (Leave empty to keep current)</label>
                    <p-password id="password" formControlName="password" [toggleMask]="true" [feedback]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
                    <small *ngIf="submitted && f['password'].errors?.['minlength']" class="p-error block mt-1 text-red-500">Password must be at least 8 characters</small>
                </div>

                <div class="mb-4" *ngIf="f['password'].value">
                    <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Confirm Password</label>
                    <p-password id="confirmPassword" formControlName="confirmPassword" [toggleMask]="true" [feedback]="false" styleClass="w-full" inputStyleClass="w-full"></p-password>
                    <small *ngIf="submitted && f['password'].value && f['confirmPassword'].errors?.['required']" class="p-error block mt-1 text-red-500">Please confirm your password</small>
                    <small *ngIf="submitted && updateForm.errors?.['matching']" class="p-error block mt-1 text-red-500">Passwords don't match</small>
                </div>

                <p-divider></p-divider>

                <div class="mb-4">
                    <label class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Profile Picture</label>
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
                            <div class="flex flex-col items-center p-3 h-full" *ngIf="!previewUrl">
                                <div class="flex flex-col items-center flex-grow">
                                    <i class="pi pi-image text-4xl text-primary mb-2"></i>
                                    <span class="text-muted-color text-center">Drag and drop an image here or click to select</span>
                                </div>
                                <span class="text-muted-color text-sm text-center">Max size: 800KB</span>
                            </div>
                            <div *ngIf="previewUrl" class="flex justify-content-center p-3">
                                <div class="relative">
                                    <img [src]="previewUrl" alt="Preview" class="w-24 h-24 rounded-full object-cover" />
                                    <button type="button" pButton icon="pi pi-times" class="p-button-rounded p-button-danger p-button-sm absolute -top-2 -right-2" (click)="removeImage(fileUpload)"></button>
                                </div>
                            </div>
                        </ng-template>
                    </p-fileUpload>
                    <small *ngIf="fileError" class="p-error block mt-1 text-red-500">{{ fileError }}</small>
                </div>

                <div class="flex flex-wrap justify-content-between gap-2 mt-6">
                    <button pButton pRipple label="Update Profile" icon="pi pi-user-edit" type="submit" class="flex-1"></button>
                </div>
            </form>
        </div>
    `
})
export class ClientUpdate extends ApiCalls implements OnInit {
    updateForm: FormGroup;
    submitted = false;
    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    fileError: string | null = null;
    countries: Country[];
    selectedCountry: Country;
    userId!: string | null;
    loading = true;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        apiRoutes: ApiRoutes
    ) {
        super(apiRoutes);
        this.countries = COUNTRIES;
        this.selectedCountry = this.countries[0];

        this.updateForm = this.fb.group(
            {
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                countryCode: [this.selectedCountry, Validators.required],
                phone: ['', Validators.required],
                password: ['', [Validators.minLength(8)]],
                confirmPassword: ['']
            },
            { validators: this.passwordMatchValidator }
        );

        const token = localStorage.getItem('token');
        this.userId = token ? getUserId(token) : '';
    }

    ngOnInit() {
        this.updateForm.get('countryCode')?.valueChanges.subscribe((country) => {
            this.selectedCountry = country;
        });

        this.updateForm.get('password')?.valueChanges.subscribe((value) => {
            const confirmControl = this.updateForm.get('confirmPassword');
            if (value) {
                confirmControl?.setValidators([Validators.required]);
            } else {
                confirmControl?.clearValidators();
            }
            confirmControl?.updateValueAndValidity();
        });

        this.loadUserData();
    }

    loadUserData() {
        this.loading = true;
        this.apiRoutes.getUser(this.userId || '').subscribe({
            next: (userData: any) => {

                const phoneNumberParts = this.parsePhoneNumber(userData.phoneNumber);

                const country = this.countries.find((c) => c.dialCode === phoneNumberParts.countryCode) || this.countries[0];

                this.updateForm.patchValue({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    countryCode: country,
                    phone: phoneNumberParts.number
                });

                if (userData.picture) {
                    this.previewUrl = `data:image/png;base64,${userData.picture}`;
                }

                this.loading = false;
            },
            error: (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load user data. ' + (err.error?.message || 'Please try again later.')
                });
                this.loading = false;
            }
        });
    }

    parsePhoneNumber(phoneNumber: string) {

        const match = phoneNumber.match(/^(\+\d+)\s*(.*)$/);
        if (match) {
            return {
                countryCode: match[1],
                number: match[2].trim()
            };
        }
        return { countryCode: '', number: phoneNumber };
    }

    get f() {
        return this.updateForm.controls;
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        if (!password) return null;

        return password === confirmPassword ? null : { matching: true };
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

    onSubmit() {
        this.submitted = true;

        if (this.updateForm.get('password')?.value) {
            this.updateForm.get('confirmPassword')?.setValidators([Validators.required]);
        } else {
            this.updateForm.get('confirmPassword')?.clearValidators();
        }
        this.updateForm.get('confirmPassword')?.updateValueAndValidity();

        if (this.updateForm.invalid) {
            return;
        }

        const formData = new FormData();
        formData.append('firstName', this.updateForm.value.firstName);
        formData.append('lastName', this.updateForm.value.lastName);
        formData.append('email', this.updateForm.value.email);
        formData.append('phoneNumber', `${this.updateForm.value.countryCode.dialCode} ${this.updateForm.value.phone}`);

        if (this.updateForm.value.password) {
            formData.append('password', this.updateForm.value.password);
        }

        if (this.selectedFile) {
            formData.append('picture', this.selectedFile);
        }

        this.apiRoutes.putUser(this.userId || '', formData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Update Successful',
                    detail: 'Your profile has been updated successfully!'
                });
                setTimeout(() => {
                    this.navigateBack();
                }, 2000);
            },
            error: (err: any) => {
                const errorMessage = err.error?.message || 'An unexpected error occurred. Please try again later.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: errorMessage
                });
            }
        });
    }

    navigateBack() {
        this.router.navigate(['/']);
    }
}