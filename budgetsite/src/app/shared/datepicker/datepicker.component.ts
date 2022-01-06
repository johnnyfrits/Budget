import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
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
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class DatepickerComponent implements OnInit {

  date = new FormControl(moment());
  monthName: string = "";

  @Input() accountId?: number;
  @Input() cardId?: number;
  @Input() budgetId?: number;
  @Input() showMonthName?: boolean = true;

  @Output() referenceChange = new EventEmitter<string>();
  @Output() monthChange = new EventEmitter<string>();

  ngOnInit(): void {

    let localDate;

    if (this.accountId) {
      localDate = localStorage.getItem('accountDate');
    }
    else if (this.cardId) {
      localDate = localStorage.getItem('cardDate');
    }
    else if (this.budgetId) {
      localDate = localStorage.getItem('budgetDate');
    }

    if (localDate) {

      this.date.setValue(moment(localDate));
    }

    this.setMonthName();
  }

  setMonthName() {

    this.monthName = this.date.value.format('MMMM');
    let reference = this.date.value.format('YYYYMM');

    this.referenceChange.emit(reference);
    this.monthChange.emit(this.monthName);

    if (this.accountId) {
      localStorage.setItem('accountDate', this.date.value);
    }
    else if (this.cardId) {
      localStorage.setItem('cardDate', this.date.value);
    }
    else if (this.budgetId) {
      localStorage.setItem('budgetDate', this.date.value);
    }
  }

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

    this.setMonthName();
  }

  setNextMonth() {

    const nextMonth = this.date.value.clone().add(1, 'M');

    this.date.setValue(nextMonth);

    this.setMonthName();
  }

  setPreviousMonth() {

    const previousMonth = this.date.value.clone().subtract(1, 'M');

    this.date.setValue(previousMonth);

    this.setMonthName();
  }
}
