import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Certification {
  name: string;
  type: string;
  description: string;
  fileUrl: string;
  fileType: 'PDF' | 'IMAGE';
  icon: string;
}

@Component({
  selector: 'app-certifications',
  imports: [CommonModule],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss'
})
export class Certifications {
  selectedCertification?: Certification;

  certifications: Certification[] = [
    {
      name: 'ISO 9001',
      type: 'Calidad',
      description:
        'Certificación orientada al sistema de gestión de la calidad y mejora continua de procesos.',
      fileUrl: '/certificates/iso-9001.pdf',
      fileType: 'PDF',
      icon: 'verified'
    },
    {
      name: 'ISO 14001',
      type: 'Ambiental',
      description:
        'Certificación relacionada con la gestión ambiental y el compromiso con prácticas responsables.',
      fileUrl: '/certificates/iso-14001.pdf',
      fileType: 'PDF',
      icon: 'eco'
    },
    {
      name: 'ISO 37001',
      type: 'Antisoborno',
      description:
        'Certificación enfocada en la prevención de soborno y fortalecimiento de buenas prácticas empresariales.',
      fileUrl: '/certificates/iso-37001.pdf',
      fileType: 'PDF',
      icon: 'gpp_good'
    },
    {
      name: 'BPL',
      type: 'Buenas prácticas',
      description:
        'Reconocimiento relacionado con buenas prácticas logísticas, laborales u operativas.',
      fileUrl: '/certificates/bpl.pdf',
      fileType: 'PDF',
      icon: 'description'
    }
  ];

  openPreview(certification: Certification): void {
    this.selectedCertification = certification;
  }

  closePreview(): void {
    this.selectedCertification = undefined;
  }
}