import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY_INFO } from '../../data/company-info';

@Component({
  selector: 'app-public-footer',
  imports: [RouterLink],
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.scss'
})
export class PublicFooter {
  company = COMPANY_INFO;
}
