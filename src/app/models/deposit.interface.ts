import { ReparationType } from "./reparation.interface";
import { Vehicle } from "./vehicle.interface";

export interface Deposit {
    _id?: string;
    vehicleId: Vehicle; 
    typeReparationIds: ReparationType[]; 
    appointmentDate: Date; 
    description?: string; 
    createdAt?: string;
    updatedAt?: string;
  }