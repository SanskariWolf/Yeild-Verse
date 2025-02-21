import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../../services/web3.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-header',
  imports: [ CommonModule ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  account$: Observable<string | null>;

  constructor(private web3Service: Web3Service) {
    this.account$ = this.web3Service.account$;
  }

  ngOnInit(): void {}

  connect() {
    this.web3Service.connectWallet();
  }

  disconnect() {
    this.web3Service.disconnectWallet();
  }

}
