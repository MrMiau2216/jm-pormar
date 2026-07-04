import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  selectedCertification?: Certificacion;
  selectedFileUrl?: SafeResourceUrl;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly certificationService: CertificationService,
    private readonly sanitizer: DomSanitizer,
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

  openPreview(certification: Certificacion): void {
    this.selectedCertification = certification;
    this.selectedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.certificationService.viewUrl(certification.idCertificacion)
    );
    this.cdr.detectChanges();
  }

  closePreview(): void {
    this.selectedCertification = undefined;
    this.selectedFileUrl = undefined;
    this.cdr.detectChanges();
  }

  get selectedIsPdf(): boolean {
    return this.selectedCertification?.tipoArchivo === 'PDF';
  }

  get selectedImageUrl(): string | undefined {
    if (!this.selectedCertification || this.selectedCertification.tipoArchivo !== 'IMAGEN') return undefined;
    return this.certificationService.viewUrl(this.selectedCertification.idCertificacion).split('#')[0];
  }
}
