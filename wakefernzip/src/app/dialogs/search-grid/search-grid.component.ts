import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-search-grid',
  templateUrl: './search-grid.component.html',
  styleUrls: ['./search-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchGridComponent implements OnInit {
  public rowData = [];
  public columnDefs = [];
  public noData: any;
  public dataLoad = true;
  public gridVisibility = false;
  public pointerEvents = false;
  public gridApi;
  public gridColumnApi;
  public subscription: any;
  public searchparams = {
    search: '',
    column_name: '',
    pageNumber: 1,
    pageSize: 30
  };
  public callProg = false;
  constructor(
    public dialogRef: MatDialogRef<SearchGridComponent>,
    public adsService: AdsService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    (this.searchparams.search = this.data.rowData[this.data.copyColKey]),
      (this.searchparams.column_name = this.data.copyColKey),
      setTimeout(() => {
        // this.searchData();
      }, 1000);
  }
  searchData() {
    let params = {
      search: this.data.rowData[this.data.copyColKey],
      column_name: this.data.copyColKey
    };
    this.adsService.sendOuput('searchPromotionData', params).then(res => {
      this.rowData = res.result.data.data;
      // res.result.data.headers.unshift({
      //   format: '',
      //   key: 'chkbox',
      //   name: '',
      //   type: 'text',
      //   width: 110
      // });
      this.columnDefs = this.generateColumns(res.result.data.headers);
      if (this.rowData.length) {
        this.noData = false;
      } else {
        this.noData = true;
        this.dataLoad = false;
      }
    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.getData();
    this.autoSizeColumns();
    this.gridApi.closeToolPanel();
    this.gridApi.sizeColumnsToFit();
    this.gridApi.forEachNode(node =>
      node.rowIndex ? 0 : node.setSelected(true)
    );
    setTimeout(() => {
      this.gridVisibility = true;
      this.dataLoad = false;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 800);
    }, 200);
  }

  autoSizeColumns() {
    var autoSizeCols = ['chkbox'];
    this.gridColumnApi.autoSizeColumns(autoSizeCols);
  }

  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['tooltipValueGetter'] = params => params.value;
      if (data[i].key === 'apex_headline' || data[i].key === 'apex_body_copy') {
        temp['checkboxSelection'] = true;
        temp['cellClass'] = 'radio-btn';
        temp['headerCheckboxSelection'] = false;
        temp['headerCheckboxSelectionFilteredOnly'] = true;
        temp['pinned'] = 'left';
      }
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }

  onRowSelected(event) {}

  import() {
    this.dialogRef.close({
      selected: this.gridApi.getSelectedRows()[0],
      from: 'confirm'
    });
  }
  close() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.dialogRef.close({ from: 'close' });
  }
  getData() {
    let dataSource = {
      this: this,
      rowCount: null,
      getRows: function(params) {
        // if(this.callProg){
        //   return ;
        // }
        // this.callProg = true;
        setTimeout(function() {
          dataSource.this.searchparams.pageNumber = Math.floor(
            params.endRow / 30
          );
          dataSource.this.subscription = dataSource.this.adsService
            .sendOuputSubscription(
              'searchPromotionData',
              dataSource.this.searchparams
            )
            .subscribe(response => {
              // this.callProg = false;
              if (response['result'].success) {
                this.data = response['result'].data.data;
                dataSource.this.rowData = response['result'].data;
                if (response['result'].data.items == 0) {
                } else {
                  // dataSource.this.noUsers = false;
                }
                if (params.startRow === 0) {
                  dataSource.this.columnDefs = dataSource.this.generateColumns(
                    response['result'].data.headers
                  );
                  dataSource.this.gridApi.setColumnDefs(
                    dataSource.this.columnDefs
                  );
                  if (dataSource.this.rowData.length) {
                    dataSource.this.noData = false;
                  } else {
                    dataSource.this.noData = true;
                    // dataSource.this.dataLoad = false;
                  }
                  setTimeout(() => {
                    dataSource.this.dataLoad = false;
                    dataSource.this.gridVisibility = true;
                    dataSource.this.dataLoad = false;
                    setTimeout(() => {
                      dataSource.this.pointerEvents = true;
                      dataSource.this.gridApi.forEachNode(node =>
                        node.rowIndex ? 0 : node.setSelected(true)
                      );
                    }, 800);
                  }, 100);
                  dataSource.this.gridApi.sizeColumnsToFit();
                }
                var allUsers = response['result'].data.data;
                var totalUsers = response['result'].data.count;
                let pgSize =
                  totalUsers >
                  dataSource.this.searchparams.pageSize *
                    (dataSource.this.searchparams.pageNumber + 1)
                    ? dataSource.this.searchparams.pageSize *
                      (dataSource.this.searchparams.pageNumber + 1)
                    : totalUsers;
                params.successCallback(allUsers, pgSize);
                // dataSource.this.userSpinner = false;
              } else {
                // dataSource.this.userSpinner = true;
              }
            });
        }, 500);
      }
    };
    this.gridApi.setDatasource(dataSource);
  }
}
