import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';
import { AppService } from '@app/app.service';

@Component({
  selector: 'app-offer-unit-cell',
  templateUrl: './offer-unit-cell.component.html',
  styleUrls: ['./offer-unit-cell.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OfferUnitCellComponent implements ICellRendererAngularComp {
  public offerUnitSelectOptions = [];
  public OfferUnitCellValue: any;
  public OfferUnitCellValue2: any;
  public varietyStatemntsOptions = [];
  public adBugOptions = [];
  public iconOptions = [];
  public params: any;
  public gridApi: any;
  public callParams = {
    column: '',
    pageNumber: 1,
    pageSize: 21,
    search: '',
    sort: 'asc',
    status: [1]
  };
  public copyValues = {
    id: [],
    values: ''
  };
  constructor(private adsService: AdsService, private appService: AppService) {}

  agInit(params: any): void {
    // console.log(params);

    this.params = params;
    this.gridApi = params.api;
    let rowNode = params.api.getDisplayedRowAtIndex(params.rowIndex);

    if (rowNode) {
      // if (params.keyPress == 46) {
      //   this.gridApi.stopEditing();
      //   this.offerUnitChanged([],[]);
      //   return;
      // }
    }
    params.value = params.node.data[params.column.colDef.field];
    this.copyValues.id = params.value.id ? params.value.id : [params.value];
    this.copyValues.values = params.value.values
      ? params.value.values
      : [params.value];
    this.OfferUnitCellValue = params.value.id
      ? params.column.colDef.field == 'edited_unit' && params.value.id.length
        ? params.value.id[0]
        : params.value.id
      : params.value;
    // console.log(this.OfferUnitCellValue);
    this.OfferUnitCellValue2 =
      params.value === undefined || params.value === null ? false : true;
    if (params.column.colDef.field == 'variety_statements') {
      this.getVarietyStatements();
    } else if (params.column.colDef.field == 'edited_ad_bug') {
      this.getAdBugOptions();
    } else if (params.column.colDef.field == 'logo_01') {
      this.getIconDetails();
    } else if (params.column.colDef.field == 'logo_02') {
      this.getIconDetails();
    } else if (params.column.colDef.field == 'logo_03') {
      this.getIconDetails();
    } else if (params.column.colDef.field == 'logo_04') {
      this.getIconDetails();
    } else if (params.column.colDef.field == 'edited_unit') {
      this.getUnits();
    }
  }
  getValue(): any {
    return this.copyValues;
  }
  getVarietyStatements() {
    this.adsService
      .sendOuput('getVarietyStatements', this.callParams)
      .then(res => {
        if (res.result.success) {
          this.varietyStatemntsOptions = res.result.data.data;
        }
      });
  }
  getAdBugOptions() {
    this.adsService.sendOuput('getAdBug', this.callParams).then(res => {
      if (res.result.success) {
        this.adBugOptions = res.result.data.data;
      }
    });
  }
  getIconDetails() {
    this.adsService.sendOuput('getIcons', this.callParams).then(res => {
      if (res.result.success) {
        this.iconOptions = res.result.data.data;
      }
    });
  }
  getUnits() {
    this.adsService.sendOuput('getUnits', this.callParams).then(res => {
      if (res.result.success) {
        this.offerUnitSelectOptions = res.result.data.data;
      }
    });
  }
  refresh(params: any): boolean {
    this.params = params;
    this.setOfferUnitCellValue(params);
    return true;
  }

  setOfferUnitCellValue(params) {
    this.OfferUnitCellValue = params.value.values;
  }

  offerUnitChanged(event: any, opts) {
    // console.log(event);

    let values = [];
    if (!event.length) {
      this.copyValues.id = [];
      this.copyValues.values = '';
    }
    let arrLngth =
      this.params.column.colDef.field == 'logo_01' ? 1 : event.length;
    for (let i = 0; i < arrLngth; i++) {
      let idx = _.findIndex(opts, {
        id: this.params.column.colDef.field == 'logo_01' ? event : event[i]
      });
      if (idx > -1) {
        values.push(opts[idx].name);
      }
      if (this.params.column.colDef.field == 'logo_01') {
        this.copyValues.id = [event];
        // this.copyValues.values = values.join();
      } else {
        this.copyValues.id = event;
      }
      this.copyValues.values = values.join();
    }

    let arrLngth2 =
      this.params.column.colDef.field == 'logo_02' ? 1 : event.length;
    for (let i = 0; i < arrLngth2; i++) {
      let idx = _.findIndex(opts, {
        id: this.params.column.colDef.field == 'logo_02' ? event : event[i]
      });
      if (idx > -1) {
        values.push(opts[idx].name);
      }
      if (this.params.column.colDef.field == 'logo_03') {
        this.copyValues.id = [event];
        // this.copyValues.values = values.join();
      } else {
        this.copyValues.id = event;
      }
      this.copyValues.values = values.join();
    }

    let arrLngth3 =
      this.params.column.colDef.field == 'logo_03' ? 1 : event.length;
    for (let i = 0; i < arrLngth3; i++) {
      let idx = _.findIndex(opts, {
        id: this.params.column.colDef.field == 'logo_03' ? event : event[i]
      });
      if (idx > -1) {
        values.push(opts[idx].name);
      }
      if (this.params.column.colDef.field == 'logo_03') {
        this.copyValues.id = [event];
        // this.copyValues.values = values.join();
      } else {
        this.copyValues.id = event;
      }
      this.copyValues.values = values.join();
    }

    let arrLngth4 =
      this.params.column.colDef.field == 'logo_04' ? 1 : event.length;
    for (let i = 0; i < arrLngth4; i++) {
      let idx = _.findIndex(opts, {
        id: this.params.column.colDef.field == 'logo_04' ? event : event[i]
      });
      if (idx > -1) {
        values.push(opts[idx].name);
      }
      if (this.params.column.colDef.field == 'logo_04') {
        this.copyValues.id = [event];
        // this.copyValues.values = values.join();
      } else {
        this.copyValues.id = event;
      }
      this.copyValues.values = values.join();
    }

    if (this.params.node.data.isPowerLineRow) {
      let rowNd = this.gridApi.pinnedRowModel.pinnedTopRows[0];
      rowNd.setDataValue(this.params.column.colDef.field, this.copyValues);
      let itmObj = {
        item_id: rowNd.data.item_id,
        key: this.params.column.colDef.field,
        value: event
      };
      let prms = {
        ad_id: this.appService.adId,
        promotion_id: rowNd.data.promotion_id,
        items: [
          {
            item_id: rowNd.data.item_id,
            key: this.params.column.colDef.field,
            value: event
          }
        ]
      };
      this.adsService.promotionItems.items.push(itmObj);
    } else {
      let rowNd = this.gridApi.getDisplayedRowAtIndex(this.params.rowIndex);
      rowNd.setDataValue(this.params.column.colDef.field, this.copyValues);
      let itmObj = {
        item_id: rowNd.data.item_id,
        key: this.params.column.colDef.field,
        value: event
      };
      let prms = {
        ad_id: this.appService.adId,
        promotion_id: rowNd.data.promotion_id,
        items: [
          {
            item_id: rowNd.data.item_id,
            key: this.params.column.colDef.field,
            value: event
          }
        ]
      };
      this.adsService.promotionItems.items.push(itmObj);
    }

    // this.adsService
    //   .updateFeatureItems([{ url: 'updatePromotionsDetails' }, prms])
    //   .then(res => {});
  }
}
