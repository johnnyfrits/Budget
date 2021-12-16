import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

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
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
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
  ]
})
export class DatepickerComponent implements OnInit {

  date = new FormControl(moment());

  @Input() accountId?: number;
  @Input() cardId?: number;

  monthName: string = "";
  @Output() referenceChange = new EventEmitter<string>();

  ngOnInit(): void {

    debugger;

    let localDate = this.accountId ? localStorage.getItem('accountDate') : localStorage.getItem('cardDate');

    if (localDate) {

      this.date.setValue(moment(localDate));

      this.setMonthName();
    }
  }

  setMonthName() {

    this.monthName = this.date.value.format('MMMM');
    let reference = this.date.value.format('YYYYMM');

    this.referenceChange.emit(reference);

    if (this.accountId) {
      localStorage.setItem('accountDate', this.date.value);
    }
    else {
      localStorage.setItem('cardDate', this.date.value);
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
