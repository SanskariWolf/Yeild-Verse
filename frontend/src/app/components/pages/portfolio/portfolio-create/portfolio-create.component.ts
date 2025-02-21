import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router


@Component({
  selector: 'app-portfolio-create',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './portfolio-create.component.html',
  styleUrl: './portfolio-create.component.css'
})
export class PortfolioCreateComponent {
  portfolioForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) { // Inject Router
    this.portfolioForm = this.fb.group({
      riskAppetite: ['moderate', Validators.required],
      initialInvestment: [1000, [Validators.required, Validators.min(1)]],
      // Add more form controls as needed
    });
  }

  onSubmit() {
    if (this.portfolioForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;

      this.apiService.createPortfolio(this.portfolioForm.value)
        .subscribe({
          next: (response) => {
            console.log('Portfolio created:', response);
            this.router.navigate(['/portfolio/dashboard']);
          },
          error: (error) => {
            console.error('Error creating portfolio:', error);
            this.errorMessage = 'Failed to create portfolio. Please try again.'; // User-friendly message
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
    }
  }

}
