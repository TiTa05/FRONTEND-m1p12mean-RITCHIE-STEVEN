import { Routes } from '@angular/router';
import { ReparationTypeCRUD } from './reparationType.crud';
import { authGuard } from '../../routes/auth.guard';
import { ReparationAssignedMechanicList } from './reparation-assigned-mechanic.list';
import { ReparationDetailsComponent } from './reparations-details-mechanic.list';

export default [
    { path: 'type/CRUD', component: ReparationTypeCRUD, canActivate: [authGuard], data: { type: [3] } },
    { path: 'list', component: ReparationAssignedMechanicList, canActivate: [authGuard], data: { type: [2] } },
    { path: 'reparation-details/:id', component: ReparationDetailsComponent, canActivate: [authGuard], data: { type: [2] } } // Nouvelle route pour les détails
] as Routes;