import { Cards } from "./cards.model";

export interface Expenses {
	id?: number;
	userId: number;
	reference: string;
	position?: number;
	description: string;
	toPay: number;
	totalToPay: number;
	paid: number;
	remaining?: number;
	note?: string;
	cardId?: number;
	dueDate?: Date;
	parcelNumber?: number;
	parcels?: number;
	editing?: boolean;
	deleting?: boolean;
	generateParcels?: boolean;
	repeatParcels?: boolean;
	monthsToRepeat?: number;
	card?: Cards;
	cardsList?: Cards[];
}