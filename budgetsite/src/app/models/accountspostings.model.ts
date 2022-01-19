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
	editing?: boolean;
	deleting?: boolean;
}