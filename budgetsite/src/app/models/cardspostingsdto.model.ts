import { AccountsPostings } from "./accountspostings.model";
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
	accountsPostings: AccountsPostings[];
	expanded?: boolean;
	expanding?: boolean;
}