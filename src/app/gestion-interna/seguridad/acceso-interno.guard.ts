import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionInternaService } from '../servicios/autenticacion-interna.service';

export const accesoInternoGuard: CanActivateFn = () => {
  const autenticacion = inject(AutenticacionInternaService);
  const router = inject(Router);
  return autenticacion.estaAutenticado()
    ? true
    : router.createUrlTree(['/portal-jmp/login']);
};
