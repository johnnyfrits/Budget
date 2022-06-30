import { Accounts } from "./accounts.model";
import { CardsReceipts } from "./cardsreceipts.model";
import { Expenses } from "./expenses.model";
import { Incomes } from "./incomes.model";

export interface AccountsPostings {
	id?: number;
	accountId: number;
	date: Date;
	reference: string;
	position?: number;
	description: string;
	amount: number;
	runningAmount: number;
	note?: string;
	type?: string;
	cardReceiptId?: number;
	expenseId?: number;
	incomeId?: number;
	accountsList?: Accounts[];
	incomesList?: Incomes[];
	expensesList?: Expenses[];
	editing?: boolean;
	deleting?: boolean;
	account?: Accounts;
	cardReceipt?: CardsReceipts;
}