import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Expenses } from 'src/app/models/expenses.model';
import { Incomes } from 'src/app/models/incomes.model';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { IncomeService } from 'src/app/services/income/income.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {

  reference?: string;

  expenses!: Expenses[];
  incomes!: Incomes[];
  displayedExpensesColumns = ['description', 'toPay', 'paid', 'remaining'];
  displayedIncomesColumns = ['description', 'toReceive', 'received', 'remaining'];
  toPayTotal: number = 0;
  paidTotal: number = 0;
  expensesRemainingTotal: number = 0;
  toReceiveTotal: number = 0;
  receivedTotal: number = 0;
  incomesRemainingTotal: number = 0;
  monthName: string = "";
  hideExpensesProgress: boolean = true;
  hideIncomesProgress: boolean = true;

  constructor(private expenseService: ExpenseService, private incomeService: IncomeService) { }

  ngOnInit(): void {
  }

  referenceChanges(reference: string) {

    this.reference = reference;

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

          this.hideExpensesProgress = true;
        },
        error: () => {

          this.getExpensesTotals();

          this.hideExpensesProgress = true;
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

          this.hideIncomesProgress = true;
        },
        error: () => {

          this.getIncomesTotals();

          this.hideIncomesProgress = true
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
        this.expenses.map(t => t.remaining).reduce((acc, value) => acc + value, 0) :
        0;
  }
}
