import { Routes } from '@angular/router';
import { ClientList } from './clientList';
import { authGuard } from '../../routes/auth.guard';
export default [
    { path: 'list', component: ClientList, canActivate: [authGuard],  data: { type: [2, 3] } }
] as Routes;
