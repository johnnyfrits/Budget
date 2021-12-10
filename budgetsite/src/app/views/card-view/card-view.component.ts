import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/components/template/nav/nav.service';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.css']
})
export class CardViewComponent implements OnInit {

  constructor(private navService: NavService) {

    navService.navData = {

      title: 'Cartões',
      icon: 'credit_card',
      routeUrl: '/cards'
    };
  }

  ngOnInit(): void {
  }
}
