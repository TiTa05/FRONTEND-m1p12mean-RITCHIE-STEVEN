import { Routes } from '@angular/router';
import { FleetList } from './fleet.list';
import { authGuard } from '../../routes/auth.guard';
export default [
    { path: 'list', component: FleetList, canActivate: [authGuard],  data: { type: [3] } },
] as Routes;
