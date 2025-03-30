import { Routes } from '@angular/router';
import { DepositCRUD } from './deposit.crud';
import { authGuard } from '../../routes/auth.guard';
import { DepositList } from './deposit.list';

export default [
    { path: 'CRUD', component: DepositCRUD, canActivate: [authGuard],  data: { type: [1] } },
    { path: 'list', component: DepositList, canActivate: [authGuard],  data: { type: [3] } },
] as Routes;
