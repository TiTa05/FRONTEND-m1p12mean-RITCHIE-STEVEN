export interface DecodedToken {
    type?: number;
    role?: string;
    exp?: number;
    [key: string]: any;
}