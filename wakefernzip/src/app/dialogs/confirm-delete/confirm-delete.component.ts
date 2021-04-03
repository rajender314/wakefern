import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from '@app/settings/settings.service';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';

const APP: any = window['APP'];

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDeleteComponent implements OnInit {
  public process = false;
  public mode = 'Delete';
  public zonesList = [];
  public selected_zones = [];
  public isSelectAll = 'yes';
  public zonesarr = [];
  public alertImg = APP.img_url + 'alert.svg';

  constructor(
    private dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private settingsService: SettingsService,
    private adsService: AdsService,
    private appService: AppService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    // console.log(this.data);

    if (this.data.mode === 'lockad') {
      if (this.data.selectedRow.lockStatus === 1) {
        this.mode = 'UnLock';
      } else if (this.data.selectedRow.lockStatus === 2) {
        this.mode = 'Lock';
      } else {
        this.mode = 'Lock';
      }
    } else {
      this.mode =
        this.data.mode === 'export'
          ? 'Export'
          : this.data.mode === 'download'
          ? 'Download'
          : this.data.mode === 'cancel'
          ? 'Cancel'
          : this.data.mode === 'import'
          ? 'Import'
          : this.data.mode === 'split-mod'
          ? 'Split Mod'
          : this.data.mode === 'Update-Zones'
          ? 'Update Zones'
          : this.data.mode === 'switchPromo'
          ? 'Save Changes'
          : this.data.selectedRow.lockStatus === 1
          ? 'UnLock'
          : this.data.selectedRow.lockStatus === 2
          ? 'Lock'
          : 'Delete';
    }

    if (this.data.mode == 'export') {
      this.getZonesLists();
    }

    // console.log(this.mode);
    // console.log(document.getElementsByClassName('structure-select div'))
    // console.log(document.querySelector(".structure-select div"))
  }

  getZonesLists() {
    this.settingsService
      .deleteItem([{ url: 'getZonesLists' }, this.data.selectedRow])
      .then(response => {
        if (response.result.success) {
          response.result.data.map(zone => {
            this.zonesList.push({ id: zone, name: zone.toString() });
          });
        }
        if (this.zonesList.length) {
          this.zonesList.unshift({ id: 'select_all', name: 'Select All' });
        }
      });
  }

  closeDialog = () => {
    this.dialogRef.close({ from: 'close' });
  };

  zoneValChanged(event) {
    if (this.selected_zones.indexOf('select_all') > -1) {
      this.zonesList.shift();

      let arr = [];
      this.zonesList.forEach((ele, index) => {
        this.selected_zones.push(ele.id);
        arr.push(ele.id);
      });
      this.zonesarr = arr;
    } else {
      this.zonesarr = this.selected_zones;
    }

    // console.log(this.zonesList.length);
    // console.log(this.zonesarr.length)

    if (this.selected_zones.length) {
      this.isSelectAll = 'no';
    } else {
      this.isSelectAll = 'yes';
      this.zonesarr = [];
      if (this.zonesList[0].id != 'select_all') {
        this.zonesList.unshift({ id: 'select_all', name: 'Select All' });
      }
    }
  }

  delete() {
    // deleting the previewed images,icons logic from ad-pages click
    if (this.mode === 'Split Mod') {
      this.dialogRef.close({ from: 'confirm' });
      return;
    }
    if (this.mode === 'Update Zones') {
      this.dialogRef.close({ from: 'confirm' });
      return;
    }
    if (this.data.mode == 'delete' && this.data.action == 'deltePreviewItems') {
      this.dialogRef.close({ from: this.data.mode, action: this.data.action });
      return;
    }
    if (
      this.data.mode == 'download' &&
      this.data.action == 'importValidation'
    ) {
      this.dialogRef.close({ from: this.data.mode, action: this.data.action });
      return;
    }
    if (this.data.mode === 'import') {
      this.dialogRef.close({ from: 'proceed' });
      return;
    }
    if (this.data.mode == 'delete' && this.data.from == 'promoImageDel') {
      this.dialogRef.close({ from: this.data.mode, action: 'confirmed' });
      return;
    }

    if (this.data.mode == 'switchPromo' && this.data.from == 'switchPromo') {
      this.dialogRef.close({ from: this.data.mode, action: 'confirmed' });
      return;
    }

    // if (this.data.mode == 'lockpromo' && this.data.from == 'lockpromo') {
    //   this.dialogRef.close({ from: this.data.mode, action: 'confirmed' });
    //   return;
    // }
    this.process = true;
    // if (this.data.mode === 'split-mod') {
    //   this.adsService
    //     .getAdModules([{ url: 'saveSplitMod' }, this.data.rowData])
    //     .then(res => {
    //       this.dialogRef.close({ from: 'save', result: res });
    //       this.process = false;
    //     });
    //   return;
    // }

    if (
      this.data.rowData.label === 'Ad Preview' ||
      this.data.rowData.label === 'Ad Report'
    ) {
      // from ad preview page's export btn click function...
      this.adsService.exportAd(this.data.exportObj).then(res => {
        this.dialogRef.close({ from: 'close1', result: res });
        this.process = false;
      });
    } else if (
      this.data.mode == 'download' &&
      this.data.action == 'importItems'
    ) {
      this.adsService
        .importBoxFile([{ url: 'downloadBoxFile' }, this.data.rowData])
        .then(res => {
          if (res.result.success) {
            this.dialogRef.close({ from: 'download', case: true, result: res });
          } else {
            this.dialogRef.close({
              from: 'download',
              case: false,
              result: res
            });
          }
          this.process = false;
        });
    } else if (
      this.data.mode == 'delete' &&
      this.data.action == 'importItems'
    ) {
      this.adsService
        .importBoxFile([{ url: 'deleteBoxFile' }, this.data.rowData])
        .then(res => {
          if (res.result.success) {
            this.dialogRef.close({ from: 'delete', case: true, result: res });
          } else {
            this.dialogRef.close({ from: 'delete', case: false, result: res });
          }
          this.process = false;
        });
    } else if (this.data.mode == 'export') {
      let params = {
        ad_id: this.data.selectedRow.ad_id,
        zones: this.zonesarr,
        isSelectAll: this.isSelectAll
      };
      this.settingsService
        .deleteItem([{ url: this.data.rowData.delete_api }, params])
        .then(response => {
          if (response.result.success) {
            this.dialogRef.close(response.result);
          }
          this.process = false;
        });
    } else if (this.data.mode == 'lockpromo' || this.data.mode == 'lockad') {
      // console.log(this.data.selectedRow.lockStatus);

      let params = {
        promotion_id: this.data.selectedRow.promotion_id,
        lock_status: 1,
        ad_id: ''
      };

      if (this.data.selectedRow.lockStatus == 1) {
        params.lock_status = 2;
        this.mode = 'UnLock';
      } else {
        params.lock_status = 1;
        this.mode = 'Lock';
      }

      if (this.data.mode == 'lockad') {
        delete params.promotion_id;
        params.ad_id = this.data.selectedRow.ad_id;
      } else {
        delete params.ad_id;
      }
      this.settingsService
        .deleteItem([{ url: this.data.rowData.delete_api }, params])
        .then(response => {
          if (response.result.success) {
            this.dialogRef.close(params.lock_status);
          }
          this.process = false;
        });
      return;
    } else {
      this.settingsService
        .deleteItem([
          { url: this.data.rowData.delete_api },
          this.data.selectedRow
        ])
        .then(response => {
          if (response.result.success) {
            this.dialogRef.close(response.result);
          }
          this.process = false;
        });
    }
  }
}
