import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavData } from './nav-data.model';

@Injectable({
	providedIn: 'root'
})
export class NavService {

	private _navData = new BehaviorSubject<NavData>({
		title: 'Início',
		icon: 'home',
		routeUrl: ''
	});

	constructor() { }

	get navData(): NavData {

		return this._navData.value;
	}

	set navData(value: NavData) {

		this._navData.next(value);
	}
}
