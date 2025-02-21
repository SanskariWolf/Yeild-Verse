import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { delay } from 'rxjs/operators';
import { switchMap, catchError } from 'rxjs/operators';
import { Web3Service } from './web3.service'; // Import Web3Service

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:3001/api'; // Or your actual backend URL

  constructor(private http: HttpClient, private web3Service: Web3Service) { }

  // --- Authentication ---
    private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) {
          // Handle the case where there is no token (e.g., user not logged in)
          throw new Error('No authentication token available.'); // Or return some default headers
        }
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        return of(headers);
      })
    );
  }

  private async getAuthToken(): Promise<string | null> {
      const account = this.web3Service.getAccount();
      const signer = this.web3Service.getSigner();

      if (account && signer) {
          const message = "Sign this message to authenticate with YieldVerse.";
          const signature = await signer.signMessage(message);
          const response = await fetch(`${this.baseUrl}/auth/authenticate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, signature, address: account }),
          });

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.token;

      }
    return null
  }


  // --- Portfolio Management ---
  getPortfolioData(account: string): Observable<any> {
    // STUB: Replace with actual API call
    console.log(`Fetching portfolio data for: ${account}`);
    return of({
      totalValue: 12345.67,
      assets: [
        { symbol: 'ETH', balance: 2.5, value: 5000, apy: 0.05 },
        { symbol: 'DAI', balance: 1000, value: 1000, apy: 0.08 },
      ],
      riskScore: 'moderate',
    }).pipe(delay(500)); // Simulate network latency
  }

  createPortfolio(preferences: any): Observable<any> {
      // STUB:  Implement the backend interaction to create a portfolio.
      console.log('Creating portfolio with preferences:', preferences);
      return of({ success: true, portfolioId: '123' }).pipe(delay(1000));
  }


  getAIPredictions(account: string): Observable<any> {
    // STUB: Replace with actual API call
    return of({
      recommendedAllocations: [
        { symbol: 'ETH', percentage: 0.6 },
        { symbol: 'DAI', percentage: 0.4 },
      ],
      projectedYield: 0.07,
    }).pipe(delay(750));
  }

  // --- Smart Contract Interaction ---

  deposit(amount: number, asset: string, portfolioId: string): Observable<any> {
    // STUB: Replace with interaction using Web3Service and smart contract ABI
      console.log(`Depositing ${amount} ${asset} to portfolio ${portfolioId}`);
      return of({ transactionHash: '0x...' }).pipe(delay(2000));
  }

  withdraw(amount: number, asset: string, portfolioId: string): Observable<any> {
      // STUB
      console.log(`Withdrawing ${amount} ${asset} from portfolio ${portfolioId}`);
      return of({ transactionHash: '0x...' }).pipe(delay(2000));
  }

  // --- User settings ---
  getUserSettings(account: string): Observable<any>{
    return of({
      riskAppetite: "moderate",
      notificationPreferences: {
        email: true,
        push: false
      }
    }).pipe(delay(750));
  }

  updateUserSettings(account: string, settings: any): Observable<any>{
    console.log('Updating settings:', settings);
    return of({
      success: true
    }).pipe(delay(500))
  }

}
