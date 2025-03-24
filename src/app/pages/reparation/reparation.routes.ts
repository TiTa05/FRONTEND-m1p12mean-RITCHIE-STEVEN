import { Routes } from '@angular/router';
import { ReparationCRUD } from './typeReparation.crud';
import { authGuard } from '../../routes/auth.guard';

export default [
    { path: 'CRUD', component: ReparationCRUD, canActivate: [authGuard],  data: { type: [3] } }
] as Routes;
