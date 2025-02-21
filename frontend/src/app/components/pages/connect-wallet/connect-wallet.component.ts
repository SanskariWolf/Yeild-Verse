import { Component } from '@angular/core';
import { Web3Service } from '../../../services/web3.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-connect-wallet',
  imports: [CommonModule],
  templateUrl: './connect-wallet.component.html',
  styleUrl: './connect-wallet.component.css'
})
export class ConnectWalletComponent {
  constructor(private web3Service: Web3Service, private router: Router) {} // Inject Router

  connect() {
    this.web3Service.connectWallet().then(() => {
      if (this.web3Service.getAccount()) {
          this.router.navigate(['/portfolio/dashboard']); // Redirect after successful connection
      }
    });
  }

}
