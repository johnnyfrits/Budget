import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { HeaderComponent } from './components/template/header/header.component';
import { NavComponent } from './components/template/nav/nav.component';
import { AccountViewComponent } from './views/account-view/account-view.component';
import { AccountComponent } from './components/account/account.component';
import { AccountPostingsComponent } from './components/accountpostings/accountpostings.component';
import { CardViewComponent } from './views/card-view/card-view.component';
import { CardComponent } from './components/card/card.component';

import { LayoutModule } from '@angular/cdk/layout';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardPostingsComponent } from './components/cardpostings/cardpostings.component';
import { BudgetComponent } from './components/budget/budget.component';


registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent,
    AccountComponent,
    AccountPostingsComponent,
    CardComponent,
    AccountViewComponent,
    CardViewComponent,
    CardPostingsComponent,
    BudgetComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    LayoutModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{
    provide: LOCALE_ID,
    useValue: 'pt-BR',
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
