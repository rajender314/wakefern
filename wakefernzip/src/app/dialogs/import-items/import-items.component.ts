import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';

// import { ImportParams } from '@app/shared/utility/types';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSnackBar,
  MatDialog
} from '@angular/material';
import { trigger, style, transition, animate } from '@angular/animations';
// import { SkuHistoryComponent } from '../sku-history/sku-history.component';
// import { ImportSkuComponent } from '../import-sku/import-sku.component';

import * as _ from 'lodash';
import { ImportValidationComponent } from '@app/dialogs/import-validation/import-validation.component';
import { ExcelUploaderComponent } from '@app/shared/component/excel-uploader/excel-uploader.component';
import { ImportExcelUploaderComponent } from '@app/dialogs/import-excel-uploader/import-excel-uploader.component';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';

const APP: any = window['APP'];

@Component({
  selector: 'app-import-items',
  templateUrl: './import-items.component.html',
  styleUrls: ['./import-items.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('leftAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(-100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ]),
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class ImportItemsComponent implements OnInit {
  public dialogRef: any;
  public rowData = [];
  public columnDefs = [];
  public noData: any;
  public disValBtn = true;
  public dataLoad = true;
  public gridVisibility = false;
  public pointerEvents = false;
  public gridApi;
  public gridColumnApi;
  public selectedFileInfo;
  public search = {
    placeHolder: 'Search...',
    value: ''
  };
  public authStatus = true;

  constructor(
    public dialog: MatDialog,
    public adsService: AdsService,
    private appService: AppService,
    private snackbar: MatSnackBar,
    public dialogRef1: MatDialogRef<ImportItemsComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}
  ngOnInit() {
    this.boxFileData();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    setTimeout(() => {
      this.autoSizeColumns();
    }, 100);

    this.gridApi.closeToolPanel();
    this.gridApi.sizeColumnsToFit();
    this.gridApi.forEachNode(node =>
      node.rowIndex ? 0 : node.setSelected(true)
    );
    this.disValBtn = false;
    setTimeout(() => {
      this.gridVisibility = true;
      this.dataLoad = false;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 800);
    }, 200);
  }

  onSearch(event) {
    this.search.value = event;
    if (event) {
      this.importValidationDailog({ action: 'search', searchKey: event });
    }
  }

  autoSizeColumns() {
    var autoSizeCols = ['chkbox'];
    this.gridColumnApi.autoSizeColumns(autoSizeCols);
  }

  importValidationDailog(data) {
    this.noData = false;
    this.dataLoad = true;
    this.adsService.importSearch = this.search.value;
    let dataCpy = Object.assign(data, this.data);
    if (data.action == 'vc') {
      this.dialogRef = this.dialog.open(ImportValidationComponent, {
        panelClass: ['overlay-dialog'],
        width: '750px',
        data: Object.assign(dataCpy, { fileInfo: this.selectedFileInfo })
      });
    } else {
      this.dialogRef = this.dialog.open(ImportValidationComponent, {
        panelClass: ['overlay-dialog'],
        width: '750px',
        data: dataCpy
      });
    }
    this.dialogRef.afterClosed().subscribe(res => {
      this.search.value = '';
      if (res.from == 'close') {
        this.noData = true;
        this.dataLoad = false;
        return;
      }
      if (res.data.result.data.status) {
        setTimeout(
          function() {
            this.dialogRef1.close(res.data.result);
          }.bind(this),
          100
        );
        // this.submitted = false;
      } else {
        this.noData = true;
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: res.data.result.data.message
              ? res.data.result.data.message
              : 'error occurred while Importing items'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }
  importUploader() {
    this.dialogRef = this.dialog.open(ImportExcelUploaderComponent, {
      panelClass: ['overlay-dialog'],
      width: '750px'
    });
    this.dialogRef.afterClosed().subscribe(res => {});
  }
  boxFileData() {
    this.adsService
      .displayBoxFiles({ ad_id: this.appService.adId }, err => {
        this.noData = true;
        this.dataLoad = false;
        this.authStatus = false;
      })
      .then(res => {
        if (res != undefined && res.result && res.result.success) {
          this.rowData = res.result.data.data;
          this.columnDefs = this.generateColumns(res.result.data.headers);
          const deleteIcon = {
            headerName: '',
            //  pinned: 'right',
            filter: false,
            enableFilter: false,
            cellClass: 'hideCol',
            cellRenderer: function(params) {
              if (params.data) {
                return `<span class="history-view"><em class="pixel-icons icon-delete"></em>Delete</span>`;
              }
            },
            onCellClicked: function(params) {
              params.api.selectIndex(params.node.rowIndex);
              const selectedRow = params.api.getSelectedRows();
              // this.revisionParams.ad_id = selectedRow[0].ad_id;
              // this.revisionParams.id = selectedRow[0].id;
              // this.revisionParams.pageNumber = 1;
              let parms = {
                ad_id: this.appService.adId,
                box_file_id: selectedRow[0].id,
                box_file_name: selectedRow[0].name,
                label: 'File'
              };
              const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
                panelClass: ['confirm-delete', 'overlay-dialog'],
                width: '500px',
                data: {
                  rowData: parms,
                  action: 'importItems',
                  selectedRow: '',
                  mode: 'delete'
                }
              });
              dialogRef.afterClosed().subscribe(result => {
                if (result.from == 'delete') {
                  if (result.case) {
                    this.boxFileData();
                    this.snackbar.openFromComponent(SnackbarComponent, {
                      data: {
                        status: 'success',
                        msg: 'File Deleted Successfully.'
                      },
                      verticalPosition: 'top',
                      horizontalPosition: 'right'
                    });
                  } else {
                    this.snackbar.openFromComponent(SnackbarComponent, {
                      data: {
                        status: 'fail',
                        msg: 'Error in File Delete.'
                      },
                      verticalPosition: 'top',
                      horizontalPosition: 'right'
                    });
                  }
                }
              });
              // this.deleteBoxFile(parms);
            }.bind(this),
            width: 40
          };
          const downloadIcon = {
            headerName: '',
            //  pinned: 'right',
            filter: false,
            enableFilter: false,
            cellClass: 'hideCol',
            cellRenderer: function(params) {
              if (params.data) {
                return `<span class="history-view"><em class="pixel-icons icon-download"></em>Download</span>`;
              }
            },
            onCellClicked: function(params) {
              params.api.selectIndex(params.node.rowIndex);
              const selectedRow = params.api.getSelectedRows();
              // this.revisionParams.ad_id = selectedRow[0].ad_id;
              // this.revisionParams.id = selectedRow[0].id;
              // this.revisionParams.pageNumber = 1;
              let parms = {
                ad_id: this.appService.adId,
                box_file_id: selectedRow[0].id,
                box_file_name: selectedRow[0].name,
                label: 'File'
              };
              const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
                panelClass: ['confirm-delete', 'overlay-dialog'],
                width: '500px',
                data: {
                  rowData: parms,
                  action: 'importItems',
                  selectedRow: '',
                  mode: 'download'
                }
              });

              dialogRef.afterClosed().subscribe(result => {
                if (result.from == 'download') {
                  if (result.case) {
                    window.open(result.result.result.data.path, '_self');
                    this.snackbar.openFromComponent(SnackbarComponent, {
                      data: {
                        status: 'success',
                        msg: 'File Downloaded Successfully.'
                      },
                      verticalPosition: 'top',
                      horizontalPosition: 'right'
                    });
                  } else {
                    this.snackbar.openFromComponent(SnackbarComponent, {
                      data: {
                        status: 'fail',
                        msg: 'Download Path Not Found.'
                      },
                      verticalPosition: 'top',
                      horizontalPosition: 'right'
                    });
                  }
                }
              });

              //   this.downloadFile(parms);
            }.bind(this),
            width: 40
          };
          this.columnDefs.push(deleteIcon);
          this.columnDefs.push(downloadIcon);

          if (this.rowData.length) {
            this.noData = false;
          } else {
            this.noData = true;
            this.dataLoad = false;
          }
          setTimeout(() => {
            // this.gridApi.sizeColumnsToFit();
            // this.gridApi.forEachNode(node =>
            //   node.rowIndex ? 0 : node.setSelected(true)
            // );
          }, 100);
        } else {
          this.dataLoad = false;
        }
      });
  }
  // downloadFile(params) {
  //   this.adsService
  //     .importBoxFile([{ url: 'downloadBoxFile' }, params])
  //     .then(res => {
  //       if (res.result.success) {
  //         window.open(res.result.data.path, '_self');
  //         this.snackbar.openFromComponent(SnackbarComponent, {
  //           data: {
  //             status: 'success',
  //             msg: 'File Downloaded Successfully.'
  //           },
  //           verticalPosition: 'top',
  //           horizontalPosition: 'right'
  //         });
  //       } else {
  //         this.snackbar.openFromComponent(SnackbarComponent, {
  //           data: {
  //             status: 'fail',
  //             msg: 'Error in File Download.'
  //           },
  //           verticalPosition: 'top',
  //           horizontalPosition: 'right'
  //         });
  //       }
  //     });
  // }

  // deleteBoxFile(params) {
  //   this.adsService
  //     .importBoxFile([{ url: 'deleteBoxFile' }, params])
  //     .then(res => {
  //       if (res.result.success) {
  //         this.boxFileData();
  //         this.snackbar.openFromComponent(SnackbarComponent, {
  //           data: {
  //             status: 'success',
  //             msg: 'File Deleted Successfully.'
  //           },
  //           verticalPosition: 'top',
  //           horizontalPosition: 'right'
  //         });
  //       } else {
  //         this.snackbar.openFromComponent(SnackbarComponent, {
  //           data: {
  //             status: 'fail',
  //             msg: 'Error in File Delete.'
  //           },
  //           verticalPosition: 'top',
  //           horizontalPosition: 'right'
  //         });
  //       }
  //     });
  // }

  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['tooltipValueGetter'] = params => params.value;
      if (data[i].key === 'name') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['checkboxSelection'] = true;
        temp['cellClass'] = 'radio-btn';
        temp['headerCheckboxSelection'] = false;
        temp['headerCheckboxSelectionFilteredOnly'] = true;
        temp['pinned'] = 'left';
        temp['cellRenderer'] = params => {
          if (params.data) {
            if (params.data.status == 'NEW') {
              return params.value
                ? `<span class="file-name">` +
                    params.value +
                    `</span>` +
                    `<span class="file-status adStatus">` +
                    params.data.status +
                    `</span>`
                : '';
            } else {
              return params.value;
            }
          } else {
            return params.value;
          }
        };
      }
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }

  onRowSelected() {
    this.selectedFileInfo = this.gridApi.getSelectedRows()[0];
  }
  close() {
    this.dialogRef1.close({ from: 'close' });
  }
}
