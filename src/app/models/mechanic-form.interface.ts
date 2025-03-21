import { Country } from "./country.interface";

export interface MechanicForm {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    countryCode?: Country;
    phone?: string;
    password?: string;
    picture?: string;
    salary: number;
}