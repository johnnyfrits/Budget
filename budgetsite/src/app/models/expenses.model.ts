import { Cards } from "./cards.model";

export interface Expenses {
	id?: number;
	userId: number;
	reference: string;
	position?: number;
	description: string;
	toPay: number;
	paid: number;
	remaining?: number;
	note?: string;
	cardId?: number;
	editing?: boolean;
	deleting?: boolean;
	card?: Cards;
	cardsList?: Cards[];
}