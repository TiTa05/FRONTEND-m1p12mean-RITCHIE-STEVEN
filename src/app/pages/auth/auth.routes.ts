import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { SignUp } from './signUp';
import { ForgotPassword } from './forgot-password';
import { ResetPassword } from './reset-password';
export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'signUp', component: SignUp },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword }
] as Routes;
