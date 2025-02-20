import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';
import { formatEther } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})



export class Web3Service {

  private provider: BrowserProvider | null = null;
  private signer: any = null;

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new BrowserProvider(window.ethereum);
    }
  }

  async connectWallet() {
    if (!this.provider) throw new Error("No provider found");

    this.signer = await this.provider.getSigner();
    return this.signer.getAddress();
  }

  async getBalance() {
    if (!this.signer) throw new Error("No signer found");

    const signerAddress = await this.signer.getAddress();
    const balance = await this.provider?.getBalance(signerAddress);

    return balance ? formatEther(balance) : "0";
  }


}
