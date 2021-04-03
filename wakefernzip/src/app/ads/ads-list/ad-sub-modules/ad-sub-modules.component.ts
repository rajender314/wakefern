import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { trigger, style, transition, animate } from '@angular/animations';
import { AppService } from '@app/app.service';
import { AdsService } from '../../ads.service';
import { Title } from '@angular/platform-browser';

const APP: any = window['APP'];
import * as _ from 'lodash';
import { EditModComponent } from '@app/dialogs/edit-mod/edit-mod.component';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
@Component({
  selector: 'app-ad-sub-modules',
  templateUrl: './ad-sub-modules.component.html',
  styleUrls: ['./ad-sub-modules.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ]),
    trigger('topAnimate', [
      transition(':enter', [
        style({ transform: 'translateY(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class AdSubModulesComponent implements OnInit {
  public subheadersList: any;
  public routeUrl: any;
  public rowData = [];
  public samplePath: any;
  public columnDefs = [];
  public gridApi: any;
  public gridColumnApi = [];
  public headersData = [];
  public noData: any;
  public progress = true;
  public calculateCount = false;
  public numbers = [];
  public active = [];
  public minLimit: number;
  public maxLimit: number;
  public displayRange: number;
  public pageCount: number;
  public totalCount: number;
  public editProgress: any;
  public dialogRef: any;
  public listData: any;
  public adDetails: any;
  public navigateTo;
  public lockAdPer = false;
  public showlockIcon = false;
  public isLockedAd = false;
  dataLoad = true;
  constructor(
    private http: HttpClient,
    public appService: AppService,
    public adsService: AdsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private titleService: Title,
    private snackbar: MatSnackBar,
    public editModComp: EditModComponent
  ) {
    activeRoute.params.subscribe(param => {
      this.routeUrl = param.url;
      this.appService.adId = param.url ? param.url : '';
    });
    // console.log( this.adsService.alive ,
    //   this.adsService.isImportProgess)
    // if( this.adsService.isImportProgess) {
    this.importTimer();

    // }
    // console.log(this.adsService.adStatus)
  }

  importTimer() {
    let i = 0;
    timer(0, 5000)
      .pipe(takeWhile(() => this.adsService.alive)) // only fires when component is alive
      .subscribe(() => {
        this.adsService.checkAdImportStatus(this.appService.adId).then(res => {
          i++;
          if (!res.result.data.isLockImport) {
            // console.log(222222222);
            this.adsService.alive = false;
            this.adsService.isImportProgess = false;
            this.adsService.editPermission = true;

            if (i > 1) {
              console.log(new Date());

              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Items Data Imported Successfully'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });

              window.location.reload();
            }

            // if (res.result.data.action == 'completed') {
            //   console.log(222);
            //   console.log( this.adsService.alive ,
            //     this.adsService.isImportProgess)

            //   // this.selectedList(this.currentTabData);

            //   // if(this.adsService.importTimerFlag) {
            //   // setTimeout(() => {
            //   //   window.location.reload();
            //   // }, 500);
            // // }
            // }
          } else {
            console.log(333333333);

            this.adsService.isImportProgess = true;
            this.adsService.editPermission = false;
            if (res.result.data.action) {
              this.adsService.importProgStatus = res.result.data.message;
              this.adsService.importProgVal = res.result.data.action_progress;

              // if (res.result.data.action == 'pending') {
              //   this.adsService.importProgVal = 25;
              // } else if (res.result.data.action == 'processing') {
              //   this.adsService.importProgVal = 60;
              // } else {
              //   this.adsService.importProgVal = 15;
              // }
            }
            // this.adsService.showImportProg();
          }
        });
      });
  }
  public params = {
    search: '',
    pageSize: 20,
    id: '',
    pageNumber: 1
  };
  ngOnInit() {
    this.titleService.setTitle('Ads');
    this.adsService.hideHeader = false;
    this.getList();

    this.adsService.isImportProgess = false;
    this.adsService.checkAdImportStatus(this.appService.adId).then(res => {
      if (!res.result.data.isLockImport) {
        this.adsService.alive = false;
        this.adsService.isImportProgess = false;
      } else {
        this.adsService.isImportProgess = true;
        if (res.result.data.action) {
          this.adsService.importProgStatus = res.result.data.message;
          // if (res.result.data.action == 'pending') {
          //   this.adsService.importProgVal = 25;
          // } else if (res.result.data.action == 'processing') {
          //   this.adsService.importProgVal = 60;
          // } else {
          this.adsService.importProgVal = res.result.data.action_progress;
          // }
        }
        // this.adsService.showImportProg();
      }
    });

    this.lockAdPer = this.appService.headerPermissions
      ? this.appService.headerPermissions['LOCK_OR_UNLOCK_ADS']
      : true;
    setTimeout(() => {
      // console.log(this.adsService)
      if (
        this.adsService.adStatus === 'Closed' ||
        this.adsService.adStatus === 'Published' ||
        this.adsService.adStatus === 'Archived' ||
        this.adsService.adStatus === 'Cancel' ||
        this.adsService.adlock == 1
      ) {
        this.adsService.editPermission = false;
        // this.showlockIcon = true;
      } else {
        // this.adsService.editPermission = true;

        this.adsService.editPermission = this.appService.headerPermissions
          ? this.appService.headerPermissions['EDIT_ADS']
          : true;
        // this.showlockIcon = false;
      }

      if (
        this.adsService.adStatus === 'Closed' ||
        this.adsService.adStatus === 'Archived' ||
        this.adsService.adStatus === 'Cancel' ||
        this.adsService.adlock == 1
      ) {
        this.adsService.enableDuplicateAd = false;
        // this.showlockIcon = true;
      } else {
        this.adsService.enableDuplicateAd = true;
      }

      if (
        this.adsService.adStatus === 'Closed' ||
        this.adsService.adStatus === 'Published' ||
        this.adsService.adStatus === 'Archived' ||
        this.adsService.adStatus === 'Cancel' ||
        this.adsService.isImportProgess
      ) {
        this.isLockedAd = true;
      } else {
        this.isLockedAd = false;
      }

      if (this.adsService.adlock == 1) {
        this.showlockIcon = true;
      } else {
        this.showlockIcon = false;
      }

      // console.log(this.adsService.editPermission);
    }, 500);
  }
  public navLink;
  navigateTabs(list, event) {
    // console.log(this.editModComp)

    // console.log(this.appService.switchPromoFlag)
    // console.log(          routerLink="/vehicles/{{ routeUrl }}/{{ list.url }}")

    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

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
          this.router.navigateByUrl(
            'vehicles/' + this.routeUrl + '/' + list.url
          );
          this.appService.switchPromoFlag = false;
        }
      });

      return;
    } else {
      this.router.navigateByUrl('vehicles/' + this.routeUrl + '/' + list.url);
    }
  }

  showPopup(param) {
    if (!this.lockAdPer || this.isLockedAd) {
      return;
    }
    // console.log(param);

    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

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
          // this.adsService.promotionItems.items = [];
        } else {
          // if( this.appService.gridData != undefined) {
          //   this.appService.gridData.api.stopEditing();

          // }
          // let mode = param;
          // const rowData = {
          //   delete_api:
          //     mode === 'exported'
          //       ? 'exportAd'
          //       : mode === 'versionexport'
          //       ? 'exportAdVersion'
          //       : mode === 'cancel'
          //       ? 'cancelAds'
          //       : mode === 'lockad'
          //       ? 'lockAd'
          //       : 'deleteAds',
          //   label: 'Ad'
          // };

          // mode = mode === 'versionexport' ? 'exported' : mode;
          // const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
          //   panelClass: ['confirm-delete', 'overlay-dialog'],
          //   width: '500px',
          //   data: {
          //     rowData: rowData,
          //     selectedRow: {
          //       ad_id: this.appService.adId,
          //       lockStatus: this.adsService.adlock
          //     },

          //     mode:
          //       mode === 'exported'
          //         ? 'export'
          //         : mode === 'cancel'
          //         ? 'cancel'
          //         : mode === 'lockad'
          //         ? 'lockad'
          //         : ''
          //   }
          // });

          // dialogRef.afterClosed().subscribe(result => {
          //   if( this.appService.gridData != undefined) {
          //     this.appService.gridData.api.stopEditing();

          //   }
          //   this.appService.switchPromoFlag = false;
          //     this.adsService.promotionItems.items = [];
          //   if (mode == 'lockad') {
          //     // console.log(result)
          //     if (result == 2) {
          //       this.adsService.editPermission = true;
          //       // this.lockname = 'Lock Ad';

          //       this.showlockIcon = false;

          //       let prm = {
          //         get_api: 'adsDetails'
          //       };

          //       this.selectedList(prm);

          //       this.snackbar.openFromComponent(SnackbarComponent, {
          //         data: {
          //           status: 'success',
          //           msg: 'Ad UnLocked Successfully'
          //         },
          //         verticalPosition: 'top',
          //         horizontalPosition: 'right'
          //       });
          //       return;
          //     } else if (result == 1) {
          //       this.adsService.editPermission = false;
          //       // this.lockname = 'UnLock Ad';

          //       this.showlockIcon = true;

          //       let prm = {
          //         get_api: 'adsDetails'
          //       };

          //       this.selectedList(prm);

          //       this.snackbar.openFromComponent(SnackbarComponent, {
          //         data: {
          //           status: 'success',
          //           msg: 'Ad Locked Successfully'
          //         },
          //         verticalPosition: 'top',
          //         horizontalPosition: 'right'
          //       });
          //       return;
          //     }
          //   }
          // });
          window.location.reload();
          this.appService.switchPromoFlag = false;

          // let a = this.appService.gridData;
          // console.log(a.colDef.promoId);
          // let b = a.colDef.promoId;
          // this.editModComp.promoDetails22(b);
        }
      });

      return;
    } else {
      if (this.appService.gridData != undefined) {
        this.appService.gridData.api.stopEditing();
      }

      let mode = param;
      const rowData = {
        delete_api:
          mode === 'exported'
            ? 'exportAd'
            : mode === 'versionexport'
            ? 'exportAdVersion'
            : mode === 'cancel'
            ? 'cancelAds'
            : mode === 'lockad'
            ? 'lockAd'
            : 'deleteAds',
        label: 'Ad'
      };

      mode = mode === 'versionexport' ? 'exported' : mode;
      const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        panelClass: ['confirm-delete', 'overlay-dialog'],
        width: '500px',
        data: {
          rowData: rowData,
          selectedRow: {
            ad_id: this.appService.adId,
            lockStatus: this.adsService.adlock
          },

          mode:
            mode === 'exported'
              ? 'export'
              : mode === 'cancel'
              ? 'cancel'
              : mode === 'lockad'
              ? 'lockad'
              : ''
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (mode == 'lockad') {
          // console.log(result)
          if (result == 2) {
            this.adsService.editPermission = true;
            this.adsService.enableDuplicateAd = true;

            // this.lockname = 'Lock Ad';

            this.showlockIcon = false;

            let prm = {
              get_api: 'adsDetails'
            };

            this.selectedList(prm);

            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Ad UnLocked Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            return;
          } else if (result == 1) {
            this.adsService.editPermission = false;
            this.adsService.enableDuplicateAd = false;

            // this.lockname = 'UnLock Ad';

            this.showlockIcon = true;

            let prm = {
              get_api: 'adsDetails'
            };

            this.selectedList(prm);
            this.appService.switchPromoFlag = false;
            this.adsService.promotionItems.items = [];

            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Ad Locked Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            return;
          }
        }
      });
    }
  }

  goToVehicles() {
    if (this.appService.switchPromoFlag) {
      event.stopPropagation(); // Only seems to
      event.preventDefault(); // work with both
      // this.navLink = 'vehicles/' + this.routeUrl + '/' + list.url;

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
          this.router.navigateByUrl('#/vehicles');
          this.appService.switchPromoFlag = false;
        }
        return;
      });
    } else {
      this.router.navigateByUrl('#/vehicles');
    }
  }

  routerActive() {
    return false;
  }
  getList() {
    const currentTabData = this.appService.getListData('Others', 'AD_DETAILS');
    this.subheadersList = this.appService.subHeaders;
    this.selectedList(currentTabData);
    this.router.navigateByUrl(
      'vehicles/' + this.appService.adId + '/' + currentTabData.url
    );
  }

  selectedList(list) {
    // console.log(list)
    this.params.id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        if (res.result.success) {
          this.appService.adDetails = res.result.data;
          this.adsService.adStatus = res.result.data.status.code;
          this.adsService.adlock = res.result.data.lock;
          this.appService.divisionIds = this.appService.adDetails['divisions'];
          this.appService.baseVersionDetails =
            res.result.data.base_version_info;
          this.adDetails = this.appService.adDetails;
          this.appService.adName = res.result.data.vehicle;
        }
      });
  }
}
