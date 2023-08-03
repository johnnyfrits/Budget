import { CategoryComponent } from './../category/category.component';
import { Component, OnInit, Input, SimpleChanges, Inject, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CardsPostings } from '../../models/cardspostings.model'
import { CardPostingsService } from '../../services/cardpostings/cardpostings.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { People } from 'src/app/models/people.model';
import { PeopleService } from 'src/app/services/people/people.service';
import { CardsPostingsDTO } from 'src/app/models/cardspostingsdto.model';
import { CardReceiptsService } from 'src/app/services/cardreceipts/cardreceipts.service';
import { CardsReceipts } from 'src/app/models/cardsreceipts.model';
import { Accounts } from 'src/app/models/accounts.model';
import { AccountService } from 'src/app/services/account/account.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Categories } from 'src/app/models/categories.model';
import { CategoryService } from 'src/app/services/category/category.service';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { ExpensesByCategories } from 'src/app/models/expensesbycategories';
import { PeopleComponent } from '../people/people.component';
import { CardService } from 'src/app/services/card/card.service';
import { Cards } from 'src/app/models/cards.model';
import { DatepickerinputComponent } from 'src/app/shared/datepickerinput/datepickerinput.component';
import moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-cardpostings',
  templateUrl: './cardpostings.component.html',
  styleUrls: ['./cardpostings.component.scss']
})

export class CardPostingsComponent implements OnInit {

  @Input() cardId?: number;
  @Input() reference?: string;

  @ViewChild('input') filterInput!: ElementRef;

  cardpostings!: CardsPostings[];
  cardpostingspeople!: CardsPostingsDTO[];
  expensesByCategories!: ExpensesByCategories[];
  displayedColumns = ['index', 'date', 'description', 'amount'];
  displayedPeopleColumns = ['person', 'toReceive', 'received', 'remaining', 'actions'];
  displayedCategoriesColumns = ['category', 'amount', 'perc'];
  total: number = 0;
  toReceiveTotalPeople: number = 0;
  receivedTotalPeople: number = 0;
  remainingTotalPeople: number = 0;
  amountTotalCategory: number = 0;
  percTotalCategory: number = 0;
  myTotal: number = 0;
  percMyTotal: string = '0,00%';
  othersTotal: number = 0;
  percOthersTotal: string = '0,00%';
  inTheCycleTotal: number = 0;
  outTheCycleTotal: number = 0;
  percInTheCycleTotal: string = '0,00%';
  percOutTheCycleTotal: string = '0,00%';
  hideProgress: boolean = true;
  editing: boolean = false;
  peopleList?: People[];
  categoriesList?: Categories[];
  cardsList?: Cards[];
  accountsList?: Accounts[];
  cardPostingsPanelExpanded: boolean = false;
  peoplePanelExpanded: boolean = false;
  categoryPanelExpanded: boolean = false;
  checkCard: boolean = false;
  justMyShopping: boolean = false;
  darkTheme?: boolean;
  cardPostingsLength: number = 0;

  filterOpend: boolean = false;
  dataSource = new MatTableDataSource(this.cardpostings);

  constructor(private cardPostingsService: CardPostingsService,
    private cardReceiptsService: CardReceiptsService,
    private peopleService: PeopleService,
    private accountService: AccountService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private cardService: CardService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.darkTheme = document.documentElement.classList.contains('dark-theme');

    this.getTotalAmount();

    this.hideProgress = false;

    this.getLists();

    this.cardPostingsPanelExpanded = localStorage.getItem('cardPostingsPanelExpanded') === 'true';
    this.peoplePanelExpanded = localStorage.getItem('peoplePanelExpanded') === 'true';
    this.categoryPanelExpanded = localStorage.getItem('categoryPanelExpanded') === 'true';
  }

  getLists() {

    this.peopleService.read().subscribe(
      {
        next: people => {

          this.peopleList = people;

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      }
    );

    this.categoryService.read().subscribe(
      {
        next: categories => {

          this.categoriesList = categories.sort((a, b) => a.name.localeCompare(b.name));

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      }
    );

    // this.cardService.readWithCardsInvoiceDate(this.reference).subscribe(
    this.cardService.read().subscribe(
      {
        next: cards => {

          this.cardsList = cards.sort((a, b) => a.name.localeCompare(b.name));

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      }
    );

    this.accountService.readNotDisabled().subscribe(
      {
        next: accounts => {

          this.accountsList = accounts;

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      }
    );
  }

  refresh() {

    this.getLists();

    if (this.cardId) {

      this.hideProgress = false;

      this.cardPostingsService.read(this.cardId!, this.reference!).subscribe(
        {
          next: cardpostings => {

            this.cardpostings = cardpostings.sort((a, b) => (b.position! - a.position!));

            this.cardPostingsLength = this.cardpostings.length;

            this.dataSource = new MatTableDataSource(this.cardpostings);

            this.getTotalAmount();

            this.hideProgress = true;
          },
          error: () => this.hideProgress = true
        }
      );

      this.getCardsPostingsPeople();
      this.getExpensesByCategories();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['cardId']?.currentValue || changes['reference']?.currentValue) {
    this.refresh();
  }

  getCardsPostingsPeople() {

    this.cardPostingsService.readCardsPostingsPeople(this.cardId, this.reference).subscribe(
      {
        next: cardpostingspeople => {

          this.cardpostingspeople = cardpostingspeople.filter(t => t.person !== '');

          this.getTotalPeople();

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      }
    );
  }

  getExpensesByCategories() {

    this.expenseService.readByCategories(this.reference!, this.cardId!).subscribe(
      {
        next: expensesByCategories => {

          this.expensesByCategories = expensesByCategories;

          this.getTotalByCategories();

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      }
    );
  }

  getTotalAmount() {

    this.total =
      this.cardpostings ?
        this.cardpostings.map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.myTotal = this.cardpostings ?
      this.cardpostings.filter(t => !t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.othersTotal = this.cardpostings ?
      this.cardpostings.filter(t => t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.percMyTotal = (this.total ? this.myTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
    this.percOthersTotal = (this.total ? this.othersTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';

    // this.inTheCycleTotal = this.cardpostings ?
    //   this.cardpostings.filter(t => t.inTheCycle).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    // this.outTheCycleTotal = this.cardpostings ?
    //   this.cardpostings.filter(t => !t.inTheCycle).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    // this.percInTheCycleTotal = (this.total ? this.inTheCycleTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
    // this.percOutTheCycleTotal = (this.total ? this.outTheCycleTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';

    if (this.justMyShopping) {

      this.inTheCycleTotal = this.cardpostings ?
        this.cardpostings.filter(t => !t.others && (t.parcelNumber == 1 || t.parcelNumber == null)).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

      this.outTheCycleTotal = this.cardpostings ?
        this.cardpostings.filter(t => !t.others && t.parcelNumber! > 1).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;
    }
    else {

      this.inTheCycleTotal = this.cardpostings ?
        this.cardpostings.filter(t => t.parcelNumber == 1 || t.parcelNumber == null).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

      this.outTheCycleTotal = this.cardpostings ?
        this.cardpostings.filter(t => t.parcelNumber! > 1).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;
    }

    this.percInTheCycleTotal = (this.total ? this.inTheCycleTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
    this.percOutTheCycleTotal = (this.total ? this.outTheCycleTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
  }

  getFilteredTotalAmount() {

    this.total =
      this.dataSource.filteredData ?
        Array(this.dataSource.filteredData)[0].map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;
  }

  getTotalPeople() {

    this.toReceiveTotalPeople =
      this.cardpostingspeople ?
        this.cardpostingspeople.map(t => t.toReceive).reduce((acc, value) => acc + value, 0) : 0;

    this.receivedTotalPeople =
      this.cardpostingspeople ?
        this.cardpostingspeople.map(t => t.received).reduce((acc, value) => acc + value, 0) : 0;

    this.remainingTotalPeople =
      this.cardpostingspeople ?
        this.cardpostingspeople.map(t => t.remaining).reduce((acc, value) => acc + value, 0) : 0;
  }

  getTotalByCategories() {

    this.amountTotalCategory =
      this.expensesByCategories ?
        this.expensesByCategories.map(t => t.amount!).reduce((acc, value) => acc + value, 0) : 0;

    this.percTotalCategory =
      this.expensesByCategories ?
        this.expensesByCategories.map(t => t.perc!).reduce((acc, value) => acc + value, 0) : 0;
  }

  add() {

    this.editing = false;

    const dialogRef = this.dialog.open(CardPostingsDialog, {
      width: '400px',
      data: {
        reference: this.reference,
        cardId: this.cardId,
        parcels: 1,
        parcelNumber: 1,
        peopleList: this.peopleList,
        categoriesList: this.categoriesList,
        cardsList: this.cardsList,
        editing: this.editing,
        adding: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        //this.hideProgress = false;

        Date.prototype.toJSON = function () {
          return moment(this).format("YYYY-MM-DDThh:mm:00.000Z");;
        };

        this.cardPostingsService.create(result).subscribe(
          {
            next: cardpostings => {

              if (cardpostings.reference === this.reference && cardpostings.cardId === this.cardId) {

                this.cardpostings = [...this.cardpostings, cardpostings].sort((a, b) => (b.position! - a.position!));

                this.cardPostingsLength = this.cardpostings.length;

                this.dataSource = new MatTableDataSource(this.cardpostings);
              }

              this.categoriesList = result.categoriesList;
              this.peopleList = result.peopleList;

              this.getTotalAmount();
              this.getCardsPostingsPeople();
              this.getExpensesByCategories();

              //this.hideProgress = true;
            },
            //error: () => this.hideProgress = true
          }
        );
      }
    });
  }

  editOrDelete(cardPosting: CardsPostings, event: any) {

    if (this.checkCard) {

      cardPosting.isSelected = !cardPosting.isSelected;

      return;
    }

    this.editing = true;

    const dialogRef = this.dialog.open(CardPostingsDialog, {
      width: '400px',
      data: {
        id: cardPosting.id,
        cardId: cardPosting.cardId,
        date: cardPosting.date,
        reference: cardPosting.reference,
        position: cardPosting.position,
        description: cardPosting.description,
        peopleId: cardPosting.peopleId,
        parcelNumber: cardPosting.parcelNumber ? cardPosting.parcelNumber : 1,
        parcels: cardPosting.parcels ? cardPosting.parcels : 1,
        amount: cardPosting.amount,
        totalAmount: cardPosting.totalAmount ? cardPosting.totalAmount : cardPosting.amount,
        others: cardPosting.others,
        note: cardPosting.note,
        people: cardPosting.people,
        categoryId: cardPosting.categoryId,
        peopleList: this.peopleList,
        categoriesList: this.categoriesList,
        cardsList: this.cardsList,
        editing: this.editing,
        deleting: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        //this.hideProgress = false;

        if (result.deleting) {

          this.cardPostingsService.delete(result.id).subscribe(
            {
              next: () => {

                this.cardpostings = this.cardpostings.filter(t => t.id! != result.id!);

                this.dataSource = new MatTableDataSource(this.cardpostings);

                this.getTotalAmount();

                this.getCardsPostingsPeople();
                this.getExpensesByCategories();

                //this.hideProgress = true;
              },
              //error: () => this.hideProgress = true
            }
          );
        } else {

          this.cardPostingsService.update(result).subscribe(
            {
              next: () => {

                this.cardpostings.filter(t => t.id === result.id).map(t => {
                  t.date = result.date;
                  t.reference = result.reference;
                  t.cardId = result.cardId;
                  t.position = result.position;
                  t.description = result.description;
                  t.peopleId = result.peopleId;
                  t.parcelNumber = result.parcelNumber;
                  t.parcels = result.parcels;
                  t.amount = result.amount;
                  t.totalAmount = result.totalAmount;
                  t.others = result.others;
                  t.note = result.note;
                  t.people = result.people;
                  t.categoryId = result.categoryId;
                });

                this.cardpostings = [...this.cardpostings.filter(cp => cp.reference === this.reference && cp.cardId === this.cardId)];

                this.dataSource = new MatTableDataSource(this.cardpostings);

                this.getTotalAmount();
                this.getExpensesByCategories();

                this.categoriesList = result.categoriesList;
                this.peopleList = result.peopleList;

                //this.hideProgress = true;
              },
              //error: () => this.hideProgress = true
            }
          );
        }
      }
    });
  }

  cardPostingsPanelClosed() {

    localStorage.setItem('cardPostingsPanelExpanded', 'false');
  }

  cardPostingsPanelOpened() {

    localStorage.setItem('cardPostingsPanelExpanded', 'true');
  }

  peoplePanelClosed() {

    localStorage.setItem('peoplePanelExpanded', 'false');
  }

  peoplePanelOpened() {

    localStorage.setItem('peoplePanelExpanded', 'true');
  }

  categoryPanelClosed() {

    localStorage.setItem('categoryPanelExpanded', 'false');
  }

  categoryPanelOpened() {

    localStorage.setItem('categoryPanelExpanded', 'true');
  }

  receive(cardspostingsdto: CardsPostingsDTO) {

    const dialogRef = this.dialog.open(CardReceiptsDialog, {
      width: '400px',
      data: {
        reference: this.reference,
        cardId: this.cardId,
        peopleId: cardspostingsdto.person,
        amount: cardspostingsdto.remaining,
        change: null,
        toReceive: cardspostingsdto.toReceive,
        received: cardspostingsdto.received,
        remaining: cardspostingsdto.remaining,
        accountsList: this.accountsList
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        Date.prototype.toJSON = function () {
          return moment(this).format("YYYY-MM-DDThh:mm:00.000Z");;
        };

        this.cardReceiptsService.create(result).subscribe(
          {
            next: () => {

              cardspostingsdto.received = result.received + result.amount - result.change;
              cardspostingsdto.remaining = cardspostingsdto.toReceive - cardspostingsdto.received;

              this.getTotalPeople();

              localStorage.setItem('accountIdCardReceipts', result.accountId);

              this.hideProgress = true;
            },
            error: () => this.hideProgress = true
          }
        );
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {

    const previousIndex = this.cardpostings.findIndex(row => row === event.item.data);

    moveItemInArray(this.cardpostings, previousIndex, event.currentIndex);

    this.cardpostings = this.cardpostings.slice();

    let length = this.cardpostings.length;

    this.cardpostings.forEach((cardposting, index) => {

      cardposting.position = length - (index + 1);
    });

    this.dataSource = new MatTableDataSource(this.cardpostings);

    this.cardPostingsService.updatePositions(this.cardpostings).subscribe();
  }

  openFilter() {

    this.filterOpend = !this.filterOpend;

    this.cd.detectChanges();

    if (this.filterOpend) {

      this.filterInput.nativeElement.focus();
    }
  }

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.getFilteredTotalAmount();
  }
}

@Component({
  selector: 'cardpostings-dialog',
  templateUrl: 'cardpostings-dialog.html',
})
export class CardPostingsDialog implements OnInit, AfterViewInit {

  @ViewChild('datepickerinput') datepickerinput!: DatepickerinputComponent;

  disableCheck: boolean = true;
  editing: boolean = false;

  disableGenerateParcelsCheck: boolean = true;
  disableRepeatParcelsCheck: boolean = false;

  cardPostingFormGroup = new FormGroup(
    {
      cardIdFormControl: new FormControl('', Validators.required),
      descriptionFormControl: new FormControl('', Validators.required),
      totalAmountFormControl: new FormControl('', Validators.required),
      amountFormControl: new FormControl('', Validators.required),
      parcelsFormControl: new FormControl('', Validators.min(1)),
      parcelNumberFormControl: new FormControl('', [Validators.required, Validators.min(1)]),
      peopleFormControl: new FormControl(''),
      noteFormControl: new FormControl(''),
      generateParcelsFormControl: new FormControl(''),
      categoryIdFormControl: new FormControl(''),
      repeatParcelsFormControl: new FormControl(''),
      monthsToRepeatFormControl: new FormControl(''),
    });

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CardPostingsDialog>,
    @Inject(MAT_DIALOG_DATA) public cardPosting: CardsPostings,
    private categoryService: CategoryService,
    private peopleService: PeopleService,
    private cd: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {

    if (!this.cardPosting.id) {

      this.cardPosting.date = this.datepickerinput.date.value._d;
    }

    this.cd.detectChanges();
  }

  ngOnInit(): void {

    this.disableCheck =
      this.cardPosting.parcels == undefined ||
      this.cardPosting.parcels == null ||
      this.cardPosting.parcels === 1;

    this.disableGenerateParcelsCheck =
      this.cardPosting.parcels == undefined ||
      this.cardPosting.parcels == null ||
      this.cardPosting.parcels === 1;

    this.cardPosting.monthsToRepeat = 12;
  }

  cancel(): void {

    this.dialogRef.close();
  }

  currentDateChanged(date: Date) {

    this.cardPosting.date = date;
  }

  save(): void {

    this.dialogRef.close(this.cardPosting);
  }

  delete(): void {

    this.cardPosting.deleting = true;

    this.dialogRef.close(this.cardPosting);
  }

  setPeople(): void {

    this.cardPosting.people = this.cardPosting.peopleList?.find(t => t.id == this.cardPosting.peopleId);
  }

  onParcelsChanged(event: any): void {

    this.disableCheck = event.target.value == '' || this.cardPosting.parcels! <= 1;

    if (this.disableCheck) {
      this.cardPosting.generateParcels = false;
    }
    else {
      this.cardPosting.generateParcels = true;
    }

    if (event.target.value == '') {
      this.cardPosting.parcels = 1;
    }

    this.calculateAmount();
  }

  onParcelNumberChanged(event: any): void {

    if (event.target.value == '') {
      this.cardPosting.parcelNumber = 1;
    }
  }

  calculateAmount(): void {

    this.cardPosting.amount = +(this.cardPosting.totalAmount! / this.cardPosting.parcels!).toFixed(2);
  }

  setTitle() {

    return 'Compra - ' + (this.cardPosting.editing ? 'Editar' : 'Incluir');
  }

  addPeople() {

    this.editing = false;

    const dialogRef = this.dialog.open(PeopleComponent, {
      width: '400px',
      data: {
        editing: this.editing
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.peopleService.create(result).subscribe(
          {
            next: people => {

              this.cardPosting.peopleList = [...this.cardPosting.peopleList!, people].sort((a, b) => a.id.localeCompare(b.id));
              this.cardPosting.peopleId = people.id;
            }
          }
        );
      }
    });
  }

  addCategory() {

    this.editing = false;

    const dialogRef = this.dialog.open(CategoryComponent, {
      width: '400px',
      data: {
        editing: this.editing
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.categoryService.create(result).subscribe(
          {
            next: category => {

              this.cardPosting.categoriesList = [...this.cardPosting.categoriesList!, category].sort((a, b) => a.name.localeCompare(b.name));
              this.cardPosting.categoryId = category.id;
            }
          }
        );
      }
    });
  }

  onRepeatParcelsChanged(event: any): void {

    if (this.cardPosting.repeatParcels) {

      this.disableGenerateParcelsCheck = true;
    }
    else {

      if (this.cardPosting.parcels! > 1) {

        this.disableGenerateParcelsCheck = false;
      }
    }
  }
}

@Component({
  selector: 'cardreceipts-dialog',
  templateUrl: 'cardreceipts-dialog.html',
})
export class CardReceiptsDialog implements OnInit, AfterViewInit {

  @ViewChild('datepickerinput') datepickerinput!: DatepickerinputComponent;

  accounts?: Accounts[];

  cardReceiptsFormGroup = new FormGroup({

    dateFormControl: new FormControl(''),
    toReceiveFormControl: new FormControl(''),
    receivedFormControl: new FormControl(''),
    remainingFormControl: new FormControl(''),
    amountFormControl: new FormControl('', Validators.required),
    changeFormControl: new FormControl(''),
    peopleFormControl: new FormControl(''),
    accountFormControl: new FormControl('', Validators.required),
    noteFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<CardReceiptsDialog>,
    @Inject(MAT_DIALOG_DATA) public cardReceipts: CardsReceipts,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.accounts = this.cardReceipts.accountsList;

    if (localStorage.getItem('accountIdCardReceipts') != null) {

      this.cardReceipts.accountId = +(localStorage.getItem('accountIdCardReceipts')!);
    }

    this.cardReceiptsFormGroup.get('toReceiveFormControl')!.disable();
    this.cardReceiptsFormGroup.get('receivedFormControl')!.disable();
    this.cardReceiptsFormGroup.get('remainingFormControl')!.disable();
    this.cardReceiptsFormGroup.get('changeFormControl')!.disable();
  }

  ngAfterViewInit(): void {

    this.cardReceipts.date = this.datepickerinput.date.value._d;
    this.cd.detectChanges();
  }

  cancel(): void {

    this.dialogRef.close();
  }

  currentDateChanged(date: Date) {

    this.cardReceipts.date = date;
  }

  save(): void {

    this.dialogRef.close(this.cardReceipts);
  }

  onAmountChange(): void {

    this.cardReceipts.change = this.cardReceipts.amount > this.cardReceipts.toReceive! ?
      +(this.cardReceipts.amount - this.cardReceipts.remaining!).toFixed(2) :
      0;
  }

  setTitle() {

    return 'Recebimento de Compra';
  }
}
