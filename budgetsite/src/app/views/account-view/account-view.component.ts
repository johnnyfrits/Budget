import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/components/template/nav/nav.service';

@Component({
  selector: 'app-account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.css']
})
export class AccountViewComponent implements OnInit {

  constructor(private navService: NavService) {

    navService.navData = {

      title: 'Contas',
      icon: 'account_balance',
      routeUrl: '/accounts'
    };
  }

  ngOnInit(): void {
  }

}
