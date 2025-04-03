// src/app/api.routes.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class ApiRoutes { 
    private host = 'https://backend-m1p12mean-ritchie-steven.onrender.com';
    private loginUrl = `${this.host}/auth/login`;
    private clientUrl = `${this.host}/auth/client`;
    private mechanicUrl = `${this.host}/auth/mechanic`;
    private userUrl = `${this.host}/auth/user`;
    private articleUrl = `${this.host}/articles`;
    private brandUrl = `${this.host}/brand`;
    private vehicleUrl = `${this.host}/vehicle`;
    private reparationTypeUrl = `${this.host}/reparationType`;
    private fleetUrl = `${this.host}/fleet`;
    private depositUrl = `${this.host}/deposit`;
    private expenseUrl = `${this.host}/expense`;
    private reparationUrl = `${this.host}/reparation`;

    constructor(private apiService: ApiService) {}

    // login
    login(data: any): Observable<any> {
        return this.apiService.postCall(this.loginUrl, data, false);
    }

    // vehicle
    getVehicles(): Observable<any> {
        return this.apiService.getCall(this.vehicleUrl);
    }

    getVehicleById(id: string): Observable<any> {
        return this.apiService.getCall(`${this.vehicleUrl}/${id}`);
    }

    getVehicleByClientId(id: string): Observable<any> {
        return this.apiService.getCall(`${this.vehicleUrl}/client/${id}`);
    }

    postVehicle(data: any): Observable<any> {
        return this.apiService.postCall(this.vehicleUrl, data);
    }

    putVehicle(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.vehicleUrl}/${id}`, data);
    }

    deleteVehicle(id: string): Observable<any> {
        return this.apiService.deleteCall(`${this.vehicleUrl}/${id}`);
    }

    // brand
    getBrands(): Observable<any> {
        return this.apiService.getCall(this.brandUrl);
    }

    getBrandById(id: string): Observable<any> {
        return this.apiService.getCall(`${this.brandUrl}/${id}`);
    }

    postBrand(data: any): Observable<any> {
        return this.apiService.postCall(this.brandUrl, data);
    }

    putBrand(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.brandUrl}/${id}`, data);
    }

    deleteBrand(id: string): Observable<any> {
        return this.apiService.deleteCall(`${this.brandUrl}/${id}`);
    }

    // mechanic
    getMechanics(): Observable<any> {
        return this.apiService.getCall(this.mechanicUrl);
    }

    postMechanic(data: any): Observable<any> {
        return this.apiService.postCall(this.mechanicUrl, data);
    }

    putMechanic(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.mechanicUrl}/${id}`, data);
    }

    getAvailableMechanics(): Observable<any> {
        return this.apiService.getCall(`${this.mechanicUrl}/available-mechanics`);
    }
    // user
    deleteUSer(id: string): Observable<any> {
        return this.apiService.deleteCall(`${this.userUrl}/${id}`);
    }

    getUser(id: string): Observable<any> {
        return this.apiService.getCall(`${this.userUrl}/${id}`);
    }

    putUser(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.userUrl}/${id}`, data);
    }
    // client
    signUp(data: any): Observable<any> {
        return this.apiService.postCall(this.clientUrl, data, false);
    }

    getClients(): Observable<any> {
        return this.apiService.getCall(this.clientUrl);
    }
    // articles test
    getArticles(): Observable<any> {
        return this.apiService.getCall(this.articleUrl);
    }

    postArticles(data: any): Observable<any> {
        return this.apiService.postCall(this.articleUrl, data);
    }

    putArticles(id: number, data: any): Observable<any> {
        return this.apiService.putCall(`${this.articleUrl}/${id}`, data);
    }

    deleteArticles(id: number): Observable<any> {
        return this.apiService.deleteCall(`${this.articleUrl}/${id}`);
    }
    // reparation type
    getReparationsType(): Observable<any> {
        return this.apiService.getCall(this.reparationTypeUrl);
    }
    
    getReparationTypeById(id: string): Observable<any> {
        return this.apiService.getCall(`${this.reparationTypeUrl}/${id}`);
    }
    
    postReparationType(data: any): Observable<any> {
        return this.apiService.postCall(this.reparationTypeUrl, data);
    }
    
    putReparationType(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.reparationTypeUrl}/${id}`, data);
    }
    
    deleteReparationType(id: string): Observable<any> {
        return this.apiService.deleteCall(`${this.reparationTypeUrl}/${id}`);
    }

    // fleet
    getFleets(): Observable<any> {
        return this.apiService.getCall(this.fleetUrl);
    }

    clearFleetsVehicle(): Observable<any> {
        return this.apiService.getCall(`${this.fleetUrl}/clear-vehicles`);
    }

    getAvailableFleet(): Observable<any> {
        return this.apiService.getCall(`${this.fleetUrl}/available`);
    }

    putFleet(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.fleetUrl}/${id}`, data);
    }
    //expense
    getExpenses(): Observable<any> {
        return this.apiService.getCall(this.expenseUrl);
    }
    
    getExpenseById(id: string): Observable<any> {
        return this.apiService.getCall(`${this.expenseUrl}/${id}`);
    }
    
    postExpense(data: any): Observable<any> {
        return this.apiService.postCall(this.expenseUrl, data);
    }
    
    putExpense(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.expenseUrl}/${id}`, data);
    }
    
    deleteExpense(id: string): Observable<any> {
        return this.apiService.deleteCall(`${this.expenseUrl}/${id}`);
    }

    // Deposit

    getDeposits(): Observable<any> {
        return this.apiService.getCall(this.depositUrl);
    }
    
    getDepositById(id: string): Observable<any> {
        return this.apiService.getCall(`${this.depositUrl}/${id}`);
    }
    
    postDeposit(data: any): Observable<any> {
        return this.apiService.postCall(this.depositUrl, data);
    }
    
    putDeposit(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.depositUrl}/${id}`, data);
    }
    
    deleteDeposit(id: string): Observable<any> {
        return this.apiService.deleteCall(`${this.depositUrl}/${id}`);
    }

    getUnassignedDeposits(): Observable<any> {
        return this.apiService.getCall(`${this.depositUrl}/unassigned`);
    }
    getUnassignedDepositsByClient(id: string): Observable<any> {
        return this.apiService.getCall(`${this.depositUrl}/client/${id}`);
    }
    // reparation type
    getReparations(): Observable<any> {
        return this.apiService.getCall(this.reparationUrl);
    }
    
    getReparationById(id: string): Observable<any> {
        return this.apiService.getCall(`${this.reparationUrl}/${id}`);
    }
    
    postReparation(data: any): Observable<any> {
        return this.apiService.postCall(this.reparationUrl, data);
    }
    
    putReparation(id: string, data: any): Observable<any> {
        return this.apiService.putCall(`${this.reparationUrl}/${id}`, data);
    }
    
    deleteReparation(id: string): Observable<any> {
        return this.apiService.deleteCall(`${this.reparationUrl}/${id}`);
    }

    getReparationRejectedByClientId(clientId: string): Observable<any> {
        return this.apiService.getCall(`${this.reparationUrl}/rejected/${clientId}`);
    }

    getReparationAssignedToAMechanic(mechanicId: string): Observable<any> {
        return this.apiService.getCall(`${this.reparationUrl}/mechanics/${mechanicId}`);
    }

    getReparationByStatus(status: string): Observable<any> {
        return this.apiService.getCall(`${this.reparationUrl}/status/${status}`);
    }

    getReparationByStatusAndClient(status: string, clientId: string): Observable<any> {
        return this.apiService.getCall(`${this.reparationUrl}/status/${status}/client/${clientId}`);
    }
}
