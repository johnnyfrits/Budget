import { CardsPostings } from "./cardspostings.model";

export interface CardsPostingsDTO {
	person: string;
	toReceive: number;
	received: number;
	remaining: number;
	cardsPostings: CardsPostings[];
}