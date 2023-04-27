import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxMatColorPickerComponent, Color } from '@angular-material-components/color-picker';
import { Cards } from 'src/app/models/cards.model';
import { CardService } from 'src/app/services/card/card.service';
import { DatepickerinputComponent } from 'src/app/shared/datepickerinput/datepickerinput.component';

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

  constructor(private cardService: CardService,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog) {

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

  getCardsNotDisabled(cards: Cards[]) {

    return cards?.filter(card => card.disabled == null || card.disabled == false);
  }

  cardDialog() {
    const dialogRef = this.dialog.open(CardDialog, {
      width: '400px',
      data: this.cards
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        if (result.deleting) {

          this.cardService.delete(result.id).subscribe(
            {
              next: () => {

                this.cards = this.cards!.filter(t => t.id! != result.id!);

                if (this.cards.length > 0) {

                  this.setCard(this.cards[0]);
                }
              },
              error: () => this.hideProgress = true
            }
          );
        }
        else if (result.editing) {

          this.cardService.update(result).subscribe(
            {
              next: () => {

                this.cards!.filter(t => t.id! === result.id!).map(t => {
                  t.id = result.id;
                  t.userId = result.userId;
                  t.name = result.name;
                  t.color = result.color;
                  t.background = result.background;
                  t.disabled = result.disabled;
                  t.closingDay = result.closingDay;
                  t.invoiceStart = result.invoiceStart;
                  t.invoiceEnd = result.invoiceEnd;
                });

                if (result.disabled && this.cards!.length > 0) {

                  this.setCard(this.cards![0]);
                }
                else {

                  this.setCard(result);
                }
              },
              error: () => this.hideProgress = true
            }
          );
        }
        else {

          this.cardService.create(result).subscribe(
            {
              next: card => {

                this.cards!.push(card);

                this.setCard(card);
              },
              error: () => this.hideProgress = true
            }
          );
        }
      }
    });
  }
}

@Component({
  selector: 'card-dialog',
  templateUrl: 'card-dialog.html',
  styleUrls: ['./card.component.scss']
})
export class CardDialog implements OnInit, AfterViewInit {

  @ViewChild('picker1') picker1!: NgxMatColorPickerComponent;
  @ViewChild('picker2') picker2!: NgxMatColorPickerComponent;
  @ViewChild('invoiceStart') invoiceStart!: DatepickerinputComponent;
  @ViewChild('invoiceEnd') invoiceEnd!: DatepickerinputComponent;

  id?: number;
  userId!: number;
  buttonName: string = "";
  buttonText: string = "Nome do Cartão";

  editing: boolean = false;
  deleting: boolean = false;

  cardFormGroup = new FormGroup({

    nameFormControl: new FormControl('', Validators.required),
    backgroundFormControl: new FormControl('', Validators.required),
    colorFormControl: new FormControl('', Validators.required),
    disabledFormControl: new FormControl(''),
    closingDayFormControl: new FormControl(''),
    invoiceStartFormControl: new FormControl(''),
    invoiceEndFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<CardDialog>,
    @Inject(MAT_DIALOG_DATA) public cards: Cards[],
    private cd: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {

    this.addCard();
    this.cd.detectChanges();
  }

  ngOnInit(): void {

    // this.invoiceStart.date = new moment(this.invoiceStart.;
  }

  cancel(): void {

    this.dialogRef.close();
  }

  save(): void {

    let card: Cards = {
      id: this.id,
      userId: this.userId,
      name: this.cardFormGroup.get('nameFormControl')?.value,
      background: '#' + this.picker1._pickerInput.value!.hex,
      color: '#' + this.picker2._pickerInput.value!.hex,
      disabled: this.cardFormGroup.get('disabledFormControl')?.value,
      closingDay: this.cardFormGroup.get('closingDayFormControl')?.value,
      invoiceStart: this.invoiceStart.date.value._d,
      invoiceEnd: this.invoiceStart.date.value._d,
      editing: this.id != undefined,
      deleting: false
    };

    this.dialogRef.close(card);
  }

  delete(): void {

    let card: Cards = {
      id: this.id,
      userId: this.userId,
      name: this.cardFormGroup.get('nameFormControl')?.value,
      editing: false,
      deleting: true
    };

    this.dialogRef.close(card);
  }

  addCard() {

    this.id = undefined;

    this.cardFormGroup.get('nameFormControl')?.setValue('');
    this.cardFormGroup.get('disabledFormControl')?.setValue(false);
    this.cardFormGroup.get('calcInGeneralFormControl')?.setValue(false);

    this.setBackgroundAndColor('#000000', '#ffffff');
  }

  onNameChange(name: any) {

    this.buttonText = name != '' ? name : "Nome da Conta";
  }

  setCard(card: Cards) {

    if (card) {

      this.buttonName = card.name;

      this.id = card.id;
      this.userId = card.userId;

      this.cardFormGroup.get('nameFormControl')?.setValue(card.name);
      this.cardFormGroup.get('disabledFormControl')?.setValue(card.disabled);
      this.cardFormGroup.get('closingDayFormControl')?.setValue(card.closingDay);
      this.cardFormGroup.get('invoiceStartFormControl')?.setValue(card.invoiceStart);
      this.cardFormGroup.get('invoiceEndFormControl')?.setValue(card.invoiceEnd);

      this.setBackgroundAndColor(card.background!, card.color!);
    }
  }

  setBackgroundAndColor(background: string, color: string) {

    this.cardFormGroup.get('backgroundFormControl')?.setValue(background);
    this.cardFormGroup.get('colorFormControl')?.setValue(color);

    const color1 = this.hexToRgb(background);
    const color2 = this.hexToRgb(color);

    this.picker1._pickerInput.value = new Color(color1!.r, color1!.g, color1!.b);
    this.picker2._pickerInput.value = new Color(color2!.r, color2!.g, color2!.b);
  }

  hexToRgb(hex: string) {

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
