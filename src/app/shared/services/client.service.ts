import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CLIENTS_DATA, ClientItem } from '../data/clients-data';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  getClients(): Observable<ClientItem[]> {
    return of(CLIENTS_DATA.filter(client => client.active));
  }
}
