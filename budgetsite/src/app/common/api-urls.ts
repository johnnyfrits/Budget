import { environment } from '../../environments/environment';

export class ApiUrls {

    public static baseUrl: string = environment.baseUrl;
    public static accounts: string = ApiUrls.baseUrl + 'accounts';
    public static accounttotals: string = ApiUrls.baseUrl + 'accounts/totals?';
    public static accountssummary: string = ApiUrls.baseUrl + 'accounts/accountssummary?';
    public static totalsaccountssummary: string = ApiUrls.baseUrl + 'accounts/summarytotals?';
    public static accountspostings: string = ApiUrls.baseUrl + 'accountspostings';
    public static cards: string = ApiUrls.baseUrl + 'cards';
    public static cardspostings: string = ApiUrls.baseUrl + 'cardspostings';
    public static cardspostingspeople: string = ApiUrls.baseUrl + 'cardspostings/people?';
    public static cardsreceipts: string = ApiUrls.baseUrl + 'cardsreceipts';
    public static expenses: string = ApiUrls.baseUrl + 'expenses';
    public static incomes: string = ApiUrls.baseUrl + 'incomes';
    public static people: string = ApiUrls.baseUrl + 'people';
    public static yield: string = ApiUrls.baseUrl + 'yields';
    public static budgetTotals: string = ApiUrls.baseUrl + 'budget/totals?';
    public static categories: string = ApiUrls.baseUrl + 'categories';
    public static users: string = ApiUrls.baseUrl + 'users';
}