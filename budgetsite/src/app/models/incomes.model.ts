export interface Incomes {
	id?: number;
	userId: number;
	reference: string;
	position?: number;
	description: string;
	toReceive: number;
	received: number;
	remaining: number;
	note?: string;
}