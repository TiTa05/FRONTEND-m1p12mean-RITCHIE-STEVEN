import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getUserRole } from '../../utils/utils';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const isLoginRoute = route.routeConfig?.path === 'auth';

      if (isLoginRoute) {
        router.navigate(['/']); 
        return false;
      }

      const requiredRoles = route.data?.['type'] || [];

      const userRole = getUserRole(token);

      if (requiredRoles.includes(userRole)) {  
        return true;
      } else {
        console.warn('Accès refusé : rôle insuffisant.');
        router.navigate(['/error']); 
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du décodage du token :', error);
      router.navigate(['/auth/login']);
      return false;
    }
  } else {
    console.warn('Aucun token trouvé. Redirection vers /auth/login.');
    router.navigate(['/auth/login']);
    return false;
  }
};
