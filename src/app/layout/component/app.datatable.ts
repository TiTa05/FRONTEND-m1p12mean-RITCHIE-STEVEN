import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';

export interface ColumnDefinition {
    field: string;
    header: string;
    filterType?: 'text' | 'numeric' | 'date' | 'boolean' | 'multi' | 'select' | 'slider' | 'custom';
    filterField?: string;
    filterMatchMode?: string;
    filterDisplayOptions?: any;
    filterOptions?: any[];
    style?: any;
    template?: string;
    hidden?: boolean;
}

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule
    ],
    schemas: [NO_ERRORS_SCHEMA],
    template: `
        <div class="card">
            <div *ngIf="title" class="font-semibold text-xl mb-4">{{ title }}</div>
            <p-table
                #dt
                [value]="data"
                [dataKey]="dataKey"
                [rows]="rows"
                [loading]="loading"
                [rowHover]="rowHover"
                [showGridlines]="showGridlines"
                [paginator]="paginator"
                [globalFilterFields]="globalFilterFields"
                [scrollable]="scrollable"
                [scrollHeight]="scrollHeight"
                [responsiveLayout]="responsiveLayout"
                [rowExpansionMode]="rowExpansionMode"
            >
                <ng-template pTemplate="caption" *ngIf="showCaption">
                    <div class="flex justify-between items-center flex-column sm:flex-row">
                        <button *ngIf="showClearButton" pButton label="Clear" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
                        <p-iconfield iconPosition="left" class="ml-auto" *ngIf="showSearchBox">
                            <p-inputicon>
                                <i class="pi pi-search"></i>
                            </p-inputicon>
                            <input #filter pInputText type="text" (input)="onGlobalFilter(dt, $event)" [placeholder]="searchPlaceholder" />
                        </p-iconfield>
                        <ng-container *ngTemplateOutlet="captionTemplate"></ng-container>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr>
                        <th *ngIf="rowExpansionMode" style="width: 3rem"></th>

                        <th *ngFor="let col of columns" [style]="col.style" [hidden]="col.hidden">
                            <div class="flex justify-between items-center">
                                {{ col.header }}

                                <p-columnFilter *ngIf="col.filterType === 'text'" type="text" [field]="col.filterField || col.field" display="menu" [placeholder]="'Search by ' + col.header.toLowerCase()"></p-columnFilter>

                                <p-columnFilter *ngIf="col.filterType === 'numeric'" type="numeric" [field]="col.filterField || col.field" display="menu" [currency]="col.filterDisplayOptions?.currency"></p-columnFilter>

                                <p-columnFilter *ngIf="col.filterType === 'date'" type="date" [field]="col.filterField || col.field" display="menu" placeholder="mm/dd/yyyy"></p-columnFilter>

                                <p-columnFilter *ngIf="col.filterType === 'boolean'" type="boolean" [field]="col.filterField || col.field" display="menu"></p-columnFilter>

                                <p-columnFilter *ngIf="col.filterType === 'multi'" [field]="col.filterField || col.field" matchMode="in" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                    <ng-template pTemplate="header">
                                        <div class="px-3 pt-3 pb-0">
                                            <span class="font-bold">{{ col.filterDisplayOptions?.title || 'Select Options' }}</span>
                                        </div>
                                    </ng-template>
                                    <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                                        <p-multiSelect [ngModel]="value" [options]="col.filterOptions" placeholder="Any" (onChange)="filter($event.value)" [optionLabel]="col.filterDisplayOptions?.optionLabel || 'label'" styleClass="w-full">
                                            <ng-template let-option pTemplate="item">
                                                <div class="flex items-center gap-2">
                                                    <img
                                                        *ngIf="col.filterDisplayOptions?.showImage"
                                                        [alt]="option[col.filterDisplayOptions?.optionLabel || 'label']"
                                                        [src]="col.filterDisplayOptions?.imagePath + option[col.filterDisplayOptions?.imageField || 'image']"
                                                        width="32"
                                                    />
                                                    <span>{{ option[col.filterDisplayOptions?.optionLabel || 'label'] }}</span>
                                                </div>
                                            </ng-template>
                                        </p-multiSelect>
                                    </ng-template>
                                </p-columnFilter>

                                <p-columnFilter *ngIf="col.filterType === 'select'" [field]="col.filterField || col.field" matchMode="equals" display="menu">
                                    <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                                        <p-select [ngModel]="value" [options]="col.filterOptions" (onChange)="filter($event.value)" placeholder="Any" [style]="{ 'min-width': '12rem' }">
                                            <ng-template let-option pTemplate="item">
                                                <span [class]="col.filterDisplayOptions?.styleClass ? col.filterDisplayOptions.styleClass + option.value : ''">{{ option.label }}</span>
                                            </ng-template>
                                        </p-select>
                                    </ng-template>
                                </p-columnFilter>

                                <p-columnFilter *ngIf="col.filterType === 'slider'" [field]="col.filterField || col.field" matchMode="between" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                    <ng-template pTemplate="filter" let-filter="filterCallback">
                                        <p-slider [ngModel]="sliderValues" [range]="true" (onSlideEnd)="filter($event.values)" styleClass="m-3" [style]="{ 'min-width': '12rem' }"></p-slider>
                                        <div class="flex items-center justify-between px-2">
                                            <span>{{ sliderValues[0] }}</span>
                                            <span>{{ sliderValues[1] }}</span>
                                        </div>
                                    </ng-template>
                                </p-columnFilter>

                                <ng-container *ngIf="col.filterType === 'custom'">
                                    <ng-content *ngTemplateOutlet="getCustomFilter(col.field)" [ngTemplateOutletContext]="{ $implicit: col }"></ng-content>
                                </ng-container>
                            </div>
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-rowData let-expanded="expanded">
                    <tr [pSelectableRow]="rowData">
                        <td *ngIf="rowExpansionMode">
                            <button type="button" pButton pRipple [pRowToggler]="rowData" class="p-button-text p-button-rounded p-button-plain" [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></button>
                        </td>

                        <td *ngFor="let col of columns" [hidden]="col.hidden">
                            <ng-container *ngIf="!getColumnTemplate(col.field); else customTemplate">
                                <ng-container [ngSwitch]="col.template">
                                    <ng-container *ngSwitchCase="'text'">
                                        {{ resolveFieldValue(rowData, col.field) }}
                                    </ng-container>

                                    <ng-container *ngSwitchCase="'country'">
                                        <div class="flex items-center gap-2">
                                            <img
                                                *ngIf="resolveFieldValue(rowData, col.field + '.code')"
                                                src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png"
                                                [class]="'flag flag-' + resolveFieldValue(rowData, col.field + '.code')"
                                                width="30"
                                            />
                                            <span>{{ resolveFieldValue(rowData, col.field + '.name') }}</span>
                                        </div>
                                    </ng-container>

                                    <ng-container *ngSwitchCase="'picture'">
                                        <div class="p-d-flex p-jc-center p-ai-center p-gap-2">
                                            <ng-container *ngIf="resolveFieldValue(rowData, col.field)">
                                                <img
                                                    [alt]="resolveFieldValue(rowData, col.field + '.name')"
                                                    [src]="'data:image/jpeg;base64,' + resolveFieldValue(rowData, col.field)"
                                                    width="100"
                                                    height="100"
                                                    style="border-radius: .25rem; object-fit: cover;"
                                                />
                                            </ng-container>

                                            <ng-container *ngIf="!resolveFieldValue(rowData, col.field)">
                                                <span style="text-align: center; font-size: 14px; line-height: 1.5;"> N/A </span>
                                            </ng-container>
                                        </div>
                                    </ng-container>

                                    <ng-container *ngSwitchCase="'date'">
                                        {{ resolveFieldValue(rowData, col.field) | date: 'dd/MM/yyyy' }}
                                    </ng-container>

                                    <ng-container *ngSwitchCase="'currency'"> {{ resolveFieldValue(rowData, col.field) | number: '1.2-2' }} Ar </ng-container>

                                    <ng-container *ngSwitchCase="'tag'">
                                        <p-tag [value]="resolveFieldValue(rowData, col.field).toLowerCase()" [severity]="getSeverity(resolveFieldValue(rowData, col.field).toLowerCase())" styleClass="dark:!bg-surface-900" />
                                    </ng-container>

                                    <ng-container *ngSwitchCase="'progress'">
                                        <p-progressbar [value]="resolveFieldValue(rowData, col.field)" [showValue]="false" [style]="{ height: '0.5rem' }" />
                                    </ng-container>

                                    <ng-container *ngSwitchCase="'boolean'">
                                        <i [class]="resolveFieldValue(rowData, col.field) ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
                                    </ng-container>

                                    <ng-container *ngSwitchDefault>
                                        {{ resolveFieldValue(rowData, col.field) }}
                                    </ng-container>
                                </ng-container>
                            </ng-container>

                            <ng-template #customTemplate>
                                <ng-container *ngTemplateOutlet="getColumnTemplate(col.field); context: { $implicit: rowData, field: col.field }"></ng-container>
                            </ng-template>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="rowexpansion" let-rowData *ngIf="rowExpansionMode && rowExpansionTemplate">
                    <tr>
                        <td [attr.colspan]="columns.length + 1">
                            <ng-container *ngTemplateOutlet="rowExpansionTemplate; context: { $implicit: rowData }"></ng-container>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td [attr.colspan]="columns.length + (rowExpansionMode ? 1 : 0)">
                            {{ emptyMessage }}
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="loadingbody">
                    <tr>
                        <td [attr.colspan]="columns.length + (rowExpansionMode ? 1 : 0)">
                            {{ loadingMessage }}
                        </td>
                    </tr>
                </ng-template>

                <ng-content></ng-content>
            </p-table>
        </div>
    `,
    styles: `
        .p-datatable-frozen-tbody {
            font-weight: bold;
        }
        .p-datatable-scrollable .p-frozen-column {
            font-weight: bold;
        }
    `,
    providers: [ConfirmationService, MessageService]
})
export class DataTableComponent implements OnInit {
    @Input() title: string = '';
    @Input() data: any[] = [];
    @Input() columns: ColumnDefinition[] = [];
    @Input() dataKey: string = 'id';
    @Input() rows: number = 10;
    @Input() loading: boolean = false;
    @Input() rowHover: boolean = true;
    @Input() showGridlines: boolean = true;
    @Input() paginator: boolean = true;
    @Input() globalFilterFields: string[] = [];
    @Input() scrollable: boolean = false;
    @Input() scrollHeight: string = '';
    @Input() responsiveLayout: string = 'scroll';
    @Input() emptyMessage: string = 'No data found.';
    @Input() loadingMessage: string = 'Loading data. Please wait.';
    @Input() showCaption: boolean = true;
    @Input() showClearButton: boolean = true;
    @Input() showSearchBox: boolean = true;
    @Input() searchPlaceholder: string = 'Search keyword';
    @Input() sliderValues: number[] = [0, 100];
    @Input() customTemplates: { [key: string]: any } = {};
    @Input() captionTemplate: any = null;
    @Input() rowExpansionMode: string = '';
    @Input() rowExpansionTemplate: any = null;

    @Output() rowSelect = new EventEmitter<any>();
    @Output() rowUnselect = new EventEmitter<any>();
    @Output() rowExpand = new EventEmitter<any>();
    @Output() rowCollapse = new EventEmitter<any>();
    @Output() sortChange = new EventEmitter<any>();
    @Output() pageChange = new EventEmitter<any>();
    @Output() filterChange = new EventEmitter<any>();

    @ViewChild('filter') filter!: ElementRef;

    constructor() {}

    ngOnInit() {}

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        if (this.filter) {
            this.filter.nativeElement.value = '';
        }
    }

    getSeverity(status: string) {
        switch (status) {
            case 'qualified':
            case 'instock':
            case 'delivered':
                return 'success';

            case 'negotiation':
            case 'lowstock':
            case 'pending':
                return 'warn';

            case 'unqualified':
            case 'outofstock':
            case 'cancelled':
                return 'danger';

            default:
                return 'info';
        }
    }

    resolveFieldValue(data: any, field: string): any {
        if (!field || !data) return '';

        if (field.indexOf('.') > -1) {
            const fields: string[] = field.split('.');
            let value = data;

            for (const prop of fields) {
                if (value == null) {
                    return '';
                }
                value = value[prop];
            }

            return value;
        }

        return data[field];
    }

    getColumnTemplate(field: string) {
        return this.customTemplates[field] || null;
    }

    getCustomFilter(field: string) {
        return this.customTemplates[`${field}Filter`] || null;
    }
}
