import { Accounts } from "./accounts.model";
import { Cards } from "./cards.model";

export interface CardsReceipts {
  id?: number;
  reference: string;
  date: Date;
  cardId: number;
  peopleId: string;
  accountId: number;
  amount: number;
  change?: number;
  note?: string;
  toReceive?: number;
  received?: number;
  remaining?: number;
  accountsList?: Accounts[];
  card?: Cards;
}
