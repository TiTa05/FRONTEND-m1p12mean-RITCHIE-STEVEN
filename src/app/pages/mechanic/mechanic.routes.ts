import { Routes } from '@angular/router';
import { MechanicCRUD } from './mechanic.crud';
import { authGuard } from '../../routes/auth.guard';
export default [
    { path: 'CRUD', component: MechanicCRUD, canActivate: [authGuard],  data: { type: [3] } }
] as Routes;
