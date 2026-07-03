import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface RucLookupResponse {
  ruc: string;
  razonSocial: string;
  estado?: string;
  condicion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RucLookupService {
  searchByRuc(ruc: string): Observable<RucLookupResponse | null> {
    const mockData: RucLookupResponse[] = [
      {
        ruc: '20601234567',
        razonSocial: 'INVERSIONES JM PORMAR BIENES Y SERVICIOS E.I.R.L.',
        estado: 'ACTIVO',
        condicion: 'HABIDO'
      },
      {
        ruc: '99999999999',
        razonSocial: 'FER METAL S.A.C.',
        estado: 'ACTIVO',
        condicion: 'HABIDO'
      }
    ];

    const result = mockData.find(item => item.ruc === ruc) ?? null;

    return of(result);
  }
}
