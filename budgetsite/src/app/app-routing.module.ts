import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { HomeComponent } from "./views/home/home.component";
import { AccountComponent } from './components/account/account.component';
import { CardComponent } from './components/card/card.component';

const routes: Routes = [
  // {
  //   path: "",
  //   component: HomeComponent
  // },
  {
    path: "accounts",
    component: AccountComponent
  },
  {
    path: "cards",
    component: CardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
