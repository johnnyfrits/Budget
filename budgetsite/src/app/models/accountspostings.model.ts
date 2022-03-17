import { Accounts } from "./accounts.model";

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
	cardIdReceipt?: number;
	expenseId?: number;
	incomeId?: number;
	accountsList?: Accounts[];
	editing?: boolean;
	deleting?: boolean;
}