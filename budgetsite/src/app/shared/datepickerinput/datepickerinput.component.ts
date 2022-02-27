import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';

let moment = _rollupMoment || _moment;
{
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

  moment.updateLocale('pt-BR', {
    weekdays: [
      "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
    ]
  });

  moment.updateLocale('pt-BR', {
    weekdaysShort: [
      "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
    ]
  });

  moment.updateLocale('pt-BR', {
    weekdaysMin: [
      "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
    ]
  });

  moment.updateLocale('pt-BR', {
    longDateFormat: {
      LT: "h:mm A",
      LTS: "h:mm:ss A",
      L: "DD/MM/YYYY",
      LL: "MMMM Do YYYY",
      LLL: "MMMM Do YYYY LT",
      LLLL: "dddd, MMMM Do YYYY LT",
    }
  })

  moment.locale('pt-BR');
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DD MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD MMMM YYYY',
  },
};

@Component({
  selector: 'app-datepickerinput',
  templateUrl: './datepickerinput.component.html',
  styleUrls: ['./datepickerinput.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class DatepickerinputComponent implements OnInit {

  @Input() currentDate?: Date;
  @Output() currentDateChanged: EventEmitter<Date> = new EventEmitter<Date>();

  date = new FormControl(moment(), Validators.required);

  constructor() { }

  ngOnInit(): void {

    if (this.currentDate) {

      this.date.setValue(moment(this.currentDate));
    }
  }

  dateChanged(event: Moment): void {

    this.currentDateChanged.emit(event?.toDate());
  }
}
