import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
    type?: number;
    role?: string;
    exp?: number;
    [key: string]: any;
}
export function decodeToken(token: string): DecodedToken {
        return jwtDecode<DecodedToken>(token);
}

export function getUserRole(token: string): number | null {
    const decodedToken = decodeToken(token);

    if (decodedToken && decodedToken.type) {
        return decodedToken.type; 
    }

    return null;
}
