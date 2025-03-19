import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Empty } from './pages/empty/empty';
import { Notfound } from './pages/notfound/notfound';
import { ApiCallTest } from './pages/apiCallTest/apiCallTest';
import { authGuard } from './routes/auth.guard';
import { Error } from './pages/auth/error';
import { ClientList } from './pages/client/clientList';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Empty, canActivate: [authGuard], data: { type: [1, 2] } }, 
            { path: 'pages', loadChildren: () => import('./pages/pages.routes'),  canActivate: [authGuard] },
            { path: 'apiCallTest', component: ApiCallTest,  canActivate: [authGuard],  data: { type: [1, 2] } },
            {path: 'client', loadChildren: () => import('./pages/client/client.routes')},
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes'), canActivate: [authGuard] },
    { path: 'error', component: Error },
    { path: '**', redirectTo: '/notfound' },
];
