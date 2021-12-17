import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/components/template/nav/nav.service';

@Component({
  selector: 'app-budget-view',
  templateUrl: './budget-view.component.html',
  styleUrls: ['./budget-view.component.css']
})
export class BudgetViewComponent implements OnInit {

  constructor(private navService: NavService) {

    navService.navData = {

      title: 'Orcamento',
      icon: 'view_quilt',
      routeUrl: '/budget'
    };
  }

  ngOnInit(): void {
  }

}
