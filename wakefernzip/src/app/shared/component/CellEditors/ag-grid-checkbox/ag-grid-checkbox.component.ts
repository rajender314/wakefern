import { Component, OnInit } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';

@Component({
  selector: 'app-ag-grid-checkbox',
  templateUrl: './ag-grid-checkbox.component.html',
  styleUrls: ['./ag-grid-checkbox.component.scss']
})
export class AgGridCheckboxComponent implements AgRendererComponent {
  public params: any;
  public gridApi: any;
  public chkVal = 'false';
  agInit(params: any): void {
    this.params = params;
    this.gridApi = params.api;
    this.chkVal = params.value;
    let rowNode = params.api.getDisplayedRowAtIndex(params.rowIndex);

    if (rowNode) {
      if (params.keyPress == 46) {
        this.gridApi.stopEditing();
        rowNode.setDataValue(params.column.colDef.field, false);
        return;
      }
    }
  }

  constructor(private adsService: AdsService, private appService: AppService) {}

  refresh(params: any): boolean {
    // params.data.crv = params.value;
    // params.api.refreshCells(params);
    this.chkVal =
      this.chkVal == 'true' || this.chkVal == '1' ? 'false' : 'true';
    let rowNd = this.gridApi.getDisplayedRowAtIndex(this.params.rowIndex);

    let prms = {
      ad_id: this.appService.adId,
      promotion_id: rowNd.data.promotion_id,
      items: [
        {
          item_id: rowNd.data.item_id,
          key: this.params.column.colDef.field,
          value: this.chkVal
        }
      ]
    };
    let itmObj = {
      item_id: rowNd.data.item_id,
      key: this.params.column.colDef.field,
      value: this.chkVal
    };
    this.adsService.promotionItems.items.push(itmObj);

    // this.adsService
    //   .updateFeatureItems([{ url: 'updatePromotionsDetails' }, prms])
    //   .then(res => {});

    return false;
  }
}
