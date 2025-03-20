import { jwtDecode } from 'jwt-decode';
import { DecodedToken} from '../app/models/decodeToken.interface';

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


export function getUserId(token: string): string | null {
    const decodedToken = decodeToken(token);

    if (decodedToken && decodedToken.id) {
        return decodedToken.id;
    }

    return null;
}