import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { getUserRole } from '../../../utils/utils';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];
    userRole: number | null = null;

    ngOnInit() {
        const token = localStorage.getItem('token');
        if (token) {
            this.userRole = getUserRole(token);
        }

        this.model = this.getMenuItems(this.userRole);
    }

    getMenuItems(type: number | null): MenuItem[] {
        if (type == 1) {
            return [
                {
                    label: 'Home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                        { label: 'My Vehicle', icon: 'pi pi-fw pi-home', routerLink: ['/vehicle/crud'] },
                        { label: 'Update My Details', icon: 'pi pi-fw pi-user-edit', routerLink: ['/client/update'] }
                    ]
                }
            ];
        } else if (type == 2) {
            return [
                {
                    label: 'Home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                        { label: 'Update My Password', icon: 'pi pi-fw pi-user-edit', routerLink: ['/mechanic/update'] }
                ]
                }
            ];
        }
        return [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                    { label: 'User', icon: 'pi pi-fw pi-home', items: [
                        { label: 'Client list', icon: 'pi pi-fw pi-home', routerLink: ['/client/list'] },
                        { label: 'Mechanic', icon: 'pi pi-fw pi-home', routerLink: ['/mechanic/CRUD'] }
                    ] },
                    { label: 'Vehicle', icon: 'pi pi-fw pi-home', items: [
                        { label: 'Brand', icon: 'pi pi-fw pi-home', routerLink: ['/vehicle/brand'] }
                    ] },
            ]
            }
        ];
    }
}
