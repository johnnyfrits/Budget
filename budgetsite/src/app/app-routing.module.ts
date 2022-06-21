import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginViewComponent } from "./views/login-view/login-view.component";
import { BudgetViewComponent } from './views/budget-view/budget-view.component';
import { AccountViewComponent } from './views/account-view/account-view.component';
import { CardViewComponent } from './views/card-view/card-view.component';
import { SummaryViewComponent } from './views/summary-view/summary-view.component';
import { NavComponent } from './components/template/nav/nav.component';
import { UnautheticatedUserGuard } from './services/guards/unautheticated-user.guard';
import { AutheticatedUserGuard } from './services/guards/autheticated-user.guard';

const routes: Routes = [
  {
    path: "login",
    component: LoginViewComponent,
    canActivate: [UnautheticatedUserGuard]
  },
  {
    path: "",
    component: NavComponent,
    canActivate: [AutheticatedUserGuard],
    children: [
      {
        path: "",
        component: SummaryViewComponent
      },
      {
        path: "summary",
        component: SummaryViewComponent
      },
      {
        path: "budget",
        component: BudgetViewComponent
      },
      {
        path: "accounts",
        component: AccountViewComponent
      },
      {
        path: "cards",
        component: CardViewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
