export interface ClientItem {
  id: number;
  name: string;
  logo?: string;
  active: boolean;
}

export const CLIENTS_DATA: ClientItem[] = [
  {
    id: 1,
    name: 'Municipalidad de Miraflores',
    logo: '/logos/municipalidad-miraflores.png',
    active: true
  },
  {
    id: 2,
    name: 'Municipalidad de Chorrillos',
    logo: '/logos/municipalidad-chorrillos.png',
    active: true
  },
  {
    id: 3,
    name: 'Parque del Recuerdo',
    logo: '/logos/parque-del-recuerdo.png',
    active: true
  },
  {
    id: 4,
    name: 'DIRESA Callao',
    logo: '/logos/diresa-callao.png',
    active: true
  }
];
