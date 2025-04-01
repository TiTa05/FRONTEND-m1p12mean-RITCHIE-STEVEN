export interface Fleet {
    _id: string;
    place: number;
    reparationId: string | null;
    status?: string;
    recoveredDate?: Date | null;
    createdAt?: string;
    updatedAt?: string;
}