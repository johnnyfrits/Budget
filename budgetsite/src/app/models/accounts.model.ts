export interface Accounts {
	id?: number;
	userId: number;
	name: string;
	color?: string;
	background?: string;
	totalBalance: number | undefined;
	previousBalance?: number | undefined;
	totalYields?: number | undefined;
}