import { Routes } from '@angular/router';
import { DepositCRUD } from './deposit.crud';
import { authGuard } from '../../routes/auth.guard';

export default [
    { path: 'CRUD', component: DepositCRUD, canActivate: [authGuard],  data: { type: [1] } }
] as Routes;
