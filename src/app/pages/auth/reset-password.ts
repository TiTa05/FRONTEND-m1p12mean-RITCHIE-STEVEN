import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, DividerModule, CommonModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full md:w-[30rem] bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-16 shrink-0 mx-auto">
                                <text x="0" y="40" font-size="40" font-family="sans-serif" fill="var(--primary-color)">SS</text>
                            </svg>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Garage</div>
                            <span class="text-muted-color font-medium">Enter your new password</span>
                        </div>

                        <p-divider></p-divider>

                        <div>
                            <label for="password" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">New Password</label>
                            <p-password id="password" [(ngModel)]="newPassword" placeholder="Enter new password" 
                                class="w-full md:w-[30rem] mb-4" [toggleMask]="true">
                            </p-password>


                            <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Confirm Password</label>
                            <p-password id="confirmPassword" [(ngModel)]="confirmPassword" placeholder="Confirm your password" 
                                class="w-full max-w-[35rem] mb-4" [toggleMask]="true" >
                            </p-password>

                            <small class="text-red-500" *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword">
                                Passwords do not match!
                            </small>

                            <p-divider></p-divider>

                            <div class="mt-4 text-red-500 text-center" *ngIf="message">
                                {{ message }}
                            </div>

                            <p-button label="Reset Password" styleClass="w-full md:w-[15rem]" 
                                (click)="resetPassword()" 
                                [disabled]="!newPassword || !confirmPassword || newPassword !== confirmPassword">
                            </p-button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class ResetPassword implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  token: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    console.log("Token reçu :", this.token);  // Debug
  }  

  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.message = "Please fill in all fields";
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = "Passwords do not match";
      return;
    }

    this.http.post('http://localhost:5000/auth/reset-password', { token: this.token, password: this.newPassword })
      .subscribe({
        next: () => {
          alert("Password reset successful!");
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.message = "Invalid or expired token.";
        }
      });
  }
}
