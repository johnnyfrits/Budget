import { Component, OnInit } from '@angular/core';
import { Cards } from 'src/app/models/cards.model';
import { CardService } from 'src/app/services/card/card.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  cards?: Cards[];
  totalBalance?: number;
  previousBalance?: number;
  totalYields?: number;
  cardId?: number;
  reference?: string;
  card!: Cards;
  monthName: string = "";
  hideProgress: boolean = false;
  buttonName: string = "";

  constructor(private cardService: CardService) {

    this.cardId = Number(localStorage.getItem("cardId"));
  }

  ngOnInit(): void {

    this.cardService.read().subscribe(cards => {

      this.cards = cards;

      this.hideProgress = true;

      this.cards.forEach(card => {

        if (card.id == this.cardId) {

          this.getCardTotals(card);
        }
      });
    });
  }

  getCardTotals(card: Cards) {

    if (card) {

      this.buttonName = card.name;
      this.hideProgress = false;

      this.cardId = card.id;
      this.card = card;

      localStorage.setItem("cardId", card.id!.toString());
    }

    this.hideProgress = true;
  }
}
