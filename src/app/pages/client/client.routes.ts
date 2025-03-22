import { Routes } from '@angular/router';
import { ClientList } from './clientList';
import { ClientUpdate } from './client.update';
import { authGuard } from '../../routes/auth.guard';
export default [
    { path: 'list', component: ClientList, canActivate: [authGuard],  data: { type: [3] } },
    { path: 'update', component: ClientUpdate, canActivate: [authGuard],  data: { type: [1] } },
] as Routes;
