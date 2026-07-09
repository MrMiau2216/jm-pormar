import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { getHttpErrorMessage } from '../../core/utils/http-error';
import { Certificacion } from '../../shared/models/domain.models';
import { CertificationService } from '../../shared/services/certification.service';

@Component({
  selector: 'app-certifications',
  imports: [CommonModule],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss'
})
export class Certifications implements OnInit {
  certifications: Certificacion[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private readonly certificationService: CertificationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.certificationService.getPublic()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: certifications => {
          this.certifications = [...certifications].sort((a, b) => a.orden - b.orden);
          this.cdr.detectChanges();
        },
        error: error => {
          this.certifications = [];
          this.errorMessage = getHttpErrorMessage(error, 'No se pudieron cargar las certificaciones.');
          this.cdr.detectChanges();
        }
      });
  }

  get certificacionesPublicas(): Certificacion[] {
    return this.certifications.filter(certificacion => certificacion?.activo !== false);
  }

  obtenerNombreCertificacion(certificacion: any): string {
    return certificacion?.nombre || certificacion?.titulo || 'Certificación registrada';
  }

  obtenerDescripcionCertificacion(certificacion: any): string {
    return certificacion?.descripcion || 'Documento de respaldo empresarial registrado por JM Pormar.';
  }

  obtenerTipoCertificacion(certificacion: any): string {
    return certificacion?.tipo || certificacion?.tipoArchivo || 'Certificación';
  }

  obtenerUrlCertificado(certificacion: any): string {
    const url =
      certificacion?.archivoUrl ||
      certificacion?.urlArchivo ||
      certificacion?.documentoUrl ||
      certificacion?.pdfUrl ||
      '';

    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }

    const id =
      certificacion?.idCertificacion ||
      certificacion?.id ||
      certificacion?.uuid ||
      '';

    return id ? `/api/public/certificaciones/${id}/ver` : '#';
  }

  certificadoTieneVista(certificacion: any): boolean {
    return this.obtenerUrlCertificado(certificacion) !== '#';
  }
}
