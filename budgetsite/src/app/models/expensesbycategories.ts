import { CardsPostings } from './cardspostings.model';
import { Expenses } from "./expenses.model";

export interface ExpensesByCategories {
	id?: number;
	reference?: string;
	cardId?: number;
	category?: string;
	amount?: number;
	perc?: number;
	expenses?: Expenses[];
	cardsPostings?: CardsPostings[];
	expanded?: boolean;
}