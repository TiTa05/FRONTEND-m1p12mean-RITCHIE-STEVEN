import { Routes } from '@angular/router';
import { ExpenseCRUD } from './expense.crud';
import { authGuard } from '../../routes/auth.guard';
export default [
    { path: 'CRUD', component: ExpenseCRUD, canActivate: [authGuard],  data: { type: [3] } },
] as Routes;
