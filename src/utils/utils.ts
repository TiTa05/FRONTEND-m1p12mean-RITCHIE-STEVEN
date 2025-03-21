import { jwtDecode } from 'jwt-decode';
import { DecodedToken} from '../app/models/decodeToken.interface';
import { Country } from '../app/models/country.interface';
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

export const COUNTRIES: Country[] = [
    { name: 'Madagascar', code: 'MG', flag: 'flag flag-mg', dialCode: '+261', format: '99 99 999 99' },
    { name: 'France', code: 'FR', flag: 'flag flag-fr', dialCode: '+33', format: '9 99 99 99 99' },
    { name: 'Japon', code: 'JP', flag: 'flag flag-jp', dialCode: '+81', format: '99 9999 9999' },
    { name: 'Canada', code: 'CA', flag: 'flag flag-ca', dialCode: '+1', format: '999 999 9999' },
    { name: 'Corée du Sud', code: 'KR', flag: 'flag flag-kr', dialCode: '+82', format: '999 9999 9999' }
];
