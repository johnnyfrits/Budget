import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { CardsPostings } from '../../models/cardspostings.model';
import { CardPostingsService } from '../../services/cardpostings/cardpostings.service';
import {
  MatDialog,
} from '@angular/material/dialog';
import { People } from 'src/app/models/people.model';
import { PeopleService } from 'src/app/services/people/people.service';
import { CardsPostingsDTO } from 'src/app/models/cardspostingsdto.model';
import { CardReceiptsService } from 'src/app/services/cardreceipts/cardreceipts.service';
import { Accounts } from 'src/app/models/accounts.model';
import { AccountService } from 'src/app/services/account/account.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Categories } from 'src/app/models/categories.model';
import { CategoryService } from 'src/app/services/category/category.service';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { ExpensesByCategories } from 'src/app/models/expensesbycategories';
import { CardService } from 'src/app/services/card/card.service';
import { Cards } from 'src/app/models/cards.model';
import moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { CardPostingsDialog } from './cardpostings-dialog';
import { CardReceiptsDialog } from './cardreceipts-dialog';

@Component({
  selector: 'app-cardpostings',
  templateUrl: './cardpostings.component.html',
  styleUrls: ['./cardpostings.component.scss'],
})
export class CardPostingsComponent implements OnInit {
  @Input() cardId?: number;
  @Input() reference?: string;

  @ViewChild('input') filterInput!: ElementRef;

  cardpostings!: CardsPostings[];
  cardpostingspeople!: CardsPostingsDTO[];
  expensesByCategories!: ExpensesByCategories[];
  displayedColumns = ['index', 'date', 'description', 'amount'];
  displayedPeopleColumns = [
    'person',
    'toReceive',
    'received',
    'remaining',
    'actions',
  ];
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

  constructor(
    private cardPostingsService: CardPostingsService,
    private cardReceiptsService: CardReceiptsService,
    private peopleService: PeopleService,
    private accountService: AccountService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private cardService: CardService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.darkTheme = document.documentElement.classList.contains('dark-theme');

    this.getTotalAmount();

    this.hideProgress = false;

    this.getLists();

    this.cardPostingsPanelExpanded =
      localStorage.getItem('cardPostingsPanelExpanded') === 'true';
    this.peoplePanelExpanded =
      localStorage.getItem('peoplePanelExpanded') === 'true';
    this.categoryPanelExpanded =
      localStorage.getItem('categoryPanelExpanded') === 'true';
  }

  getLists() {
    this.peopleService.read().subscribe({
      next: (people) => {
        this.peopleList = people;

        this.hideProgress = true;
      },
      error: () => (this.hideProgress = true),
    });

    this.categoryService.read().subscribe({
      next: (categories) => {
        this.categoriesList = categories.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        this.hideProgress = true;
      },
      error: () => (this.hideProgress = true),
    });

    // this.cardService.readWithCardsInvoiceDate(this.reference).subscribe(
    this.cardService.read().subscribe({
      next: (cards) => {
        this.cardsList = cards.sort((a, b) => a.name.localeCompare(b.name));

        this.hideProgress = true;
      },
      error: () => (this.hideProgress = true),
    });

    this.accountService.readNotDisabled().subscribe({
      next: (accounts) => {
        this.accountsList = accounts;

        this.hideProgress = true;
      },
      error: () => (this.hideProgress = true),
    });
  }

  refresh() {
    this.getLists();

    if (this.cardId) {
      this.hideProgress = false;

      this.cardPostingsService.read(this.cardId!, this.reference!).subscribe({
        next: (cardpostings) => {
          this.cardpostings = cardpostings.sort(
            (a, b) => b.position! - a.position!
          );

          this.cardPostingsLength = this.cardpostings.length;

          this.dataSource = new MatTableDataSource(this.cardpostings);

          this.getTotalAmount();

          this.hideProgress = true;
        },
        error: () => (this.hideProgress = true),
      });

      this.getCardsPostingsPeople();
      this.getExpensesByCategories();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['cardId']?.currentValue || changes['reference']?.currentValue) {
    this.refresh();
  }

  getCardsPostingsPeople() {
    this.cardPostingsService
      .readCardsPostingsPeople(this.cardId, this.reference)
      .subscribe({
        next: (cardpostingspeople) => {
          this.cardpostingspeople = cardpostingspeople.filter(
            (t) => t.person !== ''
          );

          this.getTotalPeople();

          this.hideProgress = true;
        },
        error: () => (this.hideProgress = true),
      });
  }

  getExpensesByCategories() {
    this.expenseService
      .readByCategories(this.reference!, this.cardId!)
      .subscribe({
        next: (expensesByCategories) => {
          this.expensesByCategories = expensesByCategories;

          this.getTotalByCategories();

          this.hideProgress = true;
        },
        error: () => (this.hideProgress = true),
      });
  }

  getTotalAmount() {
    this.total = this.cardpostings
      ? this.cardpostings
          .map((t) => t.amount)
          .reduce((acc, value) => acc + value, 0)
      : 0;

    this.myTotal = this.cardpostings
      ? this.cardpostings
          .filter((t) => !t.others)
          .map((t) => t.amount)
          .reduce((acc, value) => acc + value, 0)
      : 0;

    this.othersTotal = this.cardpostings
      ? this.cardpostings
          .filter((t) => t.others)
          .map((t) => t.amount)
          .reduce((acc, value) => acc + value, 0)
      : 0;

    this.percMyTotal =
      (this.total ? (this.myTotal / this.total) * 100 : 0)
        .toFixed(2)
        ?.toString() + '%';
    this.percOthersTotal =
      (this.total ? (this.othersTotal / this.total) * 100 : 0)
        .toFixed(2)
        ?.toString() + '%';

    // this.inTheCycleTotal = this.cardpostings ?
    //   this.cardpostings.filter(t => t.inTheCycle).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    // this.outTheCycleTotal = this.cardpostings ?
    //   this.cardpostings.filter(t => !t.inTheCycle).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    // this.percInTheCycleTotal = (this.total ? this.inTheCycleTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
    // this.percOutTheCycleTotal = (this.total ? this.outTheCycleTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';

    if (this.justMyShopping) {
      this.inTheCycleTotal = this.cardpostings
        ? this.cardpostings
            .filter(
              (t) =>
                !t.others && (t.parcelNumber == 1 || t.parcelNumber == null)
            )
            .map((t) => t.amount)
            .reduce((acc, value) => acc + value, 0)
        : 0;

      this.outTheCycleTotal = this.cardpostings
        ? this.cardpostings
            .filter((t) => !t.others && t.parcelNumber! > 1)
            .map((t) => t.amount)
            .reduce((acc, value) => acc + value, 0)
        : 0;
    } else {
      this.inTheCycleTotal = this.cardpostings
        ? this.cardpostings
            .filter((t) => t.parcelNumber == 1 || t.parcelNumber == null)
            .map((t) => t.amount)
            .reduce((acc, value) => acc + value, 0)
        : 0;

      this.outTheCycleTotal = this.cardpostings
        ? this.cardpostings
            .filter((t) => t.parcelNumber! > 1)
            .map((t) => t.amount)
            .reduce((acc, value) => acc + value, 0)
        : 0;
    }

    this.percInTheCycleTotal =
      (this.total ? (this.inTheCycleTotal / this.total) * 100 : 0)
        .toFixed(2)
        ?.toString() + '%';
    this.percOutTheCycleTotal =
      (this.total ? (this.outTheCycleTotal / this.total) * 100 : 0)
        .toFixed(2)
        ?.toString() + '%';
  }

  getFilteredTotalAmount() {
    this.total = this.dataSource.filteredData
      ? Array(this.dataSource.filteredData)[0]
          .map((t) => t.amount)
          .reduce((acc, value) => acc + value, 0)
      : 0;
  }

  getTotalPeople() {
    this.toReceiveTotalPeople = this.cardpostingspeople
      ? this.cardpostingspeople
          .map((t) => t.toReceive)
          .reduce((acc, value) => acc + value, 0)
      : 0;

    this.receivedTotalPeople = this.cardpostingspeople
      ? this.cardpostingspeople
          .map((t) => t.received)
          .reduce((acc, value) => acc + value, 0)
      : 0;

    this.remainingTotalPeople = this.cardpostingspeople
      ? this.cardpostingspeople
          .map((t) => t.remaining)
          .reduce((acc, value) => acc + value, 0)
      : 0;
  }

  getTotalByCategories() {
    this.amountTotalCategory = this.expensesByCategories
      ? this.expensesByCategories
          .map((t) => t.amount!)
          .reduce((acc, value) => acc + value, 0)
      : 0;

    this.percTotalCategory = this.expensesByCategories
      ? this.expensesByCategories
          .map((t) => t.perc!)
          .reduce((acc, value) => acc + value, 0)
      : 0;
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
        adding: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        //this.hideProgress = false;

        Date.prototype.toJSON = function () {
          return moment(this).format('YYYY-MM-DDThh:mm:00.000Z');
        };

        this.cardPostingsService.create(result).subscribe({
          next: (cardpostings) => {
            if (
              cardpostings.reference === this.reference &&
              cardpostings.cardId === this.cardId
            ) {
              this.cardpostings = [...this.cardpostings, cardpostings].sort(
                (a, b) => b.position! - a.position!
              );

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
        });
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
        totalAmount: cardPosting.totalAmount
          ? cardPosting.totalAmount
          : cardPosting.amount,
        others: cardPosting.others,
        note: cardPosting.note,
        people: cardPosting.people,
        categoryId: cardPosting.categoryId,
        peopleList: this.peopleList,
        categoriesList: this.categoriesList,
        cardsList: this.cardsList,
        editing: this.editing,
        deleting: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        //this.hideProgress = false;

        if (result.deleting) {
          this.cardPostingsService.delete(result.id).subscribe({
            next: () => {
              this.cardpostings = this.cardpostings.filter(
                (t) => t.id! != result.id!
              );

              this.dataSource = new MatTableDataSource(this.cardpostings);

              this.getTotalAmount();

              this.getCardsPostingsPeople();
              this.getExpensesByCategories();

              //this.hideProgress = true;
            },
            //error: () => this.hideProgress = true
          });
        } else {
          this.cardPostingsService.update(result).subscribe({
            next: () => {
              this.cardpostings
                .filter((t) => t.id === result.id)
                .map((t) => {
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

              this.cardpostings = [
                ...this.cardpostings.filter(
                  (cp) =>
                    cp.reference === this.reference && cp.cardId === this.cardId
                ),
              ];

              this.dataSource = new MatTableDataSource(this.cardpostings);

              this.getTotalAmount();
              this.getExpensesByCategories();

              this.categoriesList = result.categoriesList;
              this.peopleList = result.peopleList;

              //this.hideProgress = true;
            },
            //error: () => this.hideProgress = true
          });
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
        amount: cardspostingsdto.remaining == cardspostingsdto.toReceive ? cardspostingsdto.toReceive : null,
        change: null,
        toReceive: cardspostingsdto.toReceive,
        received: cardspostingsdto.received,
        remaining: cardspostingsdto.remaining,
        accountsList: this.accountsList,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.hideProgress = false;

        Date.prototype.toJSON = function () {
          return moment(this).format('YYYY-MM-DDThh:mm:00.000Z');
        };

        this.cardReceiptsService.create(result).subscribe({
          next: () => {
            cardspostingsdto.received =
              result.received + result.amount - result.change;
            cardspostingsdto.remaining =
              cardspostingsdto.toReceive - cardspostingsdto.received;

            this.getTotalPeople();

            localStorage.setItem('accountIdCardReceipts', result.accountId);

            this.hideProgress = true;
          },
          error: () => (this.hideProgress = true),
        });
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.cardpostings.findIndex(
      (row) => row === event.item.data
    );

    moveItemInArray(this.cardpostings, previousIndex, event.currentIndex);

    this.cardpostings = this.cardpostings.slice();

    let length = this.cardpostings.length;

    this.cardpostings.forEach((cardposting, index) => {
      cardposting.position = length - (index + 1);
    });

    this.dataSource = new MatTableDataSource(this.cardpostings);

    this.cardPostingsService.updatePositions(this.cardpostings).subscribe();
  }

  sort() {
    this.cardpostings = this.cardpostings.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0; // Converte a.date para timestamp
      const dateB = b.date ? new Date(b.date).getTime() : 0; // Converte b.date para timestamp

      const positionA = a.position ? Number(a.position) : 0; // Converte a.position para número
      const positionB = b.position ? Number(b.position) : 0; // Converte b.position para número

      const dateComparison = dateB - dateA; // Ordena por data primeiro (decrescente)

      if (dateComparison !== 0) {
        return dateComparison; // Se as datas forem diferentes, retorna a comparação por data
      }

      return positionB - positionA; // Se as datas forem iguais, ordena por posição (decrescente)
    });

    this.cardPostingsLength = this.cardpostings.length;

    this.dataSource = new MatTableDataSource(this.cardpostings);

    let length = this.cardpostings.length;

    this.cardpostings.forEach((cardposting, index) => {
      cardposting.position = length - (index + 1);
    });

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


