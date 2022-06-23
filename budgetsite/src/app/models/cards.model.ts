export interface Cards {
	id?: number;
	userId: number;
	name: string;
	color?: string;
	background?: string;
	disabled?: boolean;
	editing?: boolean,
	deleting?: boolean
}