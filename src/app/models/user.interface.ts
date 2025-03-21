export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    picture: string | null;
    type: number;
    createdAt: string;
    updatedAt: string;
    password: string;
    salary: number;
}
