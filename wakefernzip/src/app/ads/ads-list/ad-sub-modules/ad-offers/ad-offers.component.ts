import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  HostListener
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { AppService } from '@app/app.service';

const APP: any = window['APP'];
import * as _ from 'lodash';
import { ImageAssestsComponent } from '@app/dialogs/image-assests/image-assests.component';
import { AdsService } from '@app/ads/ads.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { GridOptions } from 'ag-grid-community';
import { SaveViewComponent } from '@app/dialogs/save-view/save-view.component';
import { CustomTooltipComponent } from '@app/shared/component/custom-tooltip/custom-tooltip.component';
import { NumericEditor } from '@app/shared/component/CellEditors/numeric-editor.component';
import { PriceEditor } from '@app/shared/component/CellEditors/price-editor.component';
import { ImageEditor } from '@app/shared/component/CellEditors/image-editor.component';
import { DateEditorComponent } from '@app/shared/component/CellEditors/date-editor/date-editor.component';
import * as moment from 'moment';
import { ImportItemsComponent } from '@app/dialogs/import-items/import-items.component';
import { ImportValidationComponent } from '@app/dialogs/import-validation/import-validation.component';
import { debug } from 'util';
import { OfferUnitCellComponent } from '@app/shared/component/CellEditors/offer-unit-cell/offer-unit-cell.component';
import { Title } from '@angular/platform-browser';
import { AdSubModulesComponent } from '../ad-sub-modules.component';

@Component({
  selector: 'app-ad-offers',
  templateUrl: './ad-offers.component.html',
  styleUrls: ['./ad-offers.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class AdOffersComponent implements OnInit {
  public subheadersList: any;
  public image_url = APP.img_url;
  public routeUrl: any;
  public rowData = [];
  public samplePath: any;
  public columnDefs = [];
  public gridApi: any;
  public currentTabData: any;
  public gridColumnApi;
  public headersData = [];
  public noData: any;
  public rowClassRules: any;
  public cellClassRules: any;
  public progress = true;
  public calculateCount = false;
  public fromViewChange = false;
  public numbers = [];
  public active = [];
  public boxFiles = [];
  public selectedRow = [];
  public minLimit: number;
  public maxLimit: number;
  public displayRange: number;
  public pageCount: number;
  public totalCount: number;
  public editProgress: any;
  public dialogRef: any;
  public listData: any;
  public saveViewGroup: FormGroup;
  public defaultColDef;
  public getRowNodeId;
  private rowSelection;
  private rowGroupPanelShow;
  private autoGroupColumnDef;
  public disableColumns: any;
  public remainingColumnsInGrid = [];
  public cachedAdOffersColumns = [];
  public allAutoSizeColumns = [];
  public visibleColumnsCount: number;
  public savedViewOptions = [];
  public remainedColDefs = [];
  public defaultGridInfo = [];
  public dummyUndoRedoObj = [];
  public navIdx;
  public adName: any;
  public imageInfo: any;
  public selectedSaveView: any;
  public frameworkComponents: any;
  public revisionsHistoryData = [];
  dataLoad = true;
  revisionDataStatus = true;
  public revProgress = true;
  public savedViewValue: any;
  public params = {
    search: '',
    pageSize: '',
    ad_id: '',
    pageNumber: ''
  };
  public revisionParams = {
    ad_id: '',
    id: '',
    pageNumber: 1,
    pageSize: 10
  };
  public currentChange = '';
  public domRevisionHistory = [];
  public canUndoDone = false;
  public canRedoDone = false;
  public currentDomRevision = -1;
  public gridVisibility = false;
  public pointerEvents = false;
  public isDailogOpen = false;
  public enableImportPer;
  public currentDefImg = '';
  public cellEdited = true;
  public lastUpdatedData = '@45#6||789';
  public newTriggerClr = false;
  public lastEditBfVal = '';

  @ViewChild('offerRevisions') public offersRevisionNav: MatSidenav;

  public gridOptions: GridOptions;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    public adsService: AdsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    protected localStorage: LocalStorage,
    public fb: FormBuilder,
    private titleService: Title,
    public adsubmodule: AdSubModulesComponent
  ) {
    // this.defaultColDef = {
    //   sortable: true,
    //   tooltipComponent: 'customTooltipComponent'
    // };
    this.getRowNodeId = function(data) {
      return data.id;
    };
    this.frameworkComponents = {
      numericEditor: NumericEditor,
      priceEditor: PriceEditor,
      imageEditor: ImageEditor,
      dateEditor: DateEditorComponent,
      customTooltipComponent: CustomTooltipComponent,
      offerUnitCellRenderer: OfferUnitCellComponent
    };
  }

  ngOnInit() {
    this.titleService.setTitle('Offers');

    this.adsService.hideHeader = false;

    // console.log(this.appService.configLabels);

    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'ADS'
      });
      if (i < 0) {
        // if users module not- allowed for user based on permissions
        this.router.navigateByUrl('access-denied');
        return;
      }
      if (this.appService.headerPermissions['VIEW_OFFERS']) {
        this.enableImportPer = this.appService.headerPermissions
          ? this.appService.headerPermissions['CREATE_EDIT_OFFERS']
          : true;
        // console.log(this.appService.headerPermissions);
        this.getList();
        this.calculateCount = true;
      } else {
        this.router.navigateByUrl('access-denied');
      }
    } else {
      this.router.navigateByUrl('access-denied');
    }
  }

  getList() {
    this.currentTabData = this.appService.getListData('Others', 'OFFERS');
    this.selectedList(this.currentTabData);
    this.savedViewValue = 1;
    this.router.navigateByUrl(
      'vehicles/' + this.appService.adId + '/' + this.currentTabData.url
    );
    this.adName = this.appService.adName;
  }

  compareValues(params) {
    if (params.oldValue > params.newValue) {
      //make it red
    }
    if (params.oldValue < params.newValue) {
      //make it green
    }
  }

  selectedList(list) {
    this.rowData = []; // setting eampty because of after importing files from csv and box, grid and spinner both displaying...
    this.params.ad_id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        this.rowData = res.result.data.data;
        if (this.rowData.length) {
          this.getSavedViews();
          this.noData = false;
        } else {
          this.dataLoad = false;
          this.noData = true;
        }

        this.samplePath = res.result.data.samplePath
          ? res.result.data.samplePath
          : '';
        this.listData = list;
        this.totalCount = res.result.data.count;
        // this.calculatePagesCount();
        setTimeout(() => {
          if (this.gridColumnApi) {
            this.autoSizeColumns();
          }
        });
        this.headersData = res.result.data.headers;
        this.disableColumns = res.result.data.disableColumns;
        this.columnDefs = this.generateColumns(this.headersData);
        const revisionHistory = {
          headerName: '',
          pinned: 'right',
          filter: false,
          enableFilter: false,
          cellClass: 'hideCol',
          cellRenderer: function(params) {
            if (params.data) {
              return `<span class="history-view"><em class="pixel-icons icon-revision"></em></span>`;
            }
          },
          onCellClicked: function(params) {
            params.api.selectIndex(params.node.rowIndex);
            const selectedRow = params.api.getSelectedRows();
            this.revisionParams.ad_id = selectedRow[0].ad_id;
            this.revisionParams.id = selectedRow[0].id;
            this.revisionParams.pageNumber = 1;
            this.revisionsHistoryData = [];
            this.openRevisions();
          }.bind(this),
          // template:
          //   '<span class="history-view"><em class="pixel-icons icon-revisions"></em></span>',
          width: 40
        };
        this.columnDefs.push(revisionHistory);
        this.rowClassRules = {
          'row-updated': function(params) {
            return params.data ? params.data.flag === 'updated' : '';
          },
          'row-inserted': function(params) {
            return params.data ? params.data.flag === 'inserted' : '';
          },
          'row-deleted': function(params) {
            return params.data ? params.data.flag === 'deleted' : '';
          }
        };
        this.rowSelection = 'multiple';
        this.rowGroupPanelShow = 'false';
      });
  }

  // calculatePagesCount() {
  //   if (this.calculateCount) {
  //     this.pageCount = this.totalCount / this.params.pageSize;
  // this.pageCount = Math.ceil(this.pageCount);
  //     this.editProgress = false;
  //     for (var i = 1; i <= this.pageCount; i++) {
  //       this.numbers.push(i);
  //       this.active[i] = false;
  //     }
  //     this.active[1] = true;
  //     this.minLimit = 0;
  //     this.displayRange = 5;
  //     this.maxLimit = this.minLimit + this.displayRange;
  //   }
  //   this.calculateCount = false;
  // }

  loadMore(param) {
    this.dataLoad = true;
    let num = param;
    let indx;
    for (let i = 1; i <= this.numbers.length; i++) {
      if (this.active[i] === true) {
        indx = i;
      }
    }
    if (param === 'prev') {
      num = indx - 1;
    }
    if (param === 'next') {
      num = indx + 1;
    }
    for (let i = 1; i <= this.numbers.length; i++) {
      this.active[i] = false;
    }
    if (num === 1) {
      this.minLimit = num - 1;
    } else if (num === this.numbers.length) {
      this.minLimit = num - this.displayRange;
    } else {
      this.minLimit = num - 2;
    }
    this.maxLimit = this.minLimit + this.displayRange;
    if (this.maxLimit > this.numbers.length) {
      this.minLimit = this.numbers.length - this.displayRange;
    }
    this.active[num] = !this.active[num];
    this.params.pageNumber = num;
    this.selectedList(this.currentTabData);
  }
  importExcelDailog() {
    this.dialogRef = this.dialog.open(ImportItemsComponent, {
      panelClass: ['csv-import', 'overlay-dialog'],
      width: '600px',
      data: {
        title: 'Items',
        samplePath: this.samplePath,
        format: 'csv',
        container: 'featureItems',
        length: this.rowData.length,
        importFrm: 'EXCEL'
      }
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.afterDailogClose(result);
    });
  }
  afterDailogClose(result) {
    if (result.from !== 'close') {
      this.dataLoad = true;
      this.noData = false;
      this.calculateCount = true;
      this.savedViewValue = 1;
      this.selectedList(this.currentTabData);

      this.adsService.checkAdImportStatus(this.appService.adId).then(res => {
        if (!res.result.data.isLockImport) {
          this.adsService.alive = false;
          this.adsService.isImportProgess = false;
          this.adsService.editPermission = true;
          console.log(55555);
        } else {
          console.log(66666666);

          this.adsubmodule.importTimer();

          this.adsService.alive = true;
          this.adsService.isImportProgess = true;
          this.adsService.editPermission = false;

          if (res.result.data.action) {
            console.log(888888);

            this.adsService.importProgStatus = res.result.data.message;
            if (res.result.data.action == 'pending') {
              this.adsService.importProgVal = 25;
            } else if (res.result.data.action == 'processing') {
              this.adsService.importProgVal = 60;
            } else if (res.result.data.action == 'completed') {
              console.log(222);
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Items Data Imported Successfully'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              // this.selectedList(this.currentTabData);
              setTimeout(() => {
                window.location.reload();
              }, 500);
            } else {
              this.adsService.importProgVal = 15;
            }
          }
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: res.result.data.message
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      });
      this.selectedList(this.currentTabData);

      const params = {
        search: '',
        pageSize: 20,
        id: this.appService.adId,
        pageNumber: 1
      };
      this.adsService.getAdsDetails(params).then(res => {
        this.appService.adDetails = res.result.data;
        this.appService.baseVersionDetails = res.result.data.base_version_info;
      });
    }
  }

  importBoxDailog() {
    this.dialogRef = this.dialog.open(ImportItemsComponent, {
      panelClass: ['csv-import', 'overlay-dialog'],
      width: '600px',
      data: {
        title: 'Items',
        boxFiles: this.boxFiles,
        ad_id: this.params.ad_id,
        importFrm: 'BOX'
      }
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.afterDailogClose(result);
    });
  }

  openSaveView() {
    this.gridApi.closeToolPanel();
    const gridInfo = {
      groupInfo: this.gridColumnApi.getRowGroupColumns(),
      filterInfo: this.gridApi.getFilterModel(),
      valColumnInfo: this.gridColumnApi.getValueColumns(),
      allColumnsInfo: this.gridColumnApi.getAllColumns(),
      pivoteMode: this.gridColumnApi.isPivotMode(),
      allPivoteColumns: this.gridColumnApi.getPivotColumns(),
      sortColumns: this.gridApi.getSortModel()
    };
    const filteredGridValues = this.adsService.getGridInfo(gridInfo);
    this.dialogRef = this.dialog.open(SaveViewComponent, {
      panelClass: ['save-view-dialog', 'overlay-dialog'],
      data: {
        grid_info: filteredGridValues,
        from: 'offers'
      }
    });
    this.dialogRef.afterClosed().subscribe(res => {
      if (res && res.data.result.success) {
        this.getSavedViews();
        this.savedViewValue = res.data.result.data._id;
      }
    });
  }

  getSelectedView(params) {
    this.fromViewChange = true;
    const index = _.findIndex(this.savedViewOptions, { _id: params });
    const currentGridInfo =
      index > -1 ? this.savedViewOptions[index].grid_info : [];
    this.setGridOptions(currentGridInfo);
  }

  // To Open revisions history side nav
  openRevisions() {
    this.offersRevisionNav.open();
    this.revProgress = true;
    this.adsService
      .getAdModules([{ url: 'getOfferRevision' }, this.revisionParams])
      .then(res => {
        if (res.result.success && res.result.data.length) {
          this.revisionsHistoryData = this.revisionsHistoryData.length
            ? this.revisionsHistoryData.concat(res.result.data)
            : res.result.data;
          res.result.data.length < this.revisionParams.pageSize
            ? (this.revisionDataStatus = false)
            : (this.revisionDataStatus = true);
          this.revProgress = false;
          if (this.revisionsHistoryData.length) {
            this.offersRevisionNav.open();
          }
        } else if (!this.offersRevisionNav.opened) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: 'Revisions Not Found'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        } else {
          // this.revisionsHistoryData = [];
          this.revProgress = false;
        }
      });
  }
  // To revert from new value to old value
  updateRecord(record) {
    this.gridApi.clearRangeSelection();
    this.offersRevisionNav.close();
    const rowNode = this.gridApi.getRowNode(record.item_id);
    rowNode.setDataValue(record.column_key, record.old_value);
    this.gridApi.setFocusedCell(rowNode.rowIndex, record.column_key, null);
    this.gridApi.flashCells({
      rowNodes: [rowNode],
      columns: [record.column_key]
    });
    this.snackbar.openFromComponent(SnackbarComponent, {
      data: {
        status: 'success',
        msg: 'Value Updated'
      },
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  // on scroll down event inifinite scroll in revisions tab
  onScrollDown() {
    this.revisionParams.pageNumber = this.revisionParams.pageNumber + 1;
    if (this.revisionDataStatus) {
      this.openRevisions();
    }
  }

  importOffersHistory() {
    let dialogRef = this.dialog.open(ImportValidationComponent, {
      panelClass: ['overlay-dialog'],
      width: '750px',
      data: {
        action: 'importHistory',
        container: 'featureItems',
        format: 'csv',
        importFrm: 'EXCEL',
        length: 20028,
        samplePath: '',
        searchKey: '',
        title: ''
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      // console.log('history files popup closed!');
    });
  }

  setGridOptions(gridinfo) {
    // tslint:disable-next-line:prefer-const
    let allFields = [],
      colKeys = [],
      rowGroupFields = [],
      filters = [],
      pivoteMode = false,
      pivoteColumns = [],
      sortColumns = [];
    if (gridinfo) {
      colKeys = gridinfo['inVisibleColumnsInfo'] || [];
      filters = gridinfo['filterInfo'] ? gridinfo['filterInfo'][0] || [] : [];
      rowGroupFields = gridinfo['groupInfo'] || [];
      pivoteMode = gridinfo['pivoteMode'] || false;
      pivoteColumns = gridinfo['pivoteColumns'] || [];
      sortColumns = gridinfo['sortColumns'] || [];
    }
    if (this.gridColumnApi) {
      const columns = this.gridColumnApi.getAllColumns();
      columns.forEach(column => {
        allFields.push(column['colId']);
        if (!column['visible']) {
          this.gridColumnApi.setColumnVisible(column['colId'], true);
        }
      });

      this.visibleColumnsCount = columns.length - colKeys.length;
      this.gridColumnApi.removeRowGroupColumns(allFields);
      this.gridColumnApi.setColumnsVisible(colKeys, false);
      this.gridColumnApi.setPivotMode(pivoteMode);
      this.gridColumnApi.addRowGroupColumns(rowGroupFields);
      this.gridColumnApi.removePivotColumns(allFields);
      this.gridColumnApi.setPivotColumns(pivoteColumns);
      this.gridApi.setFilterModel(filters);
      this.gridApi.setSortModel(sortColumns);
      this.applyStickyFilters();
    }
  }

  getSavedViews() {
    this.adsService
      .getSavedOfferViews({ ad_id: this.appService.adId })
      .then(res => {
        this.savedViewOptions = res.result.data;
        this.savedViewOptions.unshift({ name: 'Default', _id: 1 });
        this.getSelectedView(this.savedViewValue);
      });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.gridColumnApi.addRowGroupColumns(['promo_id']);
    this.gridApi.closeToolPanel();
    this.applyStickyFilters();
    this.autoSizeColumns();
  }

  applyStickyFilters() {
    const filtersObj = {
      ad_id: this.appService.adId,
      key: 'offers'
    };
    const stickyObj = this.adsService.getStickyFilters(filtersObj);
    this.gridApi.setFilterModel(stickyObj.filters);
    //  this.gridApi.setSortModel(stickyObj.sort);
    this.totalCount = this.gridApi.getModel().rootNode.childrenAfterFilter.length;

    if (this.visibleColumnsCount < 8) {
      this.gridApi.sizeColumnsToFit();
    } else {
      this.autoSizeColumns();
    }
    setTimeout(() => {
      this.dataLoad = false;
      this.gridVisibility = true;
      setTimeout(() => {
        this.pointerEvents = true;
      }, 1800);
    }, 200);
  }

  onColumnRowGroupChanged(params) {
    // when ever we add new rowgroup or remove added row group this will trigger.
    this.totalCount = this.gridApi.getModel().rootNode.childrenAfterFilter.length;
  }

  onCellMouseOver(params) {
    // Need to show Image popup  on Hover
  }

  onCellDoubleClicked(params) {
    if (params.data && params.data.flag === 'deleted') {
      this.gridApi.stopEditing();
    }
  }

  onFilterChanged(params) {
    if (!this.fromViewChange) {
      const filtersObj = {
        ad_id: this.appService.adId,
        offers: {
          filters: this.gridApi.getFilterModel(),
          sort: this.gridApi.getSortModel()
        },
        promotions: '',
        key: 'offers'
      };
      this.adsService.setStickyFilters(filtersObj);
      this.totalCount = this.gridApi.getModel().rootNode.childrenAfterFilter.length;
    }
    this.fromViewChange = false;
  }

  onSortChanged(params) {
    if (!this.fromViewChange) {
      const filtersObj = {
        ad_id: this.appService.adId,
        offers: {
          filters: this.gridApi.getFilterModel(),
          sort: this.gridApi.getSortModel()
        },
        promotions: '',
        key: 'offers'
      };
      this.adsService.setStickyFilters(filtersObj);
    }
  }

  autoSizeColumns() {
    // var allColumnIds = [];
    // this.gridColumnApi.getAllColumns().forEach(function(column) {
    //   if (column.colId != 'ad_details') allColumnIds.push(column.colId);
    // });
    this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
  }
  generateColumns(data: any[]) {
    this.allAutoSizeColumns = ['flag', 'version', 'method', 'unit'];
    const columnDefinitions = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};

      if (data[i].key === 'image') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        temp['tooltipComponentParams'] = data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<img class="img-responsive offer-img" src="
            ` +
                params.data.image +
                `">`
            : '';
        };
        temp['valueGetter'] = params => {
          if (params.data) {
            let dummyJson = {
              id: params.data ? params.data.id : '',
              col: params.data ? 'image' : ''
            };
            return JSON.stringify(dummyJson);
          }
        };
        temp['keyCreator'] = params => {
          try {
            var parsed = JSON.parse(params.value);
          } catch (e) {
            // Oh well, but whatever...
          }

          //  let parseVal = params.newValue ? parsed : params.newValue;
          let idx1 = _.findIndex(this.rowData, {
            id: parsed ? parsed.id : params.value
          });
          if (idx1 > -1) {
            return this.rowData[idx1].image;
          } else {
            return params.value;
          }
        };
      } else if (data[i].key === 'logos') {
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['cellClass'] = 'fetured-img';
        // temp['tooltipComponentParams'] =  data[i].key;
        temp['cellRenderer'] = params => {
          return params.value
            ? `<img class="img-responsive offer-img" src="
            ` +
                params.data.logos +
                `">`
            : '';
        };
        temp['valueGetter'] = params => {
          if (params.data) {
            let dummyJson = {
              id: params.data ? params.data.id : '',
              col: params.data ? 'logos' : ''
            };
            return JSON.stringify(dummyJson);
          }
        };
        temp['keyCreator'] = params => {
          try {
            var parsed = JSON.parse(params.value);
          } catch (e) {
            // Oh well, but whatever...
          }

          //  let parseVal = params.newValue ? parsed : params.newValue;
          let idx1 = _.findIndex(this.rowData, {
            id: parsed ? parsed.id : params.value
          });
          if (idx1 > -1) {
            return this.rowData[idx1].logos;
          } else {
            return params.value;
          }
        };
      } else {
        if (data[i].key === 'flag') {
          temp['pinned'] = 'left';
          temp['headerName'] = data[i].name;
          temp['field'] = data[i].key;
          // temp['tooltipValueGetter'] = params => 'asasasa';

          temp['cellRenderer'] = params => {
            const imageSrc = this.adsService.getImage(params.value);
            return params.value
              ? `<img class="img-responsive offer-img" src= "` + imageSrc + `">`
              : '';
          };
        }
        temp['headerName'] = data[i].name;
        temp['field'] = data[i].key;
        temp['enableRowGroup'] = true;
        // temp['cellClass'] = data[i].class_name;
      }

      // temp['tooltipValueGetter'] = params => params.value;
      temp['tooltipValueGetter'] = function(params) {
        if (params.value == 'inserted') {
          params.value = 'Inserted';
          return params.value;
        } else if (params.value == 'updated') {
          params.value = 'Updated';
          return params.value;
        } else if (params.value == 'deleted') {
          params.value = 'Deleted';
          return params.value;
        } else {
          return params.value;
        }
      };

      // temp['tooltipField'] = data[i].key;
      const navIdx = this.disableColumns.indexOf(temp['field']);
      temp['editable'] = !(navIdx > -1);
      if (!this.adsService.editPermission) {
        temp['editable'] = false;
      }
      if (temp['editable'] && !temp['cellClass']) {
        temp['cellClass'] = 'editable_cells';
      }
      if (data[i].type !== 'text') {
        this.allAutoSizeColumns.push(data[i].key);
      }

      if (data[i].type === 'image') {
        temp['tooltipComponent'] = 'customTooltipComponent';
        temp['suppressKeyboardEvent'] = this.suppressEnter;
      }
      if (data[i].type === 'number') {
        temp['cellEditor'] = 'numericEditor';
      } else if (data[i].type === 'price') {
        temp['cellEditor'] = 'priceEditor';
      } else if (data[i].type === 'date') {
        temp['cellEditor'] = 'dateEditor';
        temp['cellRenderer'] = (params: { value: moment.MomentInput }) => {
          if (params.value) {
            return moment(params.value).format('MM-DD-YYYY');
          }
        };
        temp['keyCreator'] = (params: { value: moment.MomentInput }) => {
          return moment(params.value).format('MM-DD-YYYY');
        };
      } else if (data[i].type === 'image') {
        temp['cellEditor'] = 'imageEditor';
      }
      if (
        data[i].key === 'body_copy' &&
        !this.appService.headerPermissions['EDIT_COPY']
      ) {
        temp['cellClass'] = 'pointer-event';
      }
      if (
        data[i].type === 'image' &&
        !this.appService.headerPermissions['EDIT_IMAGES']
      ) {
        temp['cellClass'] = 'pointer-event';
      }
      if (
        data[i].key === 'price' &&
        !this.appService.headerPermissions['EDIT_PRICE']
      ) {
        temp['cellClass'] = 'pointer-event';
      }

      temp['cellStyle'] = params => {
        if (this.newTriggerClr && params.value != this.lastEditBfVal) {
          return { backgroundColor: '#fff1c1' };
        }
      };
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  suppressEnter(params) {
    let KEY_ENTER = 13;
    var event = params.event;
    var key = event.which;
    var suppress = key === KEY_ENTER;
    return suppress;
  }
  // compareValues(params){
  //   if (params.oldValue != params.newValue) {
  //     // var focusedCell = this.gridApi.getFocusedCell();
  //     // console.log(focusedCell);
  //     // let rowNode = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
  //     params.node.setDataValue(params.colDef.field, params.newValue);
  //    }
  // }

  onCellValueChanged(params) {
    // const index = _.findIndex(this.rowData, { id: params.data.id });
    const index = _.findIndex(this.rowData, {
      id: params.data ? params.data.id : ''
    });
    const focusedCell = this.gridApi.getFocusedCell();
    const rowNode = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
    if (this.lastUpdatedData === params.newValue) {
      return;
    }
    if (typeof params.newValue === 'string') {
      params.newValue = params.newValue
        ? params.newValue.trim()
        : params.newValue;
    }
    if (typeof params.oldValue === 'string') {
      params.oldValue = params.oldValue
        ? params.oldValue.trim()
        : params.oldValue;
    }
    if (params.colDef.cellEditor === 'priceEditor') {
      try {
        var parsed = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx1 = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx1 > -1) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Price Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        return;
      }
      params.newValue = parseFloat(params.newValue);
      params.oldValue = parseFloat(params.oldValue);
      if (isNaN(params.newValue)) {
        params.newValue = '';
      }
      if (isNaN(params.oldValue)) {
        params.oldValue = '';
      }
    }

    if (params.colDef.cellEditor === 'numericEditor') {
      try {
        var parsed = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx1 = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx1 > -1) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Number Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        return;
      }
      params.newValue = parseInt(params.newValue, 10);
      params.oldValue = parseInt(params.oldValue, 10);
      if (isNaN(params.newValue)) {
        params.newValue = '';
      }
      if (isNaN(params.oldValue)) {
        params.oldValue = '';
      }
    }
    if (params.colDef.field != 'logos' && params.colDef.field != 'image') {
      try {
        var parsed = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx1 = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (params.oldValue === params.newValue) {
        return;
      } else if (idx1 > -1) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Text Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        return;
      }
    }

    // if (
    //   params.colDef.field === 'image' ||
    //   params.colDef.field === 'logos' ||
    //   params.colDef.field === 'icon_path'
    // ) {
    //   return;
    // }

    if (params.colDef.field === 'logos') {
      let itemsObj = {
        key: 'logo_details',
        item_id: params.data.id
      };
      try {
        var parsed = JSON.parse(params.data.logos);
      } catch (e) {
        return;
        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx < 0) {
        if (this.currentDefImg === params.data.logos) {
          return;
        }
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot paste copied data in Logos Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      if (parsed.col != 'logos') {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot be pasted from Images to Logos.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      itemsObj = Object.assign({}, itemsObj, {
        value: this.rowData[idx].logo_details
      });
      const imgParams = {
        ad_id: this.appService.adId,
        items: []
      };
      imgParams.items.push(itemsObj);
      this.adsService
        .updateFeatureItems([{ url: 'updateFeatureItems' }, imgParams])
        .then(res => {
          if (res.result.success) {
            // tslint:disable-next-line:no-shadowed-variable
            let res1 = {
              data: res
            };
            this.updateGridVal(params, res1, 'logos');
          }
        });
      return;
    } else if (params.colDef.field === 'image') {
      let itemsObj = {
        key: 'image_details',
        item_id: params.data.id
      };
      try {
        var parsed = JSON.parse(params.data.image);
      } catch (e) {
        return;

        // Oh well, but whatever...
      }

      //  let parseVal = params.newValue ? parsed : params.newValue;
      let idx = _.findIndex(this.rowData, {
        id: parsed ? parsed.id : params.newValue
      });
      if (idx < 0) {
        if (this.currentDefImg === params.data.image) {
          return;
        }
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot  paste copied data in Images Field.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      if (parsed.col != 'image') {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Cannot be pasted from Logos to Images.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      itemsObj = Object.assign({}, itemsObj, {
        value: this.rowData[idx].image_details
      });
      const imgParams = {
        ad_id: this.appService.adId,
        items: []
      };
      imgParams.items.push(itemsObj);
      this.adsService
        .updateFeatureItems([{ url: 'updateFeatureItems' }, imgParams])
        .then(res => {
          if (res.result.success) {
            // tslint:disable-next-line:no-shadowed-variable
            let res1 = {
              data: res
            };
            this.updateGridVal(params, res1, 'images');
          }
        });
      return;
    }
    // if (params.colDef.cellEditor === 'dateEditor') {
    //   params.newValue = moment(params.newValue).format('YYYY-MM-DD');
    // }
    const temp = {
      key: params.colDef.field,
      value:
        params.newValue !== null && params.newValue !== undefined
          ? params.newValue
          : '',
      item_id: params.data.id,
      class_name: 'updated-cell',
      header_name: params.colDef.headerName
    };
    const revHis = {
      item_id: params.data.id,
      column_key: params.colDef.field, // change to key
      old_value: params.oldValue,
      new_value: params.newValue
    };
    const arr = [];
    arr.push(temp);
    const updateParams = {
      items: arr,
      ad_id: this.appService.adId
    };
    if (!this.domRevisionHistory.length) {
      this.canUndoDone = true;
    }

    if (this.currentChange === 'redo') {
      this.currentDomRevision > -1
        ? (this.domRevisionHistory[this.currentDomRevision - 1] = revHis)
        : this.domRevisionHistory.push(revHis);
      this.currentChange = '';
    } else if (this.currentChange === 'undo') {
      this.currentDomRevision > -1
        ? (this.domRevisionHistory[this.currentDomRevision] = revHis)
        : this.domRevisionHistory.push(revHis);
      this.currentChange = '';
    } else {
      this.domRevisionHistory.push(revHis);
      this.currentDomRevision = -1;
      this.canUndoDone = true;
    }
    this.adsService
      .updateFeatureItems([{ url: 'updateFeatureItems' }, updateParams])
      .then(res => {});
  }
  cellEditingStarted(ev) {
    this.lastEditBfVal = ev.value;
    this.newTriggerClr = true;
  }
  cellEditingStopped(ev) {
    this.newTriggerClr = false;
  }
  expandCurrentGroup(ndeIdx) {
    if (this.gridApi) {
      this.gridApi.forEachNode(node => {
        if (node.rowIndex === ndeIdx) {
          if (node.expanded) {
            node.setExpanded(false);
          } else {
            node.setExpanded(true);
          }
          // node.setSelected(true);
        }
        // if (node.childIndex === 1) {
        //   node.setSelected(true);
        // }
      });
    }
  }
  onCellClicked(params) {
    if (params.node.group) {
      this.expandCurrentGroup(params.rowIndex);
    }
    const selectedRowNode = this.gridApi.getRowNode(params.data.id);
    this.imageInfo =
      params.colDef.field === 'image' ? 'image_details' : 'logo_details';
    if (params.colDef.field === 'image' && params.data.image_upcs === '') {
      return;
    }
    if (params.colDef.field === 'image' || params.colDef.field === 'logos') {
      if (!this.adsService.editPermission) {
        return;
      }
      this.imageInfo =
        params.colDef.field === 'image' ? 'image_details' : 'logo_details';
      const index = _.findIndex(this.rowData, { id: params.data.id });
      const focusedCell = this.gridApi.getFocusedCell();
      const rowNode = this.gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex);
      this.isDailogOpen = true;
      this.dialogRef = this.dialog.open(ImageAssestsComponent, {
        panelClass: ['campaign-dialog', 'overlay-dialog'],
        width: params.colDef.field === 'image' ? '760px' : '680px',
        data: {
          title: params.data.image_upcs,
          rowData: params.data,
          url: 'updateFeatureItems',
          from: params.colDef.field
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        this.isDailogOpen = false;
        if (res ? res.data && res.data.result.success : false) {
          this.updateGridVal(params, res, 'imgDailog');
        } else {
          const logo_details = Object.values(res);
          const index = _.findIndex(this.rowData, { id: params.data.id });
          const focusedCell = this.gridApi.getFocusedCell();
          const rowNode = this.gridApi.getDisplayedRowAtIndex(
            focusedCell.rowIndex
          );
          this.rowData[index][this.imageInfo] = logo_details;
          rowNode.setDataValue(this.imageInfo, logo_details);
        }
      });
    }
  }
  //update Values

  updateGridVal(params, res, from) {
    const index = _.findIndex(this.rowData, { id: params.data.id });
    const focusedCell = this.gridApi.getFocusedCell();
    const rowNode = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);
    if (params.colDef.field === 'image') {
      // tslint:disable-next-line:no-shadowed-variable
      let brandDetails = [];
      let prodDetails = [];
      if (res.data.result.data.image_details.length) {
        res.data.result.data.image_details.forEach(attr => {
          if (attr.brand) {
            brandDetails.push(attr.brand);
          }
          if (attr.product) {
            prodDetails.push(attr.product);
          }
        });
        brandDetails = _.uniq(brandDetails);
        prodDetails = _.uniq(prodDetails);
      }
      const rowNode = this.gridApi.getRowNode(res.data.result.data.item_id);
      const flashColumns = [];
      if (rowNode.data.brand !== brandDetails.join(', ')) {
        flashColumns.push('brand');
      }
      if (rowNode.data.product !== prodDetails.join(', ')) {
        flashColumns.push('product');
      }
      rowNode.setDataValue('brand', brandDetails.join(', '));
      rowNode.setDataValue('product', prodDetails.join(', '));
      this.gridApi.flashCells({
        rowNodes: [rowNode],
        columns: flashColumns
      });
    }
    let imageInfo =
      params.colDef.field === 'image' ? 'image_details' : 'logo_details';
    this.rowData[index][imageInfo] = res.data.result.data[imageInfo];
    this.currentDefImg = res.data.result.data[params.colDef.field];
    rowNode.setDataValue(
      params.colDef.field,
      res.data.result.data[params.colDef.field]
    );
    this.gridApi.refreshCells({
      force: true,
      rowNodes: [rowNode],
      columns: [params.colDef.field]
    });
  }

  // on DOM Redo and Undo in grid
  domRevisions(change) {
    this.currentChange = change;

    if (this.domRevisionHistory.length) {
      if (
        change === 'redo' &&
        this.currentDomRevision < this.domRevisionHistory.length
      ) {
        this.currentChange = change;
        // let idx = this.domRevisionHistory.length - (this.currentDomRevision + 1);
        const params = {
          item_id: this.domRevisionHistory[this.currentDomRevision].item_id,
          column_key: this.domRevisionHistory[this.currentDomRevision]
            .column_key, // change to key
          old_value: this.domRevisionHistory[this.currentDomRevision].old_value
          // new_value : params.newValue,
        };
        if (this.currentDomRevision > -1) {
          this.updateRecord(params);
          // let idx = this.domRevisionHistory.length - (this.currentDomRevision + 1);
          // this.domRevisionHistory.splice(idx, 1);
          this.canUndoDone = true;
          if (this.currentDomRevision === this.domRevisionHistory.length - 1) {
            this.canRedoDone = false;
          }
          this.currentDomRevision++;
        }
      } else if (change === 'undo') {
        if (this.currentDomRevision > -1) {
          this.currentDomRevision--;
        } else {
          this.currentDomRevision = this.domRevisionHistory.length - 1;
        }
        const params = {
          item_id: this.domRevisionHistory[this.currentDomRevision].item_id,
          column_key: this.domRevisionHistory[this.currentDomRevision]
            .column_key, // change to key
          old_value: this.domRevisionHistory[this.currentDomRevision].old_value
          // new_value : params.newValue,
        };
        this.updateRecord(params);
        // this.domRevisionHistory.splice(this.currentDomRevision, 1);
        if (this.currentDomRevision === 0) {
          this.canUndoDone = false;
        }
        if (this.currentDomRevision > -1) {
          this.canRedoDone = true;
        }
      }
    }
  }
  // Keyboard events
  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
    if ($event.keyCode === 13) {
      return;
    }
    if (!this.isDailogOpen) {
      if (($event.ctrlKey || $event.metaKey) && $event.keyCode === 90) {
        if (this.canUndoDone) {
          this.domRevisions('undo');
        }
      }
      if (($event.ctrlKey || $event.metaKey) && $event.keyCode === 89) {
        if (this.canRedoDone) {
          this.domRevisions('redo');
        }
      }
    }
  }
}
