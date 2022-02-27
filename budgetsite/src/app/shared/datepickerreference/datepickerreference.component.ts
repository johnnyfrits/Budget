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
  selector: 'app-datepickerreference',
  templateUrl: './datepickerreference.component.html',
  styleUrls: ['./datepickerreference.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class DatepickerreferenceComponent implements OnInit {

  date = new FormControl(moment());

  @Input() reference?: string;
  @Output() referenceChange = new EventEmitter<string>();

  ngOnInit(): void {

    this.date.setValue(moment(this.reference));

    this.setReference();
  }

  setReference() {

    let reference = this.date.value.format('YYYYMM');

    this.referenceChange.emit(reference);
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

    this.setReference();
  }

  setNextMonth() {

    const nextMonth = this.date.value.clone().add(1, 'M');

    this.date.setValue(nextMonth);

    this.setReference();
  }

  setPreviousMonth() {

    const previousMonth = this.date.value.clone().subtract(1, 'M');

    this.date.setValue(previousMonth);

    this.setReference();
  }
}
