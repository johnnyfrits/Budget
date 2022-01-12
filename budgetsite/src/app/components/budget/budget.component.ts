import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Accounts } from 'src/app/models/accounts.model';
import { Cards } from 'src/app/models/cards.model';
import { Expenses } from 'src/app/models/expenses.model';
import { Incomes } from 'src/app/models/incomes.model';
import { IncomesTypes } from 'src/app/models/types.model';
import { AccountService } from 'src/app/services/account/account.service';
import { CardService } from 'src/app/services/card/card.service';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { IncomeService } from 'src/app/services/income/income.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit, AfterViewInit {

  reference?: string;
  referenceHead?: string;

  expenses!: Expenses[];
  incomes!: Incomes[];
  displayedExpensesColumns = ['description', 'toPay', 'paid', 'remaining'];
  displayedIncomesColumns = ['description', 'toReceive', 'received', 'remaining'];
  toPayTotal: number = 0;
  paidTotal: number = 0;
  expensesRemainingTotal?: number = 0;
  expectedBalance: number = 0;
  toReceiveTotal: number = 0;
  receivedTotal: number = 0;
  incomesRemainingTotal: number = 0;
  monthName: string = "";
  hideExpensesProgress: boolean = true;
  hideIncomesProgress: boolean = true;
  expensesPanelExpanded: boolean = false;
  incomesPanelExpanded: boolean = false;
  editing: boolean = false;
  cardsList?: Cards[];
  accountsList?: Accounts[];
  typesList = [
    {
      id: 'R',
      description: 'Recebimento'
    },
    {
      id: 'P',
      description: 'Pagamento'
    },
    {
      id: 'Y',
      description: 'Rendimento'
    },
    {
      id: 'C',
      description: 'Troco'
    },
  ];

  constructor(private expenseService: ExpenseService, private incomeService: IncomeService, private cd: ChangeDetectorRef,
    public dialog: MatDialog, private cardService: CardService, private accountService: AccountService) { }

  ngOnInit(): void {

    this.hideExpensesProgress = false;
    this.hideIncomesProgress = false;

    this.cardService.read().subscribe(
      {
        next: cards => {

          this.cardsList = cards;
        },
        error: () => {
          this.hideExpensesProgress = false;
          this.hideIncomesProgress = false;
        }
      }
    );

    this.accountService.read().subscribe(
      {
        next: accounts => {

          this.accountsList = accounts;

          this.hideExpensesProgress = false;
          this.hideIncomesProgress = false;
        },
        error: () => {
          this.hideExpensesProgress = false;
          this.hideIncomesProgress = false;
        }
      }
    );

    this.expensesPanelExpanded = localStorage.getItem('expensesPanelExpanded') === 'true';
    this.incomesPanelExpanded = localStorage.getItem('incomesPanelExpanded') === 'true';
  }

  ngAfterViewInit(): void {

    this.cd.detectChanges();
  }

  referenceChanges(reference: string) {

    this.reference = reference;

    this.referenceHead = this.reference.substr(4, 2) + "/" + this.reference.substr(0, 4);

    this.getData();
  }

  getData() {

    if (this.reference) {

      this.hideExpensesProgress = false;
      this.hideIncomesProgress = false;

      this.expenses = [];
      this.incomes = [];

      this.getExpenses();
      this.getIncomes();
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

  addExpense(): void {

    this.editing = false;

    const dialogRef = this.dialog.open(ExpensesDialog, {
      width: '400px',
      data: {
        userId: 1,
        reference: this.reference,
        editing: this.editing,
        cardsList: this.cardsList
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideExpensesProgress = false;

        result.position = this.expenses.length + 1;

        this.expenseService.create(result).subscribe(
          {
            next: expenses => {

              //this.expenses.push(expenses); não funcionou assim como nas outras funções, acredito que seja por causa do Expension Panel (mat-expansion-panel)

              this.expenses = [...this.expenses, expenses]; // somente funcionou assim

              this.getExpensesTotals();
            },
            error: () => this.hideExpensesProgress = true
          }
        );
      }
    });
  }

  editOrDeleteExpense(expense: Expenses) {

    this.editing = true;

    const dialogRef = this.dialog.open(ExpensesDialog, {
      width: '400px',
      data: {
        id: expense.id,
        userId: expense.userId,
        cardId: expense.cardId,
        reference: expense.reference,
        position: expense.position,
        description: expense.description,
        toPay: expense.toPay,
        paid: expense.paid,
        remaining: expense.remaining,
        note: expense.note,
        editing: this.editing,
        deleting: false,
        cardsList: this.cardsList
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
                  t.paid = result.paid;
                  t.remaining = result.remaining;
                  t.note = result.note;
                  t.cardId = result.cardId;
                });

                this.getExpensesTotals();
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

              this.incomes = [...this.incomes, incomes]; // somente funcionou assim

              this.getIncomesTotals();
            },
            error: () => this.hideIncomesProgress = true
          }
        );
      }
    });
  }

  editOrDeleteIncome(income: Incomes) {

    this.editing = true;

    debugger;

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

          debugger;

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

  expensesPanelClosed() {

    localStorage.setItem('expensesPanelExpanded', 'false');
  }

  expensesPanelOpened() {

    localStorage.setItem('expensesPanelExpanded', 'true');
  }

  incomesPanelClosed() {

    localStorage.setItem('incomesPanelExpanded', 'false');
  }

  incomesPanelOpened() {

    localStorage.setItem('incomesPanelExpanded', 'true');
  }
}

@Component({
  selector: 'expenses-dialog',
  templateUrl: 'expenses-dialog.html',
})
export class ExpensesDialog implements OnInit {

  cards?: Cards[];

  expensesFormGroup = new FormGroup({

    descriptionFormControl: new FormControl('', Validators.required),
    toPayFormControl: new FormControl('', Validators.required),
    paidFormControl: new FormControl(''),
    remainingFormControl: new FormControl(''),
    noteFormControl: new FormControl(''),
    cardIdFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<ExpensesDialog>,
    @Inject(MAT_DIALOG_DATA) public expenses: Expenses) {
  }

  ngOnInit(): void {

    this.cards = this.expenses.cardsList;

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

    this.expenses.remaining = this.expenses.toPay - this.expenses.paid;
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
  });

  constructor(
    public dialogRef: MatDialogRef<IncomesDialog>,
    @Inject(MAT_DIALOG_DATA) public incomes: Incomes) {
  }

  ngOnInit(): void {

    this.cards = this.incomes.cardsList;
    this.accounts = this.incomes.accountsList;
    this.types = this.incomes.typesList;
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

    this.incomes.remaining = this.incomes.toReceive - this.incomes.received;
  }
}