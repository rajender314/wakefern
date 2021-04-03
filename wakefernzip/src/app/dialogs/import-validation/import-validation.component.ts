import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSnackBar,
  MatDialog,
  MatDatepicker
} from '@angular/material';
import * as _ from 'lodash';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { getViewData } from '@angular/core/src/render3/state';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

const APP: any = window['APP'];

@Component({
  selector: 'app-import-validation',
  templateUrl: './import-validation.component.html',
  styleUrls: ['./import-validation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportValidationComponent implements OnInit {
  public basicSelect = [{ id: 1, name: 'select1' }, { id: 2, name: 'select2' }];
  public isSelectAll = '';
  public loadingMsg = '';
  public noDataMsg = '';
  public headerImg = APP.img_url + 'csv.png';
  public impData = {
    samplePath: '',
    url: '',
    title: '',
    format: '',
    container: '',
    fromComp: ''
  };
  public dsbleBtn = true;
  public impProg = false;
  public rowData = [];
  public columnDefs = [];
  public previewData = [];
  public noData: any;
  public dataLoad = true;
  public gridVisibility = false;
  public pointerEvents = false;
  public gridApi;
  public gridColumnApi;
  public search = {
    placeHolder: 'Search...',
    value: ''
  };
  public selectedFileInfo;
  public adTypeSelected = 'all';
  public validationStatus = 'initial';
  public validationProcess = false;
  public importSkuForm: FormGroup;
  public submitted = false;

  public importData: any;
  public skuAttributesData: any;
  public selectOptions: any;
  public attrControls: any;
  public subscription: any;
  public totalUploadData;
  public previewError = 'No Preview Available';
  public progress = false;
  public fileUploadStatus = false;
  public errorMsg = '';
  public intialCompFrom = '';
  public previewFilterForm: FormGroup;
  public previewStartMinDate: any;
  public previewStartMaxDate: any;
  public previewEndMinDate: any;
  public previewEndMaxDate: any;
  public Zone_options = [];
  public selected_zones = [];
  public downloadIcon = {
    headerName: '',
    pinned: 'right',
    filter: false,
    enableFilter: false,
    cellClass: 'hideCol',
    cellRenderer: function(params) {
      if (params.data) {
        return `<span class="history-view"><em class="pixel-icons icon-download"></em></span>`;
      }
    },
    onCellClicked: function(params) {
      params.api.selectIndex(params.node.rowIndex);
      const selectedRow = params.api.getSelectedRows();
      // console.log(selectedRow[0]);
      // const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      //   panelClass: ['confirm-delete', 'overlay-dialog'],
      //   width: '500px',
      //   data: {
      //     rowData: { label: 'File' },
      //     action: 'importValidation',
      //     selectedRow: '',
      //     mode: 'download'
      //   }
      // });
      // dialogRef.afterClosed().subscribe(result => {
      //   if (result.from == 'download') {
      if (selectedRow[0].cloud_download_path) {
        window.open(selectedRow[0].cloud_download_path, '_self');
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
      //   }
      // });

      // this.revisionParams.ad_id = selectedRow[0].ad_id;
      // this.revisionParams.id = selectedRow[0].id;
      // this.revisionParams.pageNumber = 1;
    }.bind(this),
    width: 40
  };
  public adSelectRadioOptions = [
    { name: 'All Ads', key: 'adType', value: 'all', checked: true },
    { name: 'Current Ad Only', key: 'adType', value: 'current', checked: false }
  ];
  public importHistoryHeaders = [
    {
      format: '',
      key: 'original_filename',
      name: 'FILE NAME',
      type: '',
      width: 110
    },
    {
      format: '',
      key: 'uploaded_by',
      name: 'UPLOADED BY',
      type: '',
      width: 110
    }
  ];
  public searchparams = {
    search: '',
    column_name: '',
    pageNumber: 1,
    pageSize: 30,
    ad_id: ''
  };
  public allAutoSizeColumns = [];
  constructor(
    public adsService: AdsService,
    private appService: AppService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<ImportValidationComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.impData.samplePath = this.data.samplePath;
    this.impData.title = this.data.title;
    this.impData.format = this.data.format;
    this.impData.container = this.data.container;
    this.impData.url = 'uploadFeatureItems';
    this.impData.fromComp = 'Items';
    this.search.value = this.adsService.importSearch;
    if (this.data.action == 'vc') {
      this.intialCompFrom = 'vc';
      this.loadingMsg = 'Loading, Please Wait';
      // this.getBoxFilesHistory();
      this.selectedFileInfo = this.data.fileInfo;
      this.uploadBoxFile('vc');
    } else if (this.data.action == 'search') {
      this.dsbleBtn = false;
      //  this.historyData();
      this.getBoxFilesHistory('init');
      // this.onSearch(this.adsService.importSearch);
    } else if (this.data.action == 'upload') {
      this.dataLoad = false;
    } else if (this.data.action == 'importHistory') {
      this.search.value = '';
      this.adsService.importSearch = '';
      this.adTypeSelected = 'current';
      this.getBoxFilesHistory('init');
    }
    this.previewFilterForm = new FormGroup({
      start_date: new FormControl(
        '',
        Validators.compose([Validators.required])
      ),
      end_date: new FormControl('', [Validators.required]),
      zones: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ])
    });
    // console.log(this.previewFilterForm)
    if (
      this.previewFilterForm.value.start_date == '' ||
      this.previewFilterForm.value.end_date == '' ||
      !this.previewFilterForm.value.zone.length
    ) {
      this.dsbleBtn = true;
    } else {
      this.dsbleBtn = false;
    }
  }
  historyData() {
    return;
    let params = {
      //     filename :
      // original_filename :
      // ad_id :
    };
    // this.adsService
    // .importBoxFile([{ url: 'getUploadedFileDetails' }, boxParams])
    // .then(res => {

    // })
  }
  uploadBoxFile(from) {
    this.validationProcess = true;
    let boxParams = {
      ad_id: this.appService.adId,
      box_file_id: this.selectedFileInfo.id,
      box_file_name:
        from == 'vc'
          ? this.selectedFileInfo.name
          : this.selectedFileInfo.original_filename,
      import: true
    };
    this.adsService
      .importBoxFile([{ url: 'uploadBoxFile' }, boxParams])
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            this.validationStatus = 'preview';
            this.totalUploadData = res.result.data;
            this.importData = this.totalUploadData;
            this.selectOptions = [...res.result.data.column_names];
            this.skuAttributesData = res.result.data.headers;
            this.createImportSkuForm();
            this.createAttributeControls();
            this.dataLoad = false;
            this.noData = false;
          } else {
            this.dataLoad = false;
            this.noData = true;
            this.noDataMsg = res.result.data.message
              ? res.result.data.message
              : 'File is not valid';
          }
        } else {
          this.validationStatus = 'initial';
          this.dataLoad = false;
          this.noData = true;
          this.noDataMsg = res.result.data.message
            ? res.result.data.message
            : 'File is not valid';
        }
        this.validationProcess = false;
      });
  }

  check(data, event) {
    this.adTypeSelected = data.value;
    this.dataLoad = true;
    this.getBoxFilesHistory('check');
  }

  onGridReady(params, action) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.closeToolPanel();
    if (action) {
      this.getData(action);
      return;
    }
    // this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
    this.gridApi.forEachNode(node =>
      node.rowIndex ? 0 : node.setSelected(true)
    );
    if (this.allAutoSizeColumns.length > 5) {
      this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
    } else {
      this.gridColumnApi.autoSizeColumns(['hideCol']);
      this.gridApi.sizeColumnsToFit();
    }

    // }
    setTimeout(() => {
      this.gridVisibility = true;
      this.dataLoad = false;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 800);
    }, 200);
  }
  getData(action) {
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
              'getFeatureItemsHistory',
              dataSource.this.searchparams
            )
            .subscribe(response => {
              // this.callProg = false;
              if (response['result'].success) {
                this.data = response['result'].data.data;
                dataSource.this.rowData = response['result'].data.data;
                if (response['result'].data.items == 0) {
                } else {
                  // dataSource.this.noUsers = false;
                }
                if (params.startRow === 0) {
                  dataSource.this.columnDefs = dataSource.this.generateColumns(
                    response['result'].data.headers
                  );
                  // setTimeout(() => {
                  dataSource.this.columnDefs.push(dataSource.this.downloadIcon);
                  dataSource.this.gridApi.setColumnDefs(
                    dataSource.this.columnDefs
                  );
                  // }, 1000);

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
                      // dataSource.this.gridApi.sizeColumnsToFit();
                    }, 800);
                  }, 100);
                  dataSource.this.gridApi.sizeColumnsToFit();

                  // if (dataSource.this.allAutoSizeColumns.length > 5) {
                  //   dataSource.this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
                  // } else {
                  //   dataSource.this.gridColumnApi.autoSizeColumns(['hideCol']);
                  //   dataSource.this.gridApi.sizeColumnsToFit();
                  // }
                  // }
                }
                dataSource.this.gridApi.sizeColumnsToFit();

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
  goBack() {
    // this.validationStatus = 'initial';
    // this.data.action = 'upload';
    if (this.validationStatus == 'initial') {
      // this.dialogRef.close({ from: 'close' });
    } else if (this.validationStatus == 'preview') {
      // console.log('preview close');
      this.validationStatus = 'initial';
      this.data.action = 'upload';
      // this.impProg = false;
    } else if (this.validationStatus == 'import') {
      // console.log('import close');
      this.validationStatus = 'preview';
      this.impProg = true;
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  close() {
    this.dialogRef.close({ from: 'close' });
  }

  createImportSkuForm() {
    this.importSkuForm = this.fb.group({
      skuAttributes: this.fb.array([])
    });
  }

  public get skuAttributes() {
    return this.importSkuForm.get('skuAttributes') as FormArray;
  }

  createAttributeControls() {
    var i = 0;
    this.skuAttributesData.map(attr => {
      // for(var i =0 ;i< this.skuAttributesData.length ; i++){
      this.skuAttributes.push(this.createAttributeGroup(attr, i));
      i++;
      // }
    });
    this.dsbleBtn = false;
  }

  createAttributeGroup(data, idx) {
    const keys = Object.keys(data);
    const controls = {};
    keys.forEach(prop => {
      controls[prop] = data[prop];
    });
    if (idx < this.selectOptions.length) {
      controls['selected_field'] =
        data.mandatory == 1 ? [idx, Validators.required] : idx;
    } else {
      controls['selected_field'] =
        data.mandatory == 1 ? ['', Validators.required] : '';
    }
    this.attrControls = controls;
    return this.fb.group(controls);
  }

  boxFileData() {
    this.adsService
      .displayBoxFiles({ ad_id: this.appService.adId }, err => {})
      .then(res => {
        if (res.result.success) {
          // res.result.data.headers.unshift({
          //   format: '',
          //   key: 'chkbox',
          //   name: '',
          //   type: 'text',
          //   width: 110
          // });
          this.rowData = res.result.data.data;
          this.columnDefs = this.generateColumns(res.result.data.headers);
          // const deleteIcon = {
          //   headerName: '',
          //   //  pinned: 'right',
          //   filter: false,
          //   enableFilter: false,
          //   cellClass: 'hideCol',
          //   cellRenderer: function(params) {
          //     if (params.data) {
          //       return `<span class="history-view"><em class="pixel-icons icon-delete"></em>Delete</span>`;
          //     }
          //   },
          //   onCellClicked: function(params) {
          //     params.api.selectIndex(params.node.rowIndex);
          //     const selectedRow = params.api.getSelectedRows();
          //     this.revisionParams.ad_id = selectedRow[0].ad_id;
          //     this.revisionParams.id = selectedRow[0].id;
          //     this.revisionParams.pageNumber = 1;
          //   }.bind(this),
          //   width: 40
          // };
          const downloadIcon = {
            headerName: '',
            //  pinned: 'right',
            filter: false,
            enableFilter: false,
            cellClass: 'hideCol',
            cellRenderer: function(params) {
              if (params.data) {
                return `<span class="history-view"><em class="pixel-icons icon-download"></em></span>`;
              }
            },
            onCellClicked: function(params) {
              params.api.selectIndex(params.node.rowIndex);
              const selectedRow = params.api.getSelectedRows();
              this.revisionParams.ad_id = selectedRow[0].ad_id;
              this.revisionParams.id = selectedRow[0].id;
              this.revisionParams.pageNumber = 1;
            }.bind(this),
            width: 40
          };
          // this.columnDefs.push(deleteIcon);
          this.columnDefs.push(downloadIcon);

          if (this.rowData.length) {
            this.noData = false;
          } else {
            this.noData = true;
            this.dataLoad = false;
          }
        }
      });
  }

  getBoxFilesHistory(from) {
    let params = {
      pageNumber: 1,
      pageSize: 20,
      search: this.search.value,
      ad_id: this.adTypeSelected == 'all' ? undefined : this.appService.adId
    };
    this.searchparams.ad_id =
      this.adTypeSelected == 'all' ? undefined : this.appService.adId;
    this.searchparams.search = this.search.value;
    if (from != 'init') {
      this.getData(this.data.action);
    }
    return;
    this.adsService.sendOuput('getFeatureItemsHistory', params).then(res => {
      if (res.result.success) {
        this.rowData = res.result.data.data;
        if (!this.columnDefs.length) {
          this.columnDefs =
            this.data.action == 'importHistory'
              ? this.generateColumns(this.importHistoryHeaders)
              : this.generateColumns(res.result.data.headers);
          const downloadIcon = {
            headerName: '',
            //  pinned: 'right',
            filter: false,
            enableFilter: false,
            cellClass: 'hideCol',
            cellRenderer: function(params) {
              if (params.data) {
                return `<span class="history-view"><em class="pixel-icons icon-download"></em></span>`;
              }
            },
            onCellClicked: function(params) {
              params.api.selectIndex(params.node.rowIndex);
              const selectedRow = params.api.getSelectedRows();
              // console.log(selectedRow[0]);
              if (selectedRow[0].cloud_download_path) {
                window.open(selectedRow[0].cloud_download_path, '_self');
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

              // this.revisionParams.ad_id = selectedRow[0].ad_id;
              // this.revisionParams.id = selectedRow[0].id;
              // this.revisionParams.pageNumber = 1;
            }.bind(this),
            width: 40
          };
          this.columnDefs.push(downloadIcon);
        }
        if (this.rowData.length) {
          this.noData = false;
        } else {
          this.noData = true;
          this.dataLoad = false;
        }
        if (this.gridApi) {
          setTimeout(() => {
            this.gridApi.forEachNode(node =>
              node.rowIndex ? 0 : node.setSelected(true)
            );
            // this.gridApi.sizeColumnsToFit();
          }, 200);
        }
      }
    });
  }

  generateColumns(data: any[]) {
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['tooltipValueGetter'] = params => params.value;
      if (data[i].key === 'name' || data[i].key === 'original_filename') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        if (this.data.action != 'importHistory') {
          temp['checkboxSelection'] = true;
          temp['cellClass'] = 'radio-btn text-transform-none';
          temp['headerCheckboxSelection'] = false;
          temp['headerCheckboxSelectionFilteredOnly'] = true;
          temp['pinned'] = 'left';
        } else {
          temp['cellClass'] = 'text-transform-none';
        }
        temp['cellRenderer'] = params => {
          if (params.data) {
            if (params.data.status == 'NEW') {
              return params.value
                ? `<span class="file-name">` +
                    params.value +
                    `</span>` +
                    `<span class="file-status">` +
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
      this.allAutoSizeColumns.push(data[i].key);
    }
    return columnDefinitions;
  }

  onSearch(event) {
    this.search.value = event;
    this.dataLoad = true;
    this.getBoxFilesHistory('search');
  }

  onRowSelected(event) {
    this.selectedFileInfo = this.gridApi.getSelectedRows()[0];
    this.selectedFileInfo.name = this.selectedFileInfo.original_filename;
  }

  ImportColumn() {
    this.submitted = true;
    this.errorMsg = '';
    if (this.data.action === 'search' && this.validationStatus == 'initial') {
      this.uploadFileItems();
      return;
    }
    if (this.validationStatus == 'initial') {
      this.dataLoad = true;
      this.validationProcess = true;
      this.data.action = 'vc';
      this.validationStatus = 'preview';
      this.validationProcess = false;
      this.dataLoad = false;
    } else if (this.validationStatus == 'preview') {
      if (this.importSkuForm.invalid) {
        this.errorMsg = 'Please map columns';
        return;
      }
      this.errorMsg = '';
      this.dataLoad = true;
      this.impProg = false;

      const headers = {};
      this.importSkuForm.value.skuAttributes.map(data => {
        if (data.selected_field > -1) {
          headers[data.key] = data.selected_field;
        }
      });
      this.selectedFileInfo = this.gridApi
        ? this.gridApi.getSelectedRows()[0]
        : this.selectedFileInfo;
      const params = {
        filename: this.selectedFileInfo.filename
          ? this.selectedFileInfo.filename
          : this.importData.file.filename,
        original_filename: this.selectedFileInfo.name
          ? this.selectedFileInfo.name
          : this.importData.file.original_name,
        headers: headers
        // empty_fields: this.emptyFields,
        // missing_records: this.missingRecords
      };
      const obj = { ad_id: this.appService.adId ? this.appService.adId : '' };
      this.adsService
        .getAdModules([
          { url: 'previewFeatureItems' },
          Object.assign(obj, params)
        ])
        .then(res => {
          this.validationStatus = 'import';
          // console.log(res);
          // this.toggleClass = false;
          if (res.result.success && res.result.data.status) {
            if (res.result.data.data) {
              this.Zone_options = [];
              this.previewData = res.result.data.data;
              this.columnDefs = this.generateColumns(res.result.data.headers);
              this.validationStatus = 'import';
              this.dataLoad = false;

              var start_date = res.result.data.dates.min_date;
              var end_date = res.result.data.dates.max_date;

              res.result.data.zones.map(zone => {
                this.Zone_options.push({ id: zone, name: zone });
              });

              this.Zone_options.forEach(obj => {
                this.selected_zones.push(obj.id);
              });

              this.previewStartMinDate = moment(start_date)['_d'];
              this.previewStartMaxDate = moment(end_date)['_d'];
              this.previewEndMinDate = moment(start_date)['_d'];
              this.previewEndMaxDate = moment(end_date)['_d'];
              this.previewFilterSetForm(res.result.data);
              if (!this.previewData.length) {
                this.noData = true;
                this.noDataMsg = 'No Records Found';
              } else {
                this.noData = false;
              }
            } else {
              // this.isNxtScreen = true;
              // this.isPreview = false;
              this.dataLoad = false;
              this.noData = true;
              this.noDataMsg = res.result.data.message
                ? res.result.data.message
                : 'No Preview Available';
            }
          } else {
            this.dataLoad = false;
            this.noData = true;
            this.noDataMsg = res.result.data.message
              ? res.result.data.message
              : 'No Preview Available';
          }
        });
    } else if (this.validationStatus == 'import') {
      if (this.importSkuForm.valid) {
        // this.previewData = [];
        this.impProg = true;
        this.dataLoad = true;
        this.dsbleBtn = true;
        this.loadingMsg = 'Importing, please wait ...';
        const headers = {};
        this.importSkuForm.value.skuAttributes.map(data => {
          if (data.selected_field > -1) {
            headers[data.key] = data.selected_field;
          }
        });
        const params = {
          filename: this.selectedFileInfo.filename
            ? this.selectedFileInfo.filename
            : this.importData.file.filename,
          original_filename: this.selectedFileInfo.name
            ? this.selectedFileInfo.name
            : this.importData.file.original_name,
          headers: headers,
          empty_fields: 'update',
          missing_records: 'update',
          ad_id: this.appService.adId,
          min_date: this.previewFilterForm.value.start_date
            ? moment(this.previewFilterForm.value.start_date).format(
                'MM/DD/YYYY'
              )
            : '',
          max_date: this.previewFilterForm.value.end_date
            ? moment(this.previewFilterForm.value.end_date).format('MM/DD/YYYY')
            : '',
          zones: this.previewFilterForm.value.zones
        };
        let boxParams = {
          ad_id: this.appService.adId,
          box_file_id: this.selectedFileInfo.id,
          box_file_name: this.selectedFileInfo.name,
          original_file_name: this.selectedFileInfo.name,
          headers: headers,
          import: true
        };
        let impParams = {
          url:
            this.intialCompFrom != 'vc'
              ? 'importFeatureItems'
              : 'importBoxFile',
          prms: this.intialCompFrom != 'vc' ? params : boxParams
        };
        // this.boxParams.box_file_name = this.importData.file.filename;
        // if (this.data.importFrm === 'BOX') {
        //   this.boxParams = Object.assign(this.boxParams, {
        //     original_file_name: this.selectedBoxFile.name
        //   });
        // }
        const obj = { ad_id: this.appService.adId ? this.appService.adId : '' };
        this.adsService.sendOuput(impParams.url, impParams.prms).then(res => {
          this.dialogRef.close({ data: res, from: 'importProcess' });
          this.impProg = false;
        });
        // setTimeout(() => {
        //   this.loadingMsg = 'File has been Imported Successfully';
        // }, 1500);
        // this.close();
      }
    }
  }

  previewFilterSetForm(data) {
    let a: any;
    let b: any;
    a = moment(data.dates.min_date, 'MM-DD-YYYY').format('YYYY-MM-DD');
    b = moment(data.dates.max_date, 'MM-DD-YYYY').format('YYYY-MM-DD');

    // console.log( moment(a).toISOString())
    // console.log( moment(data.dates.min_date))
    this.previewFilterForm.patchValue({
      start_date: moment(a).toISOString(),
      end_date: moment(b).toISOString(),
      zones: data.ad_details.zones
    });
  }
  uploadFileItems() {
    this.errorMsg = '';
    let prms = {
      filename: this.selectedFileInfo.filename,
      original_filename: this.selectedFileInfo.original_filename,
      ad_id: this.appService.adId
    };
    this.adsService.sendOuput('getUploadedFileDetails', prms).then(res => {
      if (res.result.success) {
        this.dataLoad = true;

        if (res.result.data.status) {
          this.validationProcess = true;
          this.selectOptions = [...res.result.data.column_names];
          this.skuAttributesData = res.result.data.headers;
          this.createImportSkuForm();
          this.createAttributeControls();
          setTimeout(() => {
            this.data.action = 'vc';
            this.validationStatus = 'preview';
            this.validationProcess = false;
          }, 1000);
          this.dataLoad = false;
        } else {
          this.dataLoad = false;
          this.errorMsg = res.result.data.message;
        }
      }
    });
  }
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  dateValueChange(field, event) {
    if (field == 'start_date') {
      this.previewEndMinDate = moment(event.value).add(1, 'days')['_d'];
    }
    if (field == 'end_date') {
      this.previewStartMaxDate = moment(event.value).subtract(1, 'days')['_d'];
    }
  }
  zoneValChanged() {
    if (!this.previewFilterForm.value.zones.length) {
      this.dsbleBtn = true;
    } else {
      this.dsbleBtn = false;
    }
    // this.previewFilterForm.value.start_date=moment(this.previewFilterForm.value.start_date).format("MM/DD/YYYY");
    // this.previewFilterForm.value.end_date=moment(this.previewFilterForm.value.end_date).format("MM/DD/YYYY");
    // console.log(this.previewFilterForm.value);
  }
  // fileUploadStart(event) {}
  // fileUploadDone(event) {}
  // importSuccess(event) {}
  // importStarts(event) {}

  importSuccess(val) {
    this.progress = !val.status;
    this.dialogRef.close({ from: 'success' });
    this.snackbar.openFromComponent(SnackbarComponent, {
      data: {
        status: 'success',
        msg: this.impData.title + ' Imported Successfully'
      },
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
  importStarts(val) {
    this.progress = !val.status;
  }
  fileUploadStart(val) {
    this.fileUploadStatus = false;
    this.dsbleBtn = true;
  }
  fileUploadDone(val) {
    // console.log(val);
    this.dsbleBtn = false;
    this.fileUploadStatus = true;
    this.totalUploadData = val.data;
    this.importData = this.totalUploadData;
    this.selectOptions = [...val.data.column_names];
    this.skuAttributesData = val.data.headers;
    this.selectedFileInfo = this.totalUploadData.file;
    this.selectedFileInfo.name = this.selectedFileInfo.original_name;

    this.createImportSkuForm();
    this.createAttributeControls();
  }
  valChanged(event) {
    this.errorMsg = '';
  }
}
