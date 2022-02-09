import { Observable } from 'rxjs';
import { BudgetTotals } from './../../models/budgettotals';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClipboardService } from 'ngx-clipboard';
import { Messenger } from 'src/app/common/messenger';
import { Accounts } from 'src/app/models/accounts.model';
import { Cards } from 'src/app/models/cards.model';
import { CardsPostingsDTO } from 'src/app/models/cardspostingsdto.model';
import { Expenses } from 'src/app/models/expenses.model';
import { Incomes } from 'src/app/models/incomes.model';
import { IncomesTypes } from 'src/app/models/types.model';
import { AccountService } from 'src/app/services/account/account.service';
import { CardService } from 'src/app/services/card/card.service';
import { CardPostingsService } from 'src/app/services/cardpostings/cardpostings.service';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { IncomeService } from 'src/app/services/income/income.service';
import { AccountsPostings } from 'src/app/models/accountspostings.model';
import { AccountPostingsService } from 'src/app/services/accountpostings/accountpostings.service';
import { Scroll } from './../../common/scroll';

import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { BudgetService } from 'src/app/services/budget/budget.service';
import { Categories } from 'src/app/models/categories.model';
import { CategoryService } from 'src/app/services/category/category.service';
import { CategoryComponent } from '../category/category.component';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit, AfterViewInit {

  reference?: string;
  referenceHead?: string;

  expenses!: Expenses[];
  incomes!: Incomes[];
  budgetTotals!: BudgetTotals;
  cardpostingspeople!: CardsPostingsDTO[];
  displayedExpensesColumns = ['description', 'toPay', 'paid', 'remaining', 'actions'];
  displayedIncomesColumns = ['description', 'toReceive', 'received', 'remaining', 'actions'];
  displayedPeopleColumns = ['person', 'toReceive', 'received', 'remaining', 'actions'];
  toPayTotal: number = 0;
  paidTotal: number = 0;
  expensesRemainingTotal?: number = 0;
  expectedBalance: number = 0;
  toReceiveTotal: number = 0;
  receivedTotal: number = 0;
  incomesRemainingTotal: number = 0;
  toReceiveTotalPeople: number = 0;
  receivedTotalPeople: number = 0;
  remainingTotalPeople: number = 0;
  monthName: string = "";
  hideExpensesProgress: boolean = true;
  hideIncomesProgress: boolean = true;
  hidePeopleProgress: boolean = true;
  budgetPanelExpanded: boolean = false;
  expensesPanelExpanded: boolean = false;
  incomesPanelExpanded: boolean = false;
  peoplePanelExpanded: boolean = false;
  editing: boolean = false;
  cardsList?: Cards[];
  categoriesList?: Categories[];
  accountsList?: Accounts[];
  typesList = [
    {
      id: 'R',
      description: 'Recebimento'
    },
    // {
    //   id: 'P',
    //   description: 'Pagamento'
    // },
    {
      id: 'Y',
      description: 'Rendimento'
    },
    {
      id: 'C',
      description: 'Troco'
    },
  ];

  constructor(private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private cardPostingsService: CardPostingsService,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private cardService: CardService,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private messenger: Messenger,
    private clipboardService: ClipboardService,
    private accountPostingsService: AccountPostingsService,
    private budget: BudgetService,
    private scroll: Scroll
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    this.cd.detectChanges();
  }

  referenceChanges(reference: string) {

    this.reference = reference;

    this.referenceHead = this.reference.substr(4, 2) + "/" + this.reference.substr(0, 4);

    this.refresh();
  }

  refresh() {

    this.hideExpensesProgress = false;
    this.hideIncomesProgress = false;
    this.hidePeopleProgress = false;

    this.cardService.read().subscribe(
      {
        next: cards => {

          this.cardsList = cards;
        },
        error: () => {
          this.hideExpensesProgress = false;
          this.hideIncomesProgress = false;
          this.hidePeopleProgress = false;
        }
      }
    );

    this.categoryService.read().subscribe(
      {
        next: categories => {

          this.categoriesList = categories.sort((a, b) => a.name.localeCompare(b.name));
        },
        error: () => {
          this.hideExpensesProgress = false;
          this.hideIncomesProgress = false;
          this.hidePeopleProgress = false;
        }
      }
    );

    this.accountService.read().subscribe(
      {
        next: accounts => {

          this.accountsList = accounts;

          this.hideExpensesProgress = true;
          this.hideIncomesProgress = true;
          this.hidePeopleProgress = true;
        },
        error: () => {
          this.hideExpensesProgress = true;
          this.hideIncomesProgress = true;
          this.hidePeopleProgress = true;
        }
      }
    );

    this.getData();

    this.budgetPanelExpanded = localStorage.getItem('budgetPanelExpanded') === 'true';
    this.expensesPanelExpanded = localStorage.getItem('expensesPanelExpanded') === 'true';
    this.incomesPanelExpanded = localStorage.getItem('incomesPanelExpanded') === 'true';
    this.peoplePanelExpanded = localStorage.getItem('peoplePanelExpanded') === 'true';
  }

  getData() {

    if (this.reference) {

      this.hideExpensesProgress = false;
      this.hideIncomesProgress = false;
      this.hidePeopleProgress = false;

      this.expenses = [];
      this.incomes = [];
      this.cardpostingspeople = [];

      this.getExpenses();
      this.getIncomes();
      this.getCardsPostingsPeople();
      this.getBudgetTotals();
    }
  }

  getExpenses() {

    this.expenseService.read(this.reference!).subscribe(
      {
        next: expenses => {

          this.expenses = expenses;

          this.getExpensesTotals();
        },
        error: () => {

          this.getExpensesTotals();
        }
      }
    );
  }

  getIncomes() {

    this.incomeService.read(this.reference!).subscribe(
      {
        next: incomes => {

          this.incomes = incomes;

          this.getIncomesTotals();
        },
        error: () => {

          this.getIncomesTotals();
        }
      }
    );
  }

  getBudgetTotals() {

    this.budget.getBudgetTotals(this.reference!).subscribe(
      {
        next: budgetTotals => {

          this.budgetTotals = budgetTotals;
        }
      }
    );
  }

  getCardsPostingsPeople() {

    this.cardPostingsService.readCardsPostingsPeople(0, this.reference!).subscribe(
      {
        next: cardpostingspeople => {

          this.cardpostingspeople = cardpostingspeople.sort((a, b) => a.person.localeCompare(b.person)).filter(t => t.person !== '');

          this.getTotalPeople();

          this.hidePeopleProgress = true;
        },
        error: () => this.hidePeopleProgress = true
      }
    );
  }

  getIncomesTotals() {

    this.toReceiveTotal =
      this.incomes ?
        this.incomes.map(t => t.toReceive).reduce((acc, value) => acc + value, 0) :
        0;

    this.receivedTotal =
      this.incomes ?
        this.incomes.map(t => t.received).reduce((acc, value) => acc + value, 0) :
        0;

    this.incomesRemainingTotal =
      this.incomes ?
        this.incomes.map(t => t.remaining).reduce((acc, value) => acc + value, 0) :
        0;

    this.expectedBalance = this.toReceiveTotal - this.toPayTotal;

    this.hideIncomesProgress = true
  }

  getExpensesTotals() {

    this.toPayTotal =
      this.expenses ?
        this.expenses.map(t => t.toPay).reduce((acc, value) => acc + value, 0) :
        0;

    this.paidTotal =
      this.expenses ?
        this.expenses.map(t => t.paid).reduce((acc, value) => acc + value, 0) :
        0;

    this.expensesRemainingTotal =
      this.expenses ?
        this.expenses.map(t => t.remaining).reduce((acc, value) => acc! + value!, 0) :
        0;

    this.expectedBalance = this.toReceiveTotal - this.toPayTotal;

    this.hideExpensesProgress = true;
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

  addExpense(): void {

    this.editing = false;

    const dialogRef = this.dialog.open(ExpensesDialog, {
      width: '400px',
      data: {
        userId: 1,
        reference: this.reference,
        editing: this.editing,
        cardsList: this.cardsList,
        categoriesList: this.categoriesList,
        parcels: 1,
        parcelNumber: 1
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideExpensesProgress = false;

        result.position = this.expenses.length + 1;

        this.expenseService.create(result).subscribe(
          {
            next: expenses => {

              expenses.remaining = expenses.toPay - expenses.paid;

              //this.expenses.push(expenses); não funcionou assim como nas outras funções, acredito que seja por causa do Expension Panel (mat-expansion-panel)

              this.expenses = [...this.expenses, expenses]; // somente funcionou assim

              this.categoriesList = result.categoriesList;

              this.getExpensesTotals();
            },
            error: () => this.hideExpensesProgress = true
          }
        );
      }
    });
  }

  editOrDeleteExpense(expense: Expenses, event: any): void {

    if (event.target.textContent! == "more_vert") {

      return;
    }

    this.editing = true;

    const dialogRef = this.dialog.open(ExpensesDialog, {
      width: '400px',
      data: {
        id: expense.id,
        userId: expense.userId,
        cardId: expense.cardId,
        categoryId: expense.categoryId,
        reference: expense.reference,
        position: expense.position,
        description: expense.description,
        toPay: expense.toPay,
        totalToPay: expense.totalToPay,
        paid: expense.paid,
        remaining: expense.remaining,
        note: expense.note,
        dueDate: expense.dueDate,
        parcelNumber: expense.parcelNumber,
        parcels: expense.parcels,
        editing: this.editing,
        deleting: false,
        cardsList: this.cardsList,
        categoriesList: this.categoriesList
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideExpensesProgress = false;

        if (result.deleting) {

          this.expenseService.delete(result.id).subscribe(
            {
              next: () => {

                this.expenses = this.expenses.filter(t => t.id! != result.id!);

                this.getExpensesTotals();
              },
              error: () => this.hideExpensesProgress = true
            }
          );
        } else {

          this.expenseService.update(result).subscribe(
            {
              next: () => {

                this.expenses.filter(t => t.id === result.id).map(t => {

                  t.id = result.id;
                  t.userId = result.userId;
                  t.reference = result.reference;
                  t.position = result.position;
                  t.description = result.description;
                  t.toPay = result.toPay;
                  t.totalToPay = result.toPay;
                  t.paid = result.paid;
                  t.remaining = result.remaining;
                  t.note = result.note;
                  t.cardId = result.cardId;
                  t.categoryId = result.categoryId;
                  t.dueDate = result.dueDate;
                  t.parcelNumber = result.parcelNumber;
                  t.parcels = result.parcels;
                });

                this.categoriesList = result.categoriesList;

                this.getExpensesTotals();

                if (localStorage.getItem('lastElementIdBudget') !== null) {
                  {
                    this.scroll.scrollTo(localStorage.getItem('lastElementIdBudget'));
                  }
                }
              },
              error: () => this.hideExpensesProgress = true
            }
          );
        }
      }
    });
  }

  addIncome(): void {

    this.editing = false;

    const dialogRef = this.dialog.open(IncomesDialog, {
      width: '400px',
      data: {
        userId: 1,
        reference: this.reference,
        editing: this.editing,
        cardsList: this.cardsList,
        accountsList: this.accountsList,
        typesList: this.typesList
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideIncomesProgress = false;

        result.position = this.incomes.length + 1;

        this.incomeService.create(result).subscribe(
          {
            next: incomes => {

              //this.incomes.push(incomes); não funcionou assim como nas outras funções, acredito que seja por causa do Expension Panel (mat-expansion-panel)

              incomes.remaining = incomes.toReceive - incomes.received;

              this.incomes = [...this.incomes, incomes]; // somente funcionou assim

              this.getIncomesTotals();
            },
            error: () => this.hideIncomesProgress = true
          }
        );
      }
    });
  }

  editOrDeleteIncome(income: Incomes, event: any) {

    if (event.target.textContent! == "more_vert") {

      return;
    }

    this.editing = true;

    const dialogRef = this.dialog.open(IncomesDialog, {
      width: '400px',
      data: {
        id: income.id,
        userId: income.userId,
        cardId: income.cardId,
        accountId: income.accountId,
        reference: income.reference,
        position: income.position,
        description: income.description,
        toReceive: income.toReceive,
        received: income.received,
        remaining: income.remaining,
        note: income.note,
        type: income.type,
        editing: this.editing,
        deleting: false,
        cardsList: this.cardsList,
        accountsList: this.accountsList,
        typesList: this.typesList
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideIncomesProgress = false;

        if (result.deleting) {

          this.incomeService.delete(result.id).subscribe(
            {
              next: () => {

                this.incomes = this.incomes.filter(t => t.id! != result.id!);

                this.getIncomesTotals();
              },
              error: () => this.hideIncomesProgress = true
            }
          );
        } else {

          this.incomeService.update(result).subscribe(
            {
              next: () => {

                this.incomes.filter(t => t.id === result.id).map(t => {

                  t.id = result.id;
                  t.userId = result.userId;
                  t.reference = result.reference;
                  t.position = result.position;
                  t.description = result.description;
                  t.toReceive = result.toReceive;
                  t.received = result.received;
                  t.remaining = result.remaining;
                  t.note = result.note;
                  t.cardId = result.cardId;
                  t.accountId = result.accountId;
                  t.type = result.type;
                });

                this.getIncomesTotals();
              },
              error: () => this.hideIncomesProgress = true
            }
          );
        }
      }
    });
  }

  budgetPanelClosed() {

    localStorage.setItem('budgetPanelExpanded', 'false');
  }

  budgetPanelOpened() {

    localStorage.setItem('budgetPanelExpanded', 'true');
  }

  expensesPanelClosed() {

    localStorage.setItem('expensesPanelExpanded', 'false');
  }

  expensesPanelOpened() {

    localStorage.setItem('expensesPanelExpanded', 'true');
  }

  incomesPanelClosed() {

    localStorage.setItem('incomesPanelExpanded', 'false');
  }

  peoplePanelClosed() {

    localStorage.setItem('peoplePanelExpanded', 'false');
  }

  incomesPanelOpened() {

    localStorage.setItem('incomesPanelExpanded', 'true');
  }

  peoplePanelOpened() {

    localStorage.setItem('peoplePanelExpanded', 'true');
  }

  pay(expense: Expenses) {

    const dialogRef = this.dialog.open(PaymentReceiveDialog, {
      width: '400px',
      data: {
        date: new Date(),
        reference: expense.reference,
        description: 'Pag. ' + expense.description,
        amount: expense.remaining,
        note: expense.note,
        type: 'P',
        expenseId: expense.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideExpensesProgress = false;

        result.amount = result.amount * (result.type === 'P' ? -1 : 1);

        this.accountPostingsService.create(result).subscribe({

          next: () => {

            expense.paid = +(expense.paid + Math.abs(result.amount)).toFixed(2);
            expense.remaining = +(expense.toPay - expense.paid).toFixed(2);

            this.getExpensesTotals();

            if (result.type === 'P') {

              localStorage.setItem('accountIdPayExpense', result.accountId);
            }
            else if (result.type === 'R') {

              localStorage.setItem('accountIdReceiveIncome', result.accountId);
            }

            this.hideExpensesProgress = true
          },
          error: () => this.hideExpensesProgress = true
        });
      }
    });
  }

  receive(income: Incomes) {

    const dialogRef = this.dialog.open(PaymentReceiveDialog, {
      width: '400px',
      data: {
        date: new Date(),
        reference: income.reference,
        description: 'Rec. ' + income.description,
        amount: income.remaining,
        note: income.note,
        type: 'R',
        incomeId: income.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideExpensesProgress = false;

        result.amount = result.amount * (result.type === 'P' ? -1 : 1);

        this.accountPostingsService.create(result).subscribe({

          next: () => {

            income.received = +(income.received + Math.abs(result.amount)).toFixed(2);
            income.remaining = +(income.toReceive - income.received).toFixed(2);

            this.getIncomesTotals();

            localStorage.setItem('accountIdReceiveIncome', result.accountId);

            this.hideExpensesProgress = true
          },
          error: () => this.hideExpensesProgress = true
        });
      }
    });
  }

  charge(cpp: CardsPostingsDTO) {

    let message = "";

    let hour = new Date().getHours();

    if (hour < 12) {

      message = "Bom dia!";

    } else if (hour < 18) {

      message = "Boa tarde!";

    } else {

      message = "Boa noite!";
    }

    this.cardPostingsService.readCardsPostingsByPeople(cpp.person, this.reference!).subscribe(
      {
        next: cardpostings => {

          message += "\nSeguem os valores deste mês:";
          let month = Number(this.reference?.substring(4, 6));
          message += "\n\n*Vencimento 01/" + (month + 1).toString().padStart(2, '0') + "*\n\n";
          message += "```";

          cardpostings.forEach(cp => {

            //x.toLocaleString('pt-br', {style:'currency', currency:'BRL'}).replace('R$ ', '')

            let strAmount = cp.amount.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }).replace('R$ ', '').padStart(8, ' ');

            let strParcels = cp.parcels! > 1 ? " (" + cp.parcelNumber! + "/" + cp.parcels! + ")" : "";

            message += strAmount + " " + cp.description + strParcels + "\n";
          });

          let tax = 3;

          message += tax.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }).replace('R$ ', '').padStart(8, ' ') + " Tarifa de Serviços\n";

          let received = cpp.received > 0 ?
            ("-" + cpp.received.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }).replace('R$ ', '')).padStart(8, ' ') + " (Valor pago)\n" :
            "";

          message += received;

          let total = (cpp.remaining + tax).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

          message += "----------------------------```\n";
          message += "*Total: " + total + "*";

          this.clipboardService.copy(message);

          this.messenger.message("Mensagen copiada para área de transferência.");
        }
      }
    );
  }

  dropExpenses(event: CdkDragDrop<any[]>) {

    const previousIndex = this.expenses.findIndex(row => row === event.item.data);

    moveItemInArray(this.expenses, previousIndex, event.currentIndex);

    this.expenses = this.expenses.slice();

    this.expenses.forEach((expense, index) => {

      expense.position = index + 1;

      this.expenseService.update(expense).subscribe();
    });
  }

  dropIncomes(event: CdkDragDrop<any[]>) {

    const previousIndex = this.incomes.findIndex(row => row === event.item.data);

    moveItemInArray(this.incomes, previousIndex, event.currentIndex);

    this.incomes = this.incomes.slice();

    this.incomes.forEach((expense, index) => {

      expense.position = index + 1;

      this.incomeService.update(expense).subscribe();
    });
  }
}

@Component({
  selector: 'expenses-dialog',
  templateUrl: 'expenses-dialog.html',
})
export class ExpensesDialog implements OnInit {

  cards?: Cards[];
  editing: boolean = false;

  disableGenerateParcelsCheck: boolean = true;
  disableRepeatParcelsCheck: boolean = false;

  expensesFormGroup = new FormGroup({

    descriptionFormControl: new FormControl('', Validators.required),
    toPayFormControl: new FormControl('', Validators.required),
    paidFormControl: new FormControl(''),
    remainingFormControl: new FormControl(''),
    noteFormControl: new FormControl(''),
    cardIdFormControl: new FormControl(''),
    categoryIdFormControl: new FormControl(''),
    dueDateFormControl: new FormControl(''),
    parcelNumberFormControl: new FormControl(''),
    parcelsFormControl: new FormControl(''),
    totalToPayFormControl: new FormControl('', Validators.required),
    generateParcelsFormControl: new FormControl(''),
    repeatParcelsFormControl: new FormControl(''),
    monthsToRepeatFormControl: new FormControl(''),
  });

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ExpensesDialog>,
    @Inject(MAT_DIALOG_DATA) public expenses: Expenses) {
  }

  ngOnInit(): void {

    this.cards = this.expenses.cardsList;

    this.expenses.parcelNumber = this.expenses.parcelNumber ?? 1;
    this.expenses.parcels = this.expenses.parcels ?? 1;

    this.disableGenerateParcelsCheck =
      this.expenses.parcels == undefined ||
      this.expenses.parcels == null ||
      this.expenses.parcels === 1;

    this.expenses.monthsToRepeat = 12;
  }

  cancel(): void {

    this.dialogRef.close();
  }

  save(): void {

    this.dialogRef.close(this.expenses);
  }

  delete(): void {

    this.expenses.deleting = true;

    this.dialogRef.close(this.expenses);
  }

  setCard(): void {

    this.expenses.card = this.expenses.cardsList?.find(t => t.id == this.expenses.cardId);
  }

  calculateRemaining(): void {

    this.expenses.paid = (this.expenses.paid ?? 0) > this.expenses.toPay ? this.expenses.toPay : this.expenses.paid;
    this.expenses.remaining = +(this.expenses.toPay - (this.expenses.paid ?? 0)).toFixed(2);
  }

  onParcelNumberChanged(event: any): void {
  }

  calculateToPay(): void {

    this.expenses.toPay = +(this.expenses.totalToPay / this.expenses.parcels!).toFixed(2);

    this.calculateRemaining();
  }

  onParcelsChanged(event: any): void {

    this.disableGenerateParcelsCheck = event.target.value == '' || this.expenses.parcels! <= 1;

    if (this.disableGenerateParcelsCheck) {
      this.expenses.generateParcels = false;
    }

    if (event.target.value == '') {
      this.expenses.parcels = 1;
    }

    this.calculateToPay();
  }

  onGenerateParcelsChanged(event: any): void {

    if (this.expenses.generateParcels) {

      this.disableRepeatParcelsCheck = true;
      this.expensesFormGroup.get('monthsToRepeatFormControl')!.disable();
    }
    else {

      this.disableRepeatParcelsCheck = false;
      this.expensesFormGroup.get('monthsToRepeatFormControl')!.enable();
    }
  }

  onRepeatParcelsChanged(event: any): void {

    if (this.expenses.repeatParcels) {

      this.disableGenerateParcelsCheck = true;
    }
    else {

      if (this.expenses.parcels! > 1) {

        this.disableGenerateParcelsCheck = false;
      }
    }
  }

  setTitle() {

    return 'Despesa - ' + (this.expenses.editing ? 'Editar' : 'Incluir');
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

        this.expenses.categoryId = result.id;
        this.expenses.categoriesList = [...this.expenses.categoriesList!, result].sort((a, b) => a.name.localeCompare(b.name));
      }
    });
  }
}

@Component({
  selector: 'incomes-dialog',
  templateUrl: 'incomes-dialog.html',
})
export class IncomesDialog implements OnInit {

  cards?: Cards[];
  accounts?: Accounts[];
  types?: IncomesTypes[];

  incomesFormGroup = new FormGroup({

    descriptionFormControl: new FormControl('', Validators.required),
    toReceiveFormControl: new FormControl('', Validators.required),
    receivedFormControl: new FormControl(''),
    remainingFormControl: new FormControl(''),
    noteFormControl: new FormControl(''),
    cardIdFormControl: new FormControl(''),
    accountIdFormControl: new FormControl(''),
    typeFormControl: new FormControl(''),
    repeatIncomeFormControl: new FormControl(''),
    monthsToRepeatFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<IncomesDialog>,
    @Inject(MAT_DIALOG_DATA) public incomes: Incomes) {
  }

  ngOnInit(): void {

    this.cards = this.incomes.cardsList;
    this.accounts = this.incomes.accountsList;
    this.types = this.incomes.typesList;

    this.incomes.monthsToRepeat = 12;
  }

  cancel(): void {

    this.dialogRef.close();
  }

  save(): void {

    this.dialogRef.close(this.incomes);
  }

  delete(): void {

    this.incomes.deleting = true;

    this.dialogRef.close(this.incomes);
  }

  setCard(): void {

    this.incomes.card = this.incomes.cardsList?.find(t => t.id == this.incomes.cardId);
  }

  calculateRemaining(): void {

    this.incomes.received = (this.incomes.received ?? 0) > this.incomes.toReceive ? this.incomes.toReceive : this.incomes.received;
    this.incomes.remaining = +(this.incomes.toReceive - (this.incomes.received ?? 0)).toFixed(2);
  }

  setTitle() {

    return 'Receita - ' + (this.incomes.editing ? 'Editar' : 'Incluir');
  }
}

@Component({
  selector: 'payment-receive-dialog',
  templateUrl: 'payment-receive-dialog.html',
})
export class PaymentReceiveDialog implements OnInit {

  accountsList?: Accounts[];

  accountPostingFormGroup = new FormGroup({

    descriptionFormControl: new FormControl('', Validators.required),
    amountFormControl: new FormControl('', Validators.required),
    accountFormControl: new FormControl('', Validators.required),
    noteFormControl: new FormControl(''),
    typeFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<PaymentReceiveDialog>,
    @Inject(MAT_DIALOG_DATA) public accountPosting: AccountsPostings,
    private accountService: AccountService) {
  }

  ngOnInit(): void {

    this.accountService.read().subscribe(
      {
        next: accounts => {

          this.accountsList = accounts;

          if (this.accountPosting.type == 'P' && localStorage.getItem('accountIdPayExpense') != null) {

            this.accountPosting.accountId = +(localStorage.getItem('accountIdPayExpense')!);
          }
          else if (this.accountPosting.type == 'R' && localStorage.getItem('accountIdReceiveIncome') != null) {

            this.accountPosting.accountId = +(localStorage.getItem('accountIdReceiveIncome')!);
          }
        }
      }
    );
  }

  cancel(): void {

    this.dialogRef.close();
  }

  currentDateChanged(date: Date) {

    this.accountPosting.date = date;
  }

  save(): void {

    this.dialogRef.close(this.accountPosting);
  }

  delete(): void {

    this.accountPosting.deleting = true;

    this.dialogRef.close(this.accountPosting);
  }

  onTypeChange(): void {

    if (this.accountPosting.type === 'Y') {

      this.accountPosting.description = 'Rendimento';
    }
    else if (this.accountPosting.type === 'C') {

      this.accountPosting.description = 'Troco';
    }
    else {
      if (this.accountPosting.description === 'Rendimento' ||
        this.accountPosting.description === 'Troco') {

        this.accountPosting.description = '';
      }
    }
  }

  setTitle() {

    return this.accountPosting.description.replace('Pag.', 'Pagar');
  }
}