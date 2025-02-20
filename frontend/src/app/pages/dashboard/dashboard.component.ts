import { Component } from '@angular/core';
import { WalletInfoComponent } from "../../components/wallet-info/wallet-info.component";
import { InvestmentOverviewComponent } from "../../components/investment-overview/investment-overview.component";
import { YieldStatsComponent } from "../../components/yield-stats/yield-stats.component";
import { ActionsComponent } from "../../components/actions/actions.component";

@Component({
  selector: 'app-dashboard',
  imports: [WalletInfoComponent, InvestmentOverviewComponent, YieldStatsComponent, ActionsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
