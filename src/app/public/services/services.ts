import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { buildWhatsappUrl } from '../../shared/data/company-info';

interface ServiceItem {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
}

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  imports: [CommonModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class Services {
  services: ServiceItem[] = [
    {
      title: 'Abastecimiento para obras',
      subtitle: 'Materiales, ferretería y equipos',
      description:
        'Atención de requerimientos de materiales, herramientas, artículos de ferretería, equipos e insumos para empresas, obras y proyectos.',
      image: '/images/servicio-abastecimiento.jpg',
      icon: 'inventory_2'
    },
    {
      title: 'Transporte y apoyo logístico',
      subtitle: 'Coordinación y traslado',
      description:
        'Apoyo en el traslado, distribución y coordinación de materiales según los requerimientos operativos del cliente.',
      image: '/images/servicio-transporte.jpg',
      icon: 'local_shipping'
    },
    {
      title: 'Mantenimiento y acondicionamiento',
      subtitle: 'Conservación y mejora de espacios',
      description:
        'Servicios orientados a la conservación, mejora, reparación y acondicionamiento de ambientes, instalaciones o espacios de trabajo.',
      image: '/images/servicio-mantenimiento.jpg',
      icon: 'construction'
    },
    {
      title: 'Consultoría técnica',
      subtitle: 'Asesoría para requerimientos',
      description:
        'Orientación técnica para selección de materiales, metrados, presupuestos, fichas técnicas y planificación de soluciones para proyectos.',
      image: '/images/servicio-consultoria.jpg',
      icon: 'engineering'
    }
  ];

  processSteps: ProcessStep[] = [
    {
      number: '01',
      title: 'Recepción del requerimiento',
      description:
        'El cliente comunica su necesidad de productos, servicios, materiales o apoyo para obra.'
    },
    {
      number: '02',
      title: 'Evaluación y coordinación',
      description:
        'Se revisa el requerimiento, cantidades, destino, condiciones y prioridad de atención.'
    },
    {
      number: '03',
      title: 'Cotización y propuesta',
      description:
        'Se prepara una propuesta de atención acorde al requerimiento solicitado.'
    },
    {
      number: '04',
      title: 'Atención y seguimiento',
      description:
        'Se coordina la entrega, servicio o atención final, manteniendo comunicación directa.'
    }
  ];

  quoteService(serviceName: string): void {
    const message = `
Hola, deseo solicitar información sobre el siguiente servicio:

Servicio: ${serviceName}

Por favor, quisiera recibir orientación o una cotización.
Gracias.
    `.trim();

    window.open(buildWhatsappUrl(message), '_blank');
  }

  generalQuote(): void {
    const message = 'Hola, deseo solicitar información sobre los servicios de JM Pormar.';
    window.open(buildWhatsappUrl(message), '_blank');
  }
}
