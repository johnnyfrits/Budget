import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CardsPostings } from '../../models/cardspostings.model'
import { CardPostingsService } from '../../services/cardpostings/cardpostings.service';

@Component({
  selector: 'app-cardpostings',
  templateUrl: './cardpostings.component.html',
  styleUrls: ['./cardpostings.component.css']
})

export class CardPostingsComponent implements OnInit {

  @Input() cardId?: number;
  @Input() reference?: string;

  cardpostings!: CardsPostings[];
  displayedColumns = ['index', 'date', 'description', 'amount'];
  total: number = 0;
  myTotal: number = 0;
  percMyTotal: string = '0,00%';
  othersTotal: number = 0;
  percOthersTotal: string = '0,00%';
  hideProgress: boolean = true;

  constructor(private cardPostingsService: CardPostingsService) { }

  ngOnInit(): void {

    this.getTotalAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['cardId']?.currentValue || changes['reference']?.currentValue) {
    if (this.cardId) {

      this.hideProgress = false;

      this.cardPostingsService.read(this.cardId!, this.reference!).subscribe(cardpostings => {

        this.cardpostings = cardpostings;

        this.getTotalAmount();

        this.hideProgress = true;
      });
    }
  }

  getTotalAmount() {

    this.total =
      this.cardpostings ?
        this.cardpostings.map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.myTotal = this.cardpostings ?
      this.cardpostings.filter(t => !t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0

    this.othersTotal = this.cardpostings ?
      this.cardpostings.filter(t => t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.percMyTotal = (this.total ? this.myTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';;
    this.percOthersTotal = (this.total ? this.othersTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
  }
}
