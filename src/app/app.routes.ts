import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Empty } from './pages/empty/empty';
import { Notfound } from './pages/notfound/notfound';
import { ApiCallTest } from './pages/apiCallTest/apiCallTest';
import { authGuard } from './routes/auth.guard';
import { Error } from './pages/auth/error';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Empty, canActivate: [authGuard], data: { type: [1, 2, 3] } }, 
            { path: 'pages', loadChildren: () => import('./pages/pages.routes'),  canActivate: [authGuard] },
            { path: 'apiCallTest', component: ApiCallTest,  canActivate: [authGuard],  data: { type: [1, 2, 3] } },
            {path: 'client', loadChildren: () => import('./pages/client/client.routes')},
            { path: 'vehicle',  loadChildren: () => import('./pages/vehicle/vehicle.routes') },
            { path: 'mechanic',  loadChildren: () => import('./pages/mechanic/mechanic.routes') },
	    { path: 'reparation', loadChildren: () => import('./pages/reparation/reparation.routes') },
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes'), canActivate: [authGuard] },
    { path: 'error', component: Error },
    { path: '**', redirectTo: '/notfound' },
];
