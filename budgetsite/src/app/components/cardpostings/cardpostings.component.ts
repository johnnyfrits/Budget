import { CategoryComponent } from './../category/category.component';
import { Component, OnInit, Input, SimpleChanges, Inject } from '@angular/core';
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

@Component({
  selector: 'app-cardpostings',
  templateUrl: './cardpostings.component.html',
  styleUrls: ['./cardpostings.component.scss']
})

export class CardPostingsComponent implements OnInit {

  @Input() cardId?: number;
  @Input() reference?: string;

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
  hideProgress: boolean = true;
  editing: boolean = false;
  peopleList?: People[];
  categoriesList?: Categories[];
  accountsList?: Accounts[];
  cardPostingsPanelExpanded: boolean = false;
  peoplePanelExpanded: boolean = false;
  categoryPanelExpanded: boolean = false;
  checkCard: boolean = false;
  darkTheme?: boolean;

  constructor(private cardPostingsService: CardPostingsService,
    private cardReceiptsService: CardReceiptsService,
    private peopleService: PeopleService,
    private accountService: AccountService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    public dialog: MatDialog) { }

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

    this.accountService.read().subscribe(
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

            this.cardpostings = cardpostings;

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
      this.cardpostings.filter(t => !t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0

    this.othersTotal = this.cardpostings ?
      this.cardpostings.filter(t => t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.percMyTotal = (this.total ? this.myTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';;
    this.percOthersTotal = (this.total ? this.othersTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
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
        this.expensesByCategories.map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.percTotalCategory =
      this.expensesByCategories ?
        this.expensesByCategories.map(t => t.perc).reduce((acc, value) => acc + value, 0) : 0;
  }

  add() {

    this.editing = false;

    const dialogRef = this.dialog.open(CardPostingsDialog, {
      width: '400px',
      data: {
        date: new Date(),
        reference: this.reference,
        cardId: this.cardId,
        parcels: 1,
        parcelNumber: 1,
        peopleList: this.peopleList,
        categoriesList: this.categoriesList,
        editing: this.editing
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        result.position = this.cardpostings.length + 1;

        this.cardPostingsService.create(result).subscribe(
          {
            next: cardpostings => {

              this.cardpostings = [...this.cardpostings, cardpostings];

              this.categoriesList = result.categoriesList;

              this.getTotalAmount();
              this.getCardsPostingsPeople();
              this.getExpensesByCategories();

              this.hideProgress = true;
            },
            error: () => this.hideProgress = true
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
        editing: this.editing,
        deleting: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        if (result.deleting) {

          this.cardPostingsService.delete(result.id).subscribe(
            {
              next: () => {

                this.cardpostings = this.cardpostings.filter(t => t.id! != result.id!);

                this.getTotalAmount();

                this.getCardsPostingsPeople();
                this.getExpensesByCategories();

                this.hideProgress = true;
              },
              error: () => this.hideProgress = true
            }
          );
        } else {

          this.cardPostingsService.update(result).subscribe(
            {
              next: () => {

                this.cardpostings.filter(t => t.id === result.id).map(t => {
                  t.date = result.date;
                  t.reference = result.reference;
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

                this.getTotalAmount();
                this.getExpensesByCategories();

                this.categoriesList = result.categoriesList;

                this.hideProgress = true;
              },
              error: () => this.hideProgress = true
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
        date: new Date(),
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

        this.cardReceiptsService.create(result).subscribe(
          {
            next: () => {

              cardspostingsdto.received = result.received + result.amount - result.change;
              cardspostingsdto.remaining = cardspostingsdto.toReceive - cardspostingsdto.received;

              this.getTotalPeople();

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

    this.cardpostings.forEach((cardposting, index) => {

      cardposting.position = index + 1;
    });

    this.cardPostingsService.updatePositions(this.cardpostings).subscribe();
  }
}

@Component({
  selector: 'cardpostings-dialog',
  templateUrl: 'cardpostings-dialog.html',
})
export class CardPostingsDialog implements OnInit {

  disableCheck: boolean = true;
  editing: boolean = false;

  cardPostingFormGroup = new FormGroup(
    {
      descriptionFormControl: new FormControl('', Validators.required),
      totalAmountFormControl: new FormControl('', Validators.required),
      amountFormControl: new FormControl('', Validators.required),
      parcelsFormControl: new FormControl('', Validators.min(1)),
      parcelNumberFormControl: new FormControl('', [Validators.required, Validators.min(1)]),
      peopleFormControl: new FormControl(''),
      noteFormControl: new FormControl(''),
      generateParcelsFormControl: new FormControl(''),
      categoryIdFormControl: new FormControl(''),
    });

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CardPostingsDialog>,
    @Inject(MAT_DIALOG_DATA) public cardPosting: CardsPostings,
    private categoryService: CategoryService) { }

  ngOnInit(): void {

    this.disableCheck =
      this.cardPosting.parcels == undefined ||
      this.cardPosting.parcels == null ||
      this.cardPosting.parcels === 1;
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
}

@Component({
  selector: 'cardreceipts-dialog',
  templateUrl: 'cardreceipts-dialog.html',
})
export class CardReceiptsDialog implements OnInit {

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

  constructor(public dialogRef: MatDialogRef<CardReceiptsDialog>,
    @Inject(MAT_DIALOG_DATA) public cardReceipts: CardsReceipts) { }

  ngOnInit(): void {

    this.accounts = this.cardReceipts.accountsList;

    this.cardReceiptsFormGroup.get('toReceiveFormControl')!.disable();
    this.cardReceiptsFormGroup.get('receivedFormControl')!.disable();
    this.cardReceiptsFormGroup.get('remainingFormControl')!.disable();
    this.cardReceiptsFormGroup.get('changeFormControl')!.disable();
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
