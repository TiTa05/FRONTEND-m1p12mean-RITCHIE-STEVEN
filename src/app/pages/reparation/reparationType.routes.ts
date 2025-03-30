import { Routes } from '@angular/router';
import { ReparationTypeCRUD } from './reparationType.crud';
import { authGuard } from '../../routes/auth.guard';

export default [
    { path: 'CRUD', component: ReparationTypeCRUD, canActivate: [authGuard],  data: { type: [3] } }
] as Routes;
