export interface Expenses {
	id?: number;
	userId: number;
	reference: string;
	position?: number;
	description: string;
	toPay: number;
	paid: number;
	remaining: number;
	note?: string;
}