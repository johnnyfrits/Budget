import { Cards } from './cards.model';
import { People } from "./people.model";

export interface CardsPostings {
	id?: number;
	cardId: number;
	date: Date;
	reference: string;
	description: string;
	peopleId?: string;
	parcelNumber?: number;
	parcels?: number;
	amount: number;
	totalAmount?: number;
	others: boolean;
	note?: string;
	people?: People;
	card?: Cards;
	categoryId?: number;
}