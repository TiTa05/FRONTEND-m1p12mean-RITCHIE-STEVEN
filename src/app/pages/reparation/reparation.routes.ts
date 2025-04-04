import { Routes } from '@angular/router';
import { ReparationTypeCRUD } from './reparationType.crud';
import { authGuard } from '../../routes/auth.guard';
import { ReparationAssignedMechanicList } from './reparation-assigned-mechanic.list';
import { ReparationDetailsMechanicComponent } from './reparations-details-mechanic.list';
import { ReparationRecoveredList } from './reparation-recovered.list';
import { ReparationDetailsComponent } from './reparation-recovered.details';
import { RepairDetailsClientComponent } from './reparations-client.details';
import { ReparairProgressClient } from './reparation-client.progress';
import { ReparairProgressManager } from './reparation-manager.progress';
import { RepairDetailsManagerComponent } from './reparations-manager.details';

export default [
    { path: 'type/CRUD', component: ReparationTypeCRUD, canActivate: [authGuard], data: { type: [3] } },
    { path: 'list', component: ReparationAssignedMechanicList, canActivate: [authGuard], data: { type: [2] } },
    { path: 'reparation-details-mechanic/:id', component: ReparationDetailsMechanicComponent, canActivate: [authGuard], data: { type: [2] } },
    { path: 'reparation-recoverd', component: ReparationRecoveredList, canActivate: [authGuard], data: { type: [1, 2, 3] } },
    { path: 'reparation-details/:id', component: ReparationDetailsComponent, canActivate: [authGuard], data: { type: [1 ,2 ,3] } },
    { path: 'repair-details/:id', component: RepairDetailsClientComponent, canActivate: [authGuard], data: { type: [1] } },
    { path: 'reparation-client-list', component: ReparairProgressClient, canActivate: [authGuard], data: { type: [1] } },
    { path: 'reparation-manager-list', component: ReparairProgressManager, canActivate: [authGuard], data: { type: [3] } },
    { path: 'repair-manager-details/:id', component: RepairDetailsManagerComponent, canActivate: [authGuard], data: { type: [3] } }
] as Routes;