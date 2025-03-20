export interface DecodedToken {
    id?: string;
    type?: number;
    role?: string;
    exp?: number;
    [key: string]: any;
}