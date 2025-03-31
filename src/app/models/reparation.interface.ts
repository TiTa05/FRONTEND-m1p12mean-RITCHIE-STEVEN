import { User
    
 } from "./user.interface";
export interface ReparationType {
    _id?: string; 
    label: string;
    cost: number;
}

export interface AdditionalCost {
    description: string;
    cost: number;
    date: Date;
    _id?: string;
}

export interface Reparation {
    _id?: string;
    depositId: any;
    status: 'in_progress' | 'completed' | 'rejected' | 'recovered';
    startedAt?: Date;
    completedAt?: Date | null;
    recoveredAt?: Date;
    refusalReason?: string;
    additionalCosts: AdditionalCost[];
    mechanics: User[];
    [key: string]: any;
}