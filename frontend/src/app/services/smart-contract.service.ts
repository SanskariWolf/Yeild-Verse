import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { ethers } from 'ethers';
import { Contract } from 'ethers';
import { parseEther } from 'ethers';


@Injectable({
  providedIn: 'root'
})
export class SmartContractService {

  private contract: Contract | null = null;

  constructor(private web3Service: Web3Service) {}

  async initContract(contractAddress: string, abi: any) {
    const signer = await this.web3Service.connectWallet();
    if (signer) {
      this.contract = new Contract(contractAddress, abi, signer);
    }
  }

  async stakeTokens(amount: string) {
    if (!this.contract) throw new Error("Contract not initialized");
    const tx = await this.contract.call("stake", [parseEther(amount)]);
    return tx.wait();
  }

  async withdrawTokens() {
    if (!this.contract) throw new Error("Contract not initialized");
    const tx = await this.contract.call("withdraw");
    return tx.wait();
  }

}
