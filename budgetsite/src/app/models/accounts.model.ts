export interface Accounts {
	id?: number;
	userId: number;
	name: string;
	color?: string;
	background?: string;
	grandTotalBalance: number | undefined;
	totalBalance: number | undefined;
	previousBalance?: number | undefined;
	totalYields?: number | undefined;
}