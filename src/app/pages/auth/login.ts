import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { ApiRoutes } from '../../api/api.routes';
import { CommonModule } from '@angular/common';
import { ApiCalls } from '../../api/api-calls.abstractclass';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, DropdownModule, InputTextModule, PasswordModule, FormsModule, RippleModule, DividerModule, AppFloatingConfigurator, CommonModule],
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
                            <span class="text-muted-color font-medium">Sign in to continue</span>
                        </div>

                        <div class="mb-6">
                            <p-dropdown 
                                [options]="roles" 
                                [(ngModel)]="selectedRole" 
                                placeholder="Select Role"
                                (onChange)="onRoleChange()" 
                                class="w-full md:w-[30rem]"
                            >
                            </p-dropdown>
                        </div>

                        <p-divider></p-divider>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="mt-4 text-red-500 text-center" *ngIf="errorMessage">
                                {{ errorMessage }}
                            </div>

                            <p-button label="Sign In" styleClass="w-full" (click)="login()"></p-button>
                            <div class="text-center mt-6">
                                <span class="text-muted-color">Don't have an account?</span>
                                <a class="font-medium text-primary cursor-pointer ml-2" (click)="navigateToSignUp()">Sign Up</a>
                                <span class="text-muted-color"> ( for client )</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login extends ApiCalls {
    email: string = 'manager@gmail.com';
    password: string = 'Qwerty123';
    errorMessage: string | null = null;

    roles = [
        { label: 'Manager', value: 'manager' },
        { label: 'Mechanic', value: 'mechanic' },
        { label: 'Client', value: 'client' }
    ];

    selectedRole: string = 'manager';

    constructor(
        apiRoutes: ApiRoutes,
        private router: Router
    ) { super(apiRoutes); }

    onRoleChange(): void {
        switch (this.selectedRole) {
            case 'manager':
                this.email = 'manager@gmail.com';
                this.password = 'Qwerty123';
                break;
            case 'mechanic':
                this.email = 'venhom@gmail.com';
                this.password = 'Qwerty123';
                break;
            case 'client':
                this.email = 'test@gmail.com';
                this.password = 'Qwerty123';
                break;
        }
    }

    login(): void {
        const loginData = {
            email: this.email,
            password: this.password
        };

        this.apiRoutes.login(loginData).subscribe({
            next: (response) => {
                const token = response.token;
                if (token) {
                    localStorage.setItem('token', token);
                    this.router.navigate(['/']);
                }
            },
            error: (err) => {
                console.error('Erreur de login :', err);
                this.errorMessage = 'Invalid email or password. Please try again.';
            }
        });
    }

    navigateToSignUp() {
        this.router.navigate(['/auth/signUp']);
    }
}