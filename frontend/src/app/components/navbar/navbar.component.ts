import { Component } from '@angular/core';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  userAddress: string | null = null;

  constructor(private web3Service: Web3Service) {}

  async connectWallet() {
    try {
      this.userAddress = await this.web3Service.connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }

}
