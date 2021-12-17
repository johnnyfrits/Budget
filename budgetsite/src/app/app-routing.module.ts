import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { HomeComponent } from "./views/home/home.component";
import { BudgetViewComponent } from './views/budget-view/budget-view.component';
import { AccountViewComponent } from './views/account-view/account-view.component';
import { CardViewComponent } from './views/card-view/card-view.component';

const routes: Routes = [
  {
    path: "",
    component: AccountViewComponent
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
