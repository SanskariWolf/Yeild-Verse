import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Web3-Onboard
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

// Ethers v6
import { ethers } from 'ethers';

const INFURA_KEY = "YOUR INFURA KEY"; // Replace


@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  private onboard: any;
  private accountSubject = new BehaviorSubject<string | null>(null);
  public account$ = this.accountSubject.asObservable();
  private providerSubject = new BehaviorSubject<ethers.Provider | null>(null); // Use ethers.Provider
  public provider$ = this.providerSubject.asObservable();
  private signerSubject = new BehaviorSubject<ethers.Signer | null>(null); // Add signer subject
  public signer$ = this.signerSubject.asObservable();

  constructor() {
      const injected = injectedModule();
      this.onboard = Onboard({
        wallets: [injected],
        chains: [
          {
            id: '0x1', // Mainnet
            token: 'ETH',
            label: 'Ethereum Mainnet',
            rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`
          },
          {
            id: '0x89', // Polygon
            token: 'MATIC',
            label: 'Polygon Mainnet',
            rpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`
          },
           {
            id: '0xa4b1', // Arbitrum
            token: 'ETH',
            label: 'Arbitrum One',
            rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`
          }
        ],
        appMetadata: {
          name: 'YieldVerse',
          icon: '<svg>...</svg>', // Replace with your app icon
          description: 'AI-powered DeFi portfolio management',
          recommendedInjectedWallets: [
            { name: 'MetaMask', url: 'https://metamask.io' },
            { name: 'WalletConnect', url: 'https://walletconnect.com' }
          ]
        },
        accountCenter: {
            desktop: {
              enabled: true,
              position: 'topRight'
            },
            mobile: {
              enabled: true,
              position: 'topRight'
            }
        }
    });
  }


  async connectWallet(): Promise<void> {
    try {
      const wallets = await this.onboard.connectWallet();
      if (wallets[0]) {
        // Use ethers.BrowserProvider in Ethers v6
        const provider = new ethers.BrowserProvider(wallets[0].provider, 'any');
        this.providerSubject.next(provider);

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          this.accountSubject.next(accounts[0].address); // Access address property
          this.signerSubject.next(await provider.getSigner(accounts[0].address)); // Get the signer
        }

        // Handle chain changes (Ethers v6 uses `network` event)
        provider.on('network', (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork) {
                window.location.reload();
            }
        });

        // Handle account changes (Ethers v6 - listen to events from the signer)
        // This is a bit trickier in v6; we need to listen to events from the provider
        // that the wallet is connected.  The best way is to refresh if accounts change.
        wallets[0].provider.on("accountsChanged", async (accounts: string[]) => {
          if (accounts.length > 0) {
              // Update the account
              this.accountSubject.next(accounts[0]);
              // It's good practice to get the new signer as well
              const newSigner = await provider.getSigner(accounts[0]);
              this.signerSubject.next(newSigner);
          } else {
              this.accountSubject.next(null);
              this.signerSubject.next(null);
          }
          // Refresh the page for simplicity (best practice with account changes)
          window.location.reload();
      });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Handle errors appropriately (e.g., show a user-friendly message)
    }
  }

  async disconnectWallet(): Promise<void> {
      const [primaryWallet] = this.onboard.state.get().wallets;
      if (primaryWallet) {
          await this.onboard.disconnectWallet({ label: primaryWallet.label });
      }
      this.accountSubject.next(null);
      this.providerSubject.next(null);
      this.signerSubject.next(null);
  }

  getAccount(): string | null {
    return this.accountSubject.value;
  }

  getProvider(): ethers.Provider | null {
        return this.providerSubject.value;
    }

  getSigner(): ethers.Signer | null {
      return this.signerSubject.value;
  }


}
