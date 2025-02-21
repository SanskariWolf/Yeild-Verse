import { UserService } from './../../../../services/user.service';
import { Component } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Web3Service } from '../../../../services/web3.service'; // Import Web3Service
import { Observable, Subscription, of, combineLatest } from 'rxjs';
import { switchMap, catchError, tap, filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-portfolio-dashboard',
  imports: [CommonModule],
  templateUrl: './portfolio-dashboard.component.html',
  styleUrl: './portfolio-dashboard.component.css'
})
export class PortfolioDashboardComponent {
  portfolioData$: Observable<any> | undefined;
  aiPredictions$: Observable<any> | undefined;
  private subscriptions: Subscription[] = [];
  user$: Observable<any>;

  constructor(private apiService: ApiService, private web3Service: Web3Service, private userService: UserService) {
    this.user$ = this.userService.user$;
  }


  ngOnInit(): void {

      const account$ = this.web3Service.account$.pipe(
        filter((account): account is string => account !== null), // Type guard
      );

      this.portfolioData$ = account$.pipe(
          switchMap(account => this.apiService.getPortfolioData(account)),
          catchError(err => {
              console.error('Error fetching portfolio data:', err);
              return of(null); // Return null or some default value on error
          })
      );

      this.aiPredictions$ = account$.pipe(
        switchMap(account => this.apiService.getAIPredictions(account)),
        catchError(err => {
            console.error('Error fetching AI predictions:', err);
            return of(null);
        })
      );
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
