import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
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

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, FileUploadModule, ToastModule, MessagesModule, RippleModule, DividerModule, InputMaskModule, DropdownModule, AppFloatingConfigurator],
    providers: [MessageService],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center signup-container">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33,150,243,0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-6">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-6 w-16 shrink-0 mx-auto">
                                <text x="0" y="40" font-size="40" font-family="sans-serif" fill="var(--primary-color)">SS</text>
                            </svg>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-2">Garage</div>
                            <span class="text-muted-color font-medium">Create Account</span>
                        </div>

                        <p-toast></p-toast>

                        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="mt-4">
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
                                <label for="password" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Password</label>
                                <p-password id="password" formControlName="password" [toggleMask]="true" [feedback]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
                                <small *ngIf="submitted && f['password'].errors?.['required']" class="p-error block mt-1 text-red-500">Password is required</small>
                                <small *ngIf="submitted && f['password'].errors?.['minlength']" class="p-error block mt-1 text-red-500">Password must be at least 8 characters</small>
                            </div>

                            <div class="mb-4">
                                <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Confirm Password</label>
                                <p-password id="confirmPassword" formControlName="confirmPassword" [toggleMask]="true" [feedback]="false" styleClass="w-full" inputStyleClass="w-full"></p-password>
                                <small *ngIf="submitted && f['confirmPassword'].errors?.['required']" class="p-error block mt-1 text-red-500">Please confirm your password</small>
                                <small *ngIf="submitted && signupForm.errors?.['matching']" class="p-error block mt-1 text-red-500">Passwords don't match</small>
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
                                        <div class="flex flex-col items-center p-3 h-full" *ngIf="!selectedFile">
                                            <div class="flex flex-col items-center flex-grow">
                                                <i class="pi pi-image text-4xl text-primary mb-2"></i>
                                                <span class="text-muted-color text-center">Drag and drop an image here or click to select</span>
                                            </div>
                                            <span class="text-muted-color text-sm text-center">Max size: 800KB</span>
                                        </div>
                                        <div *ngIf="selectedFile" class="flex justify-content-center p-3">
                                            <div class="relative">
                                                <img [src]="previewUrl" alt="Preview" class="w-24 h-24 rounded-full object-cover" />
                                                <button type="button" pButton icon="pi pi-times" class="p-button-rounded p-button-danger p-button-sm absolute -top-2 -right-2" (click)="removeImage(fileUpload)"></button>
                                            </div>
                                        </div>
                                    </ng-template>
                                </p-fileUpload>
                                <small *ngIf="fileError" class="p-error block mt-1 text-red-500">{{ fileError }}</small>
                            </div>

                            <div class="flex flex-wrap justify-content-between mt-6">
                                <button pButton pRipple label="Register" icon="pi pi-user-plus" type="submit" class="w-full"></button>
                            </div>

                            <div class="text-center mt-6">
                                <span class="text-muted-color">Already have an account?</span>
                                <a class="font-medium text-primary cursor-pointer ml-2" (click)="navigateToLogin()">Sign In</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SignUp extends ApiCalls implements OnInit {
    signupForm: FormGroup;
    submitted = false;
    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    fileError: string | null = null;
    countries: Country[];
    selectedCountry: Country;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        apiRoutes: ApiRoutes
    ) {
        super(apiRoutes);
        this.countries = [
            { name: 'Madagascar', code: 'MG', flag: 'flag flag-mg', dialCode: '+261', format: '99 99 999 99' },
            { name: 'France', code: 'FR', flag: 'flag flag-fr', dialCode: '+33', format: '9 99 99 99 99' },
            { name: 'Japon', code: 'JP', flag: 'flag flag-jp', dialCode: '+81', format: '99 9999 9999' },
            { name: 'Canada', code: 'CA', flag: 'flag flag-ca', dialCode: '+1', format: '999 999 9999' },
            { name: 'Corée du Sud', code: 'KR', flag: 'flag flag-kr', dialCode: '+82', format: '999 9999 9999' }
        ];

        this.selectedCountry = this.countries[0];

        this.signupForm = this.fb.group(
            {
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                countryCode: [this.selectedCountry, Validators.required],
                phone: ['', Validators.required],
                password: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', Validators.required]
            },
            { validators: this.passwordMatchValidator }
        );
    }

    ngOnInit() {
        this.signupForm.get('countryCode')?.valueChanges.subscribe((country) => {
            this.selectedCountry = country;
        });
    }

    get f() {
        return this.signupForm.controls;
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;
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

        if (this.signupForm.invalid) {
            return;
        }

        const formData = new FormData();
        formData.append('firstName', this.signupForm.value.firstName);
        formData.append('lastName', this.signupForm.value.lastName);
        formData.append('email', this.signupForm.value.email);
        formData.append('phoneNumber', `${this.signupForm.value.countryCode.dialCode} ${this.signupForm.value.phone}`);
        formData.append('password', this.signupForm.value.password);

        if (this.selectedFile) {
            formData.append('picture', this.selectedFile);
        }
        
        this.apiRoutes.signUp(formData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Registration Successful',
                    detail: 'Your account has been created successfully!'
                });
                setTimeout(() => {
                    this.navigateToLogin();
                }, 2000);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Registration Failed',
                    detail: 'There was an error creating your account. Please try again.'
                });
            }
        });
    }

    navigateToLogin() {
        this.router.navigate(['/auth/login']);
    }
}
