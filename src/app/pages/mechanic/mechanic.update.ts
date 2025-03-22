import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { ApiCalls } from '../../api/api-calls.abstractclass';
import { ApiRoutes } from '../../api/api.routes';
import { getUserId } from '../../../utils/utils';

@Component({
    selector: 'app-mechanic-update',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, PasswordModule, ToastModule, MessagesModule, RippleModule, AppFloatingConfigurator],
    providers: [MessageService],
    template: `
        <app-floating-configurator />
        <div class="card p-6 shadow-md">
            <div class="text-center mb-6">
                <h3 class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-2">Update Password</h3>
                <p class="text-muted-color">Change Your Account Password</p>
            </div>

            <p-toast></p-toast>

            <form [formGroup]="updateForm" (ngSubmit)="onSubmit()" class="mt-4">
                <div class="mb-4">
                    <label for="password" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">New Password</label>
                    <p-password id="password" formControlName="password" [toggleMask]="true" [feedback]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
                    <small *ngIf="submitted && f['password'].errors?.['required']" class="p-error block mt-1 text-red-500">Password is required</small>
                    <small *ngIf="submitted && f['password'].errors?.['minlength']" class="p-error block mt-1 text-red-500">Password must be at least 8 characters</small>
                </div>

                <div class="mb-4">
                    <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 text-lg font-medium mb-2">Confirm Password</label>
                    <p-password id="confirmPassword" formControlName="confirmPassword" [toggleMask]="true" [feedback]="false" styleClass="w-full" inputStyleClass="w-full"></p-password>
                    <small *ngIf="submitted && f['confirmPassword'].errors?.['required']" class="p-error block mt-1 text-red-500">Please confirm your password</small>
                    <small *ngIf="submitted && updateForm.errors?.['matching']" class="p-error block mt-1 text-red-500">Passwords don't match</small>
                </div>

                <div class="flex flex-wrap justify-content-between gap-2 mt-6">
                    <button pButton pRipple label="Update Password" icon="pi pi-lock" type="submit" class="flex-1"></button>
                </div>
            </form>
        </div>
    `
})
export class MechanicUpdate extends ApiCalls implements OnInit {
    updateForm: FormGroup;
    submitted = false;
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

        this.updateForm = this.fb.group(
            {
                password: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', Validators.required]
            },
            { validators: this.passwordMatchValidator }
        );

        const token = localStorage.getItem('token');
        this.userId = token ? getUserId(token) : '';
    }

    ngOnInit() {
        this.loading = false;
    }

    get f() {
        return this.updateForm.controls;
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { matching: true };
    }

    onSubmit() {
        this.submitted = true;

        if (this.updateForm.invalid) {
            return;
        }

        const formData = new FormData();
        formData.append('password', this.updateForm.value.password);

        this.apiRoutes.putUser(this.userId || '', formData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Password Updated',
                    detail: 'Your password has been changed successfully!'
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