import { UserService } from './../../../../services/user.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-portfolio-settings',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './portfolio-settings.component.html',
  styleUrl: './portfolio-settings.component.css'
})
export class PortfolioSettingsComponent {
  settingsForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private apiService: ApiService, private userService: UserService) {
    this.settingsForm = this.fb.group({
      riskAppetite: ['moderate', Validators.required],
      notificationPreferences: this.fb.group({
        email: [true],
        push: [false],
      }),
    });
  }

  ngOnInit() {
    this.userService.user$
      .pipe(
        switchMap(user => {
          if (user && user.account) {
            return this.apiService.getUserSettings(user.account);
          } else {
            return of(null); // Or handle the case where there's no user/account
          }
        })
      )
      .subscribe(settings => {
        if (settings) {
          this.settingsForm.patchValue(settings);
        }
      });
  }

  onSubmit() {
     if (this.settingsForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.successMessage = null;
      this.errorMessage = null;

      this.userService.user$
        .pipe(
          switchMap(user => {
            if(user && user.account){
              return this.apiService.updateUserSettings(user.account, this.settingsForm.value)
            } else {
              return of(null)
            }
          }
          )
        ).subscribe({
          next: (response) => {
            console.log('Settings updated:', response);
            this.successMessage = 'Settings updated successfully!';
             // Optionally, clear the success message after a few seconds
            setTimeout(() => this.successMessage = null, 5000);
          },
          error: (error) => {
             console.error('Error updating settings:', error);
            this.errorMessage = 'Failed to update settings. Please try again.';
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          }

        })
    }
  }

}
