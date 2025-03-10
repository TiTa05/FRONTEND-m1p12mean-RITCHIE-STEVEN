import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Empty } from './pages/empty/empty';
import { Notfound } from './pages/notfound/notfound';
import { ApiCallTest} from './pages/apiCallTest/apiCallTest';
export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Empty },
            { path: 'pages', loadChildren: () => import('./pages/pages.routes') },
            { path: 'apiCallTest',  component: ApiCallTest },
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
