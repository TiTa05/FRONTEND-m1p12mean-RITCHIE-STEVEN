import { Reparation } from "./reparation.interface";
import { Vehicle } from "./vehicle.interface";

export interface Deposit {
    _id?: string;
    vehicleId: Vehicle; 
    typeReparationIds: Reparation[]; 
    appointmentDate: Date; 
    description?: string; 
    createdAt?: string;
    updatedAt?: string;
  }