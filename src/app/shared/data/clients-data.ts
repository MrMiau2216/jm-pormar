export interface ClientItem {
  name: string;
  logo: string;
  active: boolean;
}

export const CLIENTS_DATA: ClientItem[] = [
  {
    name: 'Municipalidad de Miraflores',
    logo: '/logos/clientes/municipalidad-miraflores.png',
    active: true
  },
  {
    name: 'Municipalidad de Chorrillos',
    logo: '/logos/clientes/municipalidad-chorrillos.png',
    active: true
  },
  {
    name: 'Parque del Recuerdo',
    logo: '/logos/clientes/parque-recuerdo.png',
    active: true
  },
  {
    name: 'DIRESA Callao',
    logo: '/logos/clientes/diresa-callao.png',
    active: true
  }
];
