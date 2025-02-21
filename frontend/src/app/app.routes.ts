import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { ConnectWalletComponent } from './components/pages/connect-wallet/connect-wallet.component';
import { PortfolioComponent } from './components/pages/portfolio/portfolio.component';
import { PortfolioDashboardComponent } from './components/pages/portfolio/portfolio-dashboard/portfolio-dashboard.component';
import { PortfolioCreateComponent } from './components/pages/portfolio/portfolio-create/portfolio-create.component';
import { PortfolioSettingsComponent } from './components/pages/portfolio/portfolio-settings/portfolio-settings.component';
import { NotFoundComponent } from './components/pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'connect-wallet', component: ConnectWalletComponent },
  {
    path: 'portfolio',
    component: PortfolioComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PortfolioDashboardComponent },
      { path: 'create', component: PortfolioCreateComponent },
      { path: 'settings', component: PortfolioSettingsComponent },
    ]
  },
  { path: '**', component: NotFoundComponent },
];
