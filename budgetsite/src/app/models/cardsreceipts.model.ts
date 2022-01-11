import { Accounts } from "./accounts.model";

export interface CardsReceipts {
	id?: number;
	reference: string;
	date: Date;
	cardId: number;
	peopleId: string;
	accountId: string;
	amount: number;
	change?: number;
	note?: string;
	toReceive?: number;
	received?: number;
	remaining?: number;
	accountsList?: Accounts[];
}