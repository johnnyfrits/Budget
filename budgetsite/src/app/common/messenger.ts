import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, throwError } from "rxjs";

@Injectable({
	providedIn: 'root'
})

export class Messenger {

	constructor(private snackBar: MatSnackBar) { }

	errorHandler(err: any): Observable<any> {
debugger
		console.log(err);

		this.snackBar.open(err, "Fechar",
			{
				duration: 10000,
				horizontalPosition: "center",
				verticalPosition: "top"
			});

		return throwError(err);
	}

	message(message: string, duration: number = 10000): void {

		this.snackBar.open(message, "Fechar",
			{
				duration: duration,
				horizontalPosition: "center",
				verticalPosition: "top"
			});
	}
}
