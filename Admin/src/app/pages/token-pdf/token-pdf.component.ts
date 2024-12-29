import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import { map } from 'rxjs';
import { TokenResponse } from 'src/app/core/models/token.models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-token-pdf',
  templateUrl: './token-pdf.component.html',
  styleUrls: ['./token-pdf.component.scss']
})
export class TokenPdfComponent implements OnInit {
  getid: number; 
  tokenid: string = ''; 
  // ApiService: any;
  tokenData: TokenResponse;

  constructor(private route: ActivatedRoute, private apiservice: ApiService,) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tokenid = params.get('id') || ''; 

      if (this.tokenid) {
        const tokenIdNum = +this.tokenid; 
        this.getTokenDetails(tokenIdNum);  
        this.generatePDF(this.tokenid);  
      }
    });
  }

  generatePDF(tokenid: string): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Token Number: ${tokenid}`, 20, 30); 
    const pdfOutput = doc.output('datauristring');  
    this.embedPDF(pdfOutput);
  }

  
  embedPDF(pdfOutput: string): void {
    const iframe = document.createElement('iframe');
    iframe.src = pdfOutput;  
    iframe.width = '100%';
    iframe.height = '800px';  

    const container = document.getElementById('pdfContainer');
    if (container) {
      container.innerHTML = '';  
      container.appendChild(iframe); 
    }
  }

  getTokenDetails(id: number): void {
      this.apiservice.getTokenById(id).pipe(
          map((response: TokenResponse) => {
            this.tokenData = response;
            console.log('API Response:', response);
          })
        ).subscribe();
  }
}
