import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, throwError } from "rxjs";

@Injectable({
	providedIn: 'root'
})

export class Messenger {

	constructor(private snackBar: MatSnackBar) { }

	errorHandler(err: any): Observable<any> {

		console.log(err);

		this.snackBar.open(err.message, "Fechar",
			{
				duration: 10000,
				horizontalPosition: "center",
				verticalPosition: "top"
			});

		return throwError(err);
	}
}