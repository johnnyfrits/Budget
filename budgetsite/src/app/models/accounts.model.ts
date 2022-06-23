export interface Accounts {
	id?: number;
	userId: number;
	name: string;
	color?: string;
	background?: string;
	disabled?: boolean;
	calcInGeneral?: boolean;
	grandTotalBalance?: number | undefined;
	totalBalance?: number | undefined;
	previousBalance?: number | undefined;
	totalYields?: number | undefined;
	editing?: boolean;
	deleting?: boolean;
}