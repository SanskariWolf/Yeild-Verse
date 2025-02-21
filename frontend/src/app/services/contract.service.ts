import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private provider: BrowserProvider;
  private contract: Contract;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new BrowserProvider(window.ethereum);
      this.contract = new Contract(
        '0xYourStakingContractAddress', // Replace with your contract address
        stakingABI,
        this.provider
      );
    } else {
      throw new Error('Ethereum provider not found');
    }
  }

  async getStakingBalance(address: string) {
    return await this.contract.getStakedAmount(address);
  }

  async stake(amount: number) {
    const signer = await this.provider.getSigner();
    const tx = await this.contract.connect(signer).stake(amount);
    await tx.wait();
  }
}
