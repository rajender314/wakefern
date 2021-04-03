import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { UsersService } from '@app/users/users.service.ts';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { AppService } from '@app/app.service';
import * as _ from 'lodash';
import { EditModComponent } from '@app/dialogs/edit-mod/edit-mod.component';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';

const APP: any = window['APP'];
@Component({
  selector: 'app-header',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    class: 'app-header'
  },
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.15s ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.15s ease', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  showNavContainer = false;
  showNav = false;
  animationInProgress = false;
  public url = APP.api_url;
  public app_image = APP.img_url + 'quad-logo.svg';
  public loginDetails = JSON.parse(APP.loginDetails);
  public logo = APP.img_url + 'Wakefern_Food_Corporation_logo_.svg';
  public tabs = [];
  // tabs: any[] = [
  //   // iconBackground: '#529cff'
  //   // { name: 'Events', link: '/events', iconClass: 'pixel-icons icon-events' },
  //   // , iconBackground: '#529cff'
  //   {
  //     name: 'Campaigns',
  //     link: '/campaigns',
  //     iconClass: 'pixel-icons icon-campaigns'
  //   },
  //   // , iconBackground: '#529cff'
  //   {
  //     name: 'Users',
  //     link: '/users',
  //     iconClass: 'pixel-icons icon-user-profile'
  //   },
  //   // , iconBackground: '#529cff'
  //   {
  //     name: 'Settings',
  //     link: '/settings',
  //     iconClass: 'pixel-icons icon-settings'
  //   }
  // ];
  // logoutUrl: string = APP.sso_url + 'oauthlogout?access_token=' + APP.access_token;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private userService: UsersService,
    protected localStorage: LocalStorage,
    public appService: AppService,
    public editModComp: EditModComponent
  ) {}

  ngOnInit() {
    const i = _.findIndex(JSON.parse(APP.systemSettings), { key: 'Others' });
    this.appService.subHeaders =
      i > -1 ? JSON.parse(APP.systemSettings)[i].value : [];
    this.appService.changeUserData(this.loginDetails['user_data']);

    this.appService.configData.subscribe(config => {
      config.data.map(tabs => {
        if (tabs.key === 'Top-Headers') {
          this.appService.configLabels = tabs.value;
          this.tabs = this.appService.configLabels;
        }
      });
    });
    this.appService.currentUserData.subscribe(
      data =>
        (this.loginDetails['user_data'] = data
          ? data
          : this.loginDetails['user_data'])
    );
  }

  userLogo(data) {}
  organizationRedirect() {
    const config = this.router.config.map(route => Object.assign({}, route));
    this.router.resetConfig(config);
    this.router.navigate(['/organization']);
  }
  logout() {
    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

      // this.editModComp.restrictSwitch();

      let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '540px',
        data: {
          // rowData: rowData,
          mode: 'switchPromo',
          from: 'switchPromo'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.from == 'switchPromo' && result.action == 'confirmed') {
          // this.savePromoData();
          this.editModComp.restrictSwitch();
          this.appService.switchPromoFlag = false;
        } else {
          if (this.loginDetails.user_data.is_sso_user === 1) {
            window.location.href = this.url + 'doLogoutSso';
          } else {
            window.location.href = this.url + 'logout';
          }
          localStorage.clear();
          this.appService.switchPromoFlag = false;
        }
      });

      return;
    }
    if (this.loginDetails.user_data.is_sso_user === 1) {
      window.location.href = this.url + 'doLogoutSso';
    } else {
      window.location.href = this.url + 'logout';
    }
    localStorage.clear();
  }
  manageAccount() {
    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

      // this.editModComp.restrictSwitch();

      let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '540px',
        data: {
          // rowData: rowData,
          mode: 'switchPromo',
          from: 'switchPromo'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.from == 'switchPromo' && result.action == 'confirmed') {
          // this.savePromoData();
          this.editModComp.restrictSwitch();
          this.appService.switchPromoFlag = false;
        } else {
          window.location.href = this.url + '#/manage-account';
          this.appService.switchPromoFlag = false;
        }
      });
      return;
    } else {
      window.location.href = this.url + '#/manage-account';
      this.appService.switchPromoFlag = false;
    }
  }
  goToHome() {
    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

      // this.editModComp.restrictSwitch();

      let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '540px',
        data: {
          // rowData: rowData,
          mode: 'switchPromo',
          from: 'switchPromo'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.from == 'switchPromo' && result.action == 'confirmed') {
          // this.savePromoData();
          this.editModComp.restrictSwitch();
          this.appService.switchPromoFlag = false;
        } else {
          if (this.appService.configLabels.length) {
            window.location.href =
              this.url + '#/' + this.appService.configLabels[0].url;
          }
          this.appService.switchPromoFlag = false;
        }
      });
      return;
    }
    if (this.appService.configLabels.length) {
      window.location.href =
        this.url + '#/' + this.appService.configLabels[0].url;
    }
  }
  togglePrimaryNav() {
    if (this.animationInProgress) {
      return false;
    }

    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

      // this.editModComp.restrictSwitch();
      let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '540px',
        data: {
          // rowData: rowData,
          mode: 'switchPromo',
          from: 'switchPromo'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.from == 'switchPromo' && result.action == 'confirmed') {
          // this.savePromoData();
          this.editModComp.restrictSwitch();
          this.appService.switchPromoFlag = false;
        } else {
          this.showNav = !this.showNav;
          if (this.showNav) {
            this.showNavContainer = this.showNav;
          } else {
            this.animationInProgress = true;
            setTimeout(() => {
              this.showNavContainer = this.showNav;
              this.animationInProgress = false;
            }, 150);
          }
          this.appService.switchPromoFlag = false;
        }
      });
      return;
    }

    this.showNav = !this.showNav;
    if (this.showNav) {
      this.showNavContainer = this.showNav;
    } else {
      this.animationInProgress = true;
      setTimeout(() => {
        this.showNavContainer = this.showNav;
        this.animationInProgress = false;
      }, 150);
    }
  }

  navigateTabs(list, event) {
    // console.log(list)
    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

      // this.editModComp.restrictSwitch();
      let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '540px',
        data: {
          // rowData: rowData,
          mode: 'switchPromo',
          from: 'switchPromo'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.from == 'switchPromo' && result.action == 'confirmed') {
          // this.savePromoData();
          this.editModComp.restrictSwitch();
          this.appService.switchPromoFlag = false;
        } else {
          window.location.href = this.url + '#/' + list.url;

          this.appService.switchPromoFlag = false;
        }
      });
      return;
    }
  }
}
