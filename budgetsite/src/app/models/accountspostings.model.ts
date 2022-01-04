export interface AccountsPostings {
	id?: number;
	accountId: number;
	date: Date;
	reference: string;
	description: string;
	amount: number;
	note?: string;
	editing?: boolean;
	deleting?: boolean;
}