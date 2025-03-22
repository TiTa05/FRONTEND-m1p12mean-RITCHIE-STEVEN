import { Routes } from '@angular/router';
import { MechanicCRUD } from './mechanic.crud';
import { MechanicUpdate } from './mechanic.update';
import { authGuard } from '../../routes/auth.guard';
export default [
    { path: 'CRUD', component: MechanicCRUD, canActivate: [authGuard],  data: { type: [3] } },
    { path: 'update', component: MechanicUpdate, canActivate: [authGuard],  data: { type: [2] } }
] as Routes;
