import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AccountsSummary } from 'src/app/models/accountssummary';
import { TotalsAccountsSummary } from 'src/app/models/totalsaccountssummary';
import { AccountService } from 'src/app/services/account/account.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit, AfterViewInit {

  reference?: string;
  referenceHead?: string;
  monthName: string = "";
  hideAccountsSummaryProgress: boolean = true;
  hideTotalsAccountsSummaryProgress: boolean = true;
  accountsSummary!: AccountsSummary[];
  totalsAccountsSummary!: TotalsAccountsSummary;
  forecastBalanceTotal: number = 0;
  availableBalanceTotal: number = 0;
  displayedColumns = ['description', 'forecastBalance', 'availableBalance'];

  constructor(private cd: ChangeDetectorRef, private accountService: AccountService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    this.cd.detectChanges();
  }

  referenceChanges(reference: string) {

    this.reference = reference;

    this.referenceHead = this.reference.substr(4, 2) + "/" + this.reference.substr(0, 4);

    this.refresh();
  }

  refresh() {

    this.hideAccountsSummaryProgress = false;
    this.hideTotalsAccountsSummaryProgress = false;

    this.accountService.getAccountsSummary(this.reference).subscribe(
      {
        next: accountsSummary => {

          this.accountsSummary = accountsSummary;

          this.getFooterTotals();
        },
        error: () => {
          this.hideAccountsSummaryProgress = true;
        }
      }
    );

    this.accountService.getTotalsAccountsSummary(this.reference).subscribe(
      {
        next: totalsAccountsSummary => {

          this.totalsAccountsSummary = totalsAccountsSummary;

          this.hideTotalsAccountsSummaryProgress = true;
        },
        error: () => {
          this.hideTotalsAccountsSummaryProgress = true;
        }
      }
    );
  }

  getFooterTotals() {

    this.forecastBalanceTotal =
      this.accountsSummary ?
        this.accountsSummary.map(t => t.forecastBalance).reduce((acc, value) => acc + value, 0) :
        0;

    this.availableBalanceTotal =
      this.accountsSummary ?
        this.accountsSummary.map(t => t.availableBalance).reduce((acc, value) => acc + value, 0) :
        0;

    this.hideAccountsSummaryProgress = true;
  }
}
