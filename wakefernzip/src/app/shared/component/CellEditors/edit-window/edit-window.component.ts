import { Component, OnInit, AfterViewInit } from '@angular/core';
import {
  ICellRendererAngularComp,
  ICellEditorAngularComp
} from 'ag-grid-angular';
import * as _ from 'lodash';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SearchGridComponent } from '@app/dialogs/search-grid/search-grid.component';
import { SnackbarComponent } from '../../snackbar/snackbar.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';

@Component({
  selector: 'app-edit-window',
  templateUrl: './edit-window.component.html',
  styleUrls: ['./edit-window.component.scss']
})
export class EditWindowComponent implements ICellRendererAngularComp {
  public currentVal = '';
  public rowData = {};
  public currentColKey = '';
  public copyColKey = '';
  public copyColHeader = '';
  public gridApi: any;
  public params;
  public imgSrc;
  public focusCell = true;

  constructor(
    public dialog: MatDialog,
    public _sanitizer: DomSanitizer,
    public snackbar: MatSnackBar,
    private appService: AppService,
    public adsService: AdsService
  ) {}

  agInit(params: any): void {
    // console.log( params);
    // this.appService.imgDelPres = false;
    this.params = params;
    // console.log(params)

    if (params.node.data[params.column.colDef.field].image_path != undefined) {
      this.imgSrc = params.node.data[params.column.colDef.field].image_path;
      // console.log(this.imgSrc)
    } else if (
      params.node.data[params.column.colDef.field].image_path == undefined
    ) {
      if (params.node.data[params.column.colDef.field] != '') {
        let a = JSON.parse(params.node.data[params.column.colDef.field]);
        // console.log(a)
        this.imgSrc = a.value.image_path;
      } else {
        this.imgSrc = params.node.data[params.column.colDef.field];
        // console.log(this.imgSrc)
      }
    }

    if (params.node.data.isPowerLineRow) {
      this.focusCell = false;
      return;
    } else {
      if (params.node.data[params.column.colDef.field] == '') {
        this.focusCell = false;
      } else {
        this.focusCell = true;
      }
    }

    this.appService.focusImgFlag = true;

    // console.log(this.imgSrc);
    this.currentVal = params.value;
    this.gridApi = params.api;

    // let rowNode = params.api.getDisplayedRowAtIndex(params.rowIndex);

    // if (rowNode) {
    //   this.rowData = rowNode.data;
    //   if (params.keyPress == 46) {
    //     this.gridApi.stopEditing();
    //     rowNode.setDataValue(params.column.colDef.field, '');
    //     return;
    //   }
    // }
    this.currentColKey = params.column.colDef.field;
    let totalColumns = params.column.columnApi.columnController.columnDefs;
    if (totalColumns.length) {
      let index = _.findIndex(<any>totalColumns, {
        field: this.currentColKey
      });
      this.copyColKey = index > 0 ? totalColumns[index - 1].field : '';
      this.copyColHeader = index > 0 ? totalColumns[index - 1].headerName : '';
    }
  }

  refresh(params: any): boolean {
    // console.log(params);
    this.params = params;
    // this.setOfferUnitCellValue(params);
    return true;
  }

  // setOfferUnitCellValue(params) {
  //   this.OfferUnitCellValue = params.value.values;
  // }
  getValue(): any {
    // const focusedCell = this.gridApi.getFocusedCell();
    // const rowNode = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
    // rowNode.setDataValue(this.currentColKey, this.currentVal);
    return this.currentVal;
  }
  updateVal() {
    this.currentVal = this.rowData[this.copyColKey];
    this.gridApi.stopEditing();
  }
  searchVal() {
    // if (!this.rowData[this.copyColKey]) {
    //   this.snackbar.openFromComponent(SnackbarComponent, {
    //     data: {
    //       status: 'fail',
    //       msg: this.copyColHeader + ' is empty'
    //     },
    //     verticalPosition: 'top',
    //     horizontalPosition: 'right'
    //   });
    //   return;
    // }
    // let dialogRef = this.dialog.open(SearchGridComponent, {
    //   panelClass: ['overlay-dialog'],
    //   width: '750px',
    //   data: {
    //     currentColKey: this.currentColKey,
    //     copyColKey: this.copyColKey,
    //     rowData: this.rowData,
    //     searchVal: this.rowData[this.copyColKey]
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result.from == 'confirm') {
    //     this.currentVal = result.selected[this.copyColKey];
    //     this.gridApi.stopEditing();
    //   } else {
    //   }
    // });

    let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      disableClose: true,
      data: {
        title: 'Add Promotion',
        // pageNumber: this.params.pageNumber,
        // pageSize: this.params.pageSize,
        // flag: 'ads_list',
        // skuValues: params.value,
        // skuPromoId: params.data.id,
        adId: this.appService.adId,
        promoId: this.params.node.data.promotion_id,
        itemId: this.params.node.data.item_id,
        from: 'promoImageDel',
        mode: 'delete',
        label: this.params.column.colDef.field,
        delItem: this.params.node.data[this.params.column.colDef.field]
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      // console.log(res);

      if (res.action == 'confirmed') {
        this.appService.imgDelPres = true;
        let itemsObj = {
          key: this.params.column.colDef.field,
          item_id: this.params.node.data.item_id,
          value: ''
        };
        this.adsService.promotionItems.ad_id = this.appService.adId;
        this.adsService.promotionItems.promotion_id = this.params.node.data.promotion_id;
        this.adsService.promotionItems.items.push(itemsObj);
        let rowNode = this.gridApi.getRowNode(this.params.node.data.item_id);
        // rowNode.setDataValue(this.params.column.colDef.field, '');
        // this.gridApi.refreshCells({
        //   force: true,
        //   rowNodes: [rowNode],
        //   columns: [this.params.column.colDef.field]
        // });

        // this.gridApi.stopEditing()

        // return

        this.adsService
          .updateFeatureItems([
            { url: 'updatePromotionsDetails' },
            this.adsService.promotionItems
          ])
          .then(res => {
            if (res.result.success) {
              let rowNode = this.gridApi.getRowNode(
                this.params.node.data.item_id
              );
              this.currentVal = '';
              this.gridApi.stopEditing();
              // rowNode.setDataValue(this.params.column.colDef.field, '');
              // this.gridApi.refreshCells({
              //   force: true,
              //   rowNodes: [rowNode],
              //   columns: [this.params.column.colDef.field]
              // });
              // this.params.node.data[this.params.column.colDef.field] = '';
              // this.appService.imgDelPres = true;

              // this.gridApi.stopEditing() ;
              // this.appService.imgDelPres = true;
            }
          });
      }
    });
  }
  valChanged() {}
}
