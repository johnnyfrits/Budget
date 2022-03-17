import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Cards } from 'src/app/models/cards.model';
import { CardService } from 'src/app/services/card/card.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, AfterViewInit {

  cards?: Cards[];
  totalBalance?: number;
  previousBalance?: number;
  totalYields?: number;
  cardId?: number;
  reference?: string;
  referenceHead?: string;
  card!: Cards;
  hideProgress: boolean = false;
  buttonName: string = "";

  constructor(private cardService: CardService, private cd: ChangeDetectorRef) {

    this.cardId = Number(localStorage.getItem("cardId"));
  }

  ngAfterViewInit(): void {

    this.cd.detectChanges();
  }

  ngOnInit(): void {

    this.cardService.read().subscribe(
      {
        next: cards => {

          this.cards = cards;

          this.hideProgress = true;

          this.cards.forEach(card => {

            if (card.id == this.cardId) {

              this.setCard(card);
            }
          });
        },
        error: () => this.hideProgress = true
      }
    );
  }

  setReference(reference: string) {

    this.reference = reference;

    this.referenceHead = this.reference.substr(4, 2) + "/" + this.reference.substr(0, 4);
  }

  setCard(card: Cards) {

    if (card) {

      this.buttonName = card.name;
      this.hideProgress = false;

      this.cardId = card.id;
      this.card = card;

      localStorage.setItem("cardId", card.id!.toString());
    }

    this.hideProgress = true;
  }

  cardDialog() {

  }
}
