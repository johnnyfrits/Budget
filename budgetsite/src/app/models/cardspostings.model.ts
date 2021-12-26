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
	peopleList?: People[];
	editing?: boolean;
	deleting?: boolean;
}