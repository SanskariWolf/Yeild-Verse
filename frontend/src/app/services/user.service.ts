import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Web3Service } from './web3.service'; // Import Web3Service
import { ApiService } from './api.service'; // Import ApiService
import { switchMap, tap, map, filter, distinctUntilChanged } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject = new BehaviorSubject<any | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private web3Service: Web3Service, private apiService: ApiService) {
      this.web3Service.account$
          .pipe(
              distinctUntilChanged(), // Only proceed if the account actually changes
              switchMap(account => {
                  if (account) {
                      // Fetch user data and settings from the API
                      return this.apiService.getUserSettings(account).pipe(
                        map( settings => ({ account, settings }))
                      );
                  } else {
                      // If no account, clear user data
                      return [null];
                  }
              })
          )
          .subscribe(user => {
              this.userSubject.next(user);
          });
  }
    getUser(): any | null {
      return this.userSubject.value;
    }

}
