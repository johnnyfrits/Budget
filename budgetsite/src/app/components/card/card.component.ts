import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { Cards } from 'src/app/models/cards.model';
import { CardService } from 'src/app/services/card/card.service';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';

let moment = _rollupMoment || _moment;

moment.updateLocale('pt-BR', {
  months: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
    "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
});

moment.updateLocale('pt-BR', {
  monthsShort: [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ]
});

moment.locale('pt-BR');


// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
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

  constructor(private cardService: CardService) { }

  ngOnInit(): void {

    this.monthName = this.date.value.format('MMMM');

    this.cardService.read().subscribe(cards => {

      this.cards = cards;

      this.hideProgress = true;
    });
  }

  date = new FormControl(moment());

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();

    this.reference = this.date.value.format('YYYYMM');

    if (this.card) {

      this.getCardTotals(this.card);
    }
  }

  getCardTotals(card: Cards) {

    this.monthName = this.date.value.format('MMMM');

    if (card) {

      this.buttonName = card.name;
      this.hideProgress = false;

      this.cardId = card.id;
      this.reference = this.date.value.format('YYYYMM');
      this.card = card;
    }

    this.hideProgress = true;
  }

  setNextMonth() {

    const nextMonth = this.date.value.clone().add(1, 'M');

    this.date.setValue(nextMonth);

    this.getCardTotals(this.card);
  }

  setPreviousMonth() {

    const previousMonth = this.date.value.clone().subtract(1, 'M');

    this.date.setValue(previousMonth);

    this.getCardTotals(this.card);
  }
}
