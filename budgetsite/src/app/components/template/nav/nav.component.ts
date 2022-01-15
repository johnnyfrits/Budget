import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NavService } from './nav.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  mobile: boolean = false;

  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(private breakpointObserver: BreakpointObserver, private navService: NavService) { }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit(): void {
  }

  get icon(): string {

    return this.navService.navData.icon;
  }

  get title(): string {

    return this.navService.navData.title;
  }

  get routeUrl(): string {

    return this.navService.navData.routeUrl;
  }

  closeSideNav() {

    if (this.drawer.mode == 'over') {

      this.drawer.close();
    }
  }
}
