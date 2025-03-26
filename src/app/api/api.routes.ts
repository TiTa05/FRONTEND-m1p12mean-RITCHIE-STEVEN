// src/app/api.routes.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class ApiRoutes {
    private host = 'http://localhost:5000';
    private loginUrl = `${this.host}/auth/login`;
    private clientUrl = `${this.host}/auth/client`;
    private mechanicUrl = `${this.host}/auth/mechanic`;
    private userUrl = `${this.host}/auth/user`;
    private articleUrl = `${this.host}/articles`;
    private brandUrl = `${this.host}/brand`;
    private vehicleUrl = `${this.host}/vehicle`;
    private reparationUrl = `${this.host}/reparation`;
    private fleetUrl = `${this.host}/fleet`;

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

    // fleet
    getFleets(): Observable<any> {
        return this.apiService.getCall(this.fleetUrl);
    }

    clearFleetsVehicle(): Observable<any> {
        return this.apiService.getCall(`${this.fleetUrl}/clear-vehicles`);
    }
}
