import { Component } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-wallet-info',
  imports: [CommonModule],
  templateUrl: './wallet-info.component.html',
  styleUrl: './wallet-info.component.css'
})
export class WalletInfoComponent {
  walletAddress: string | null = null;

  constructor(private web3Service: Web3Service) {}

  async connectWallet() {
    this.walletAddress = await this.web3Service.connectWallet();
  }
}
