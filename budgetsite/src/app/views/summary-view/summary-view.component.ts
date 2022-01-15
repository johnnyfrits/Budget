import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/components/template/nav/nav.service';

@Component({
  selector: 'app-summary-view',
  templateUrl: './summary-view.component.html',
  styleUrls: ['./summary-view.component.css']
})
export class SummaryViewComponent implements OnInit {

  constructor(private navService: NavService) {

    navService.navData = {

      title: 'Saldos',
      icon: 'account_balance_wallet',
      routeUrl: '/sumary'
    };
  }
  ngOnInit(): void {
  }

}
