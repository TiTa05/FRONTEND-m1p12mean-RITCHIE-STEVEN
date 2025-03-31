import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { PasswordModule } from 'primeng/password';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, DividerModule, CommonModule, PasswordModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-16 shrink-0 mx-auto">
                                <text x="0" y="40" font-size="40" font-family="sans-serif" fill="var(--primary-color)">SS</text>
                            </svg>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Garage</div>
                            <span class="text-muted-color font-medium">Reset your password</span>
                        </div>

                        <p-divider></p-divider>

                        <div>
                            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email" type="email" placeholder="Enter your email" class="w-full md:w-[30rem] mb-8" [(ngModel)]="email" />

                            <div class="mt-4 text-red-500 text-center" *ngIf="message">
                                {{ message }}
                            </div>

                            <p-button label="Send Reset Link" styleClass="w-full" (click)="requestPasswordReset()"></p-button>
                            <div class="text-center mt-6">
                                <a class="font-medium text-primary cursor-pointer" (click)="navigateToLogin()">Back to Login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class ForgotPassword {
    email: string = '';
    message: string = '';

    constructor(private http: HttpClient, private router: Router) {}

    requestPasswordReset() {
        this.http.post('http://localhost:5000/auth/forgot-password', { email: this.email })
        .subscribe({
            next: (response: any) => {
            this.message = 'A password reset link has been sent to your email.';
            },
            error: () => {
            this.message = 'Email not found. Please try again.';
            }
        });
    }

    navigateToLogin() {
        this.router.navigate(['/auth/login']);
    }
}
