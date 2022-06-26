import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NavService } from './nav.service';
import { MatDrawer } from '@angular/material/sidenav';
import { UserService } from 'src/app/services/user/user.service';
import { Users } from 'src/app/models/users';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  theme = localStorage.getItem('theme') ?? 'light-theme';
  mobile: boolean = false;
  themeToggle = false;

  user!: Users;

  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private navService: NavService,
    private userService: UserService,
    private router: Router
  ) { }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit(): void {

    this.themeToggle = this.theme == 'dark-theme';

    document.documentElement.className = this.theme;

    this.user = JSON.parse(localStorage.getItem('user')!);
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

  logout() {

    this.userService.logout();
  }

  changeTheme() {

    this.theme = this.themeToggle ? 'dark-theme' : 'light-theme'

    document.documentElement.className = this.theme;

    localStorage.setItem('theme', this.theme);
  }

  viewUser() {

    this.closeSideNav();

    this.router.navigate(['/users'], { state: { user: this.user } });
  }
}
