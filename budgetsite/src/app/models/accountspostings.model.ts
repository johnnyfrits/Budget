export interface AccountsPostings {
	id?: number;
	accountId: number;
	date: Date;
	reference: string;
	position?: number;
	description: string;
	amount: number;
	note?: string;
	type?: string;
	cardIdReceipt?: number;
	expensePaymentId?: number;
	incomeReceiptId?: number;
	editing?: boolean;
	deleting?: boolean;
}