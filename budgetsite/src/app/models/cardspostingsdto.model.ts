import { CardsPostings } from "./cardspostings.model";

export interface CardsPostingsDTO {
	reference: string;
	cardId: number;
	person: string;
	toReceive: number;
	received: number;
	remaining: number;
	cardsPostings: CardsPostings[];
	expanded?: boolean;
	expanding?: boolean;
}