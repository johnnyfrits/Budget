import { Categories } from "./categories.model";
import { People } from "./people.model";

export interface CardsPostings {
	id?: number;
	cardId: number;
	date: Date;
	reference: string;
	position?: number;
	description: string;
	peopleId?: string;
	parcelNumber?: number;
	parcels?: number;
	amount: number;
	totalAmount?: number;
	others: boolean;
	note?: string;
	people?: People;
	categoryId?: number;
	peopleList?: People[];
	categoriesList?: Categories[];
	editing?: boolean;
	deleting?: boolean;
	isSelected?: boolean;
	generateParcels?: boolean;
}