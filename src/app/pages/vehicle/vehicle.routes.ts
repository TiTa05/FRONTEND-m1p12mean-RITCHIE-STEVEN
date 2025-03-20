import { Routes } from '@angular/router';
import { BrandCRUD } from './brand.crud';
import { VehicleCRUD } from './vehicle.crud';
import { authGuard } from '../../routes/auth.guard';
export default [
    { path: 'brand', component: BrandCRUD, canActivate: [authGuard],  data: { type: [2, 3] } },
    { path: 'crud', component: VehicleCRUD, canActivate: [authGuard],  data: { type: [1] } }
] as Routes;
