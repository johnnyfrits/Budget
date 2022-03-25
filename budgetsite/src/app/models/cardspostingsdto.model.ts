import { CardsPostings } from "./cardspostings.model";
import { Incomes } from "./incomes.model";

export interface CardsPostingsDTO {
	reference: string;
	cardId: number;
	person: string;
	toReceive: number;
	received: number;
	remaining: number;
	cardsPostings: CardsPostings[];
	incomes: Incomes[];
	expanded?: boolean;
	expanding?: boolean;
}