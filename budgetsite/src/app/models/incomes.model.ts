import { Cards } from "./cards.model";

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
	card?: Cards;
	cardId?: number;
	editing?: boolean;
	deleting?: boolean;
	cardsList?: Cards[];

}