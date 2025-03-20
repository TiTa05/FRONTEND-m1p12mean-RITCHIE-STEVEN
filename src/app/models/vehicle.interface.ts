import { Brand } from "./brand.interface";
export interface Vehicle {
    _id: string;
    registrationNumber: string;
    brandId: string;
    model: string;
    color: string;
    energy: 'Gas' | 'Diesel' | 'Electric';
    clientId: string | null;
    createdAt?: string;
    updatedAt?: string;
}
