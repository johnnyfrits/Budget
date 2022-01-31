import { Injectable } from "@angular/core";

@Injectable({
	providedIn: 'root'
})

export class Scroll {

	public scrollTo(elementId: any) {

		var element = document.getElementById(elementId);

		element?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest'
		});
	}
}