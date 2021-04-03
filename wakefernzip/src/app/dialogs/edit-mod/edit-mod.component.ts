import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  Directive,
  ElementRef,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { MatExpansionPanel, MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { AdsService } from '@app/ads/ads.service';
import * as moment from 'moment';
import { AppService } from '@app/app.service';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { EditWindowComponent } from '@app/shared/component/CellEditors/edit-window/edit-window.component';
import { NumericEditor } from '@app/shared/component/CellEditors/numeric-editor.component';
import { debug } from 'util';
import { ImageAssestsComponent } from '../image-assests/image-assests.component';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { OfferUnitCellComponent } from '@app/shared/component/CellEditors/offer-unit-cell/offer-unit-cell.component';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Router, ActivatedRoute } from '@angular/router';
import { DateEditorComponent } from '@app/shared/component/CellEditors/date-editor/date-editor.component';
import { PriceEditor } from '@app/shared/component/CellEditors/price-editor.component';
import { AgGridCheckboxComponent } from '@app/shared/component/CellEditors/ag-grid-checkbox/ag-grid-checkbox.component';
import { PromoImageAssetsComponent } from '../promo-image-assets/promo-image-assets.component';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchComponent } from '@app/shared/component/search/search.component';
import { AdSubModulesComponent } from '@app/ads/ads-list/ad-sub-modules/ad-sub-modules.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Inject, Injectable } from '@angular/core';
const APP: any = window['APP'];

@Component({
  selector: 'app-edit-mod',
  templateUrl: './edit-mod.component.html',
  styleUrls: ['./edit-mod.component.scss'],
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
export class EditModComponent implements OnInit, AfterViewInit {
  @ViewChild('rev1Panel') rev1Panel: MatExpansionPanel;
  @ViewChild('rev2Panel') rev2Panel: MatExpansionPanel;
  @Input('editModInputData') data: any;
  @Output() closeEdit: EventEmitter<any> = new EventEmitter();
  offerTypeArray = [];
  activeModData: any;
  modsAllPages = [];
  public promoCollection = [];
  public selectedPageData: any;

  public offerUnits: any;
  public offerVarieties: any;
  public currentPromoData = [];
  public activeModPromotions = [];
  public activePromotion: any;
  public revision1PromoData = [];
  public revision2PromoData = [];
  public imagesHeaders = [];
  public pricingHeaders = [];
  public statementHeaders = [];
  public updatedColumns = [];
  private selectedTabIndex = -1;
  public selectedOfferType = '';
  public dialogRef: any;
  public dialogRef1: any;
  public dialogRef2: any;
  public dialogRef3: any;
  public dialogRefSplitMod: any;
  public selectedPage: any;
  public selectedModId: any;
  public assetType = '';
  public previousId = '';
  public currentState = '';
  public promoObj;
  public search = {
    placeHolder: 'Search...',
    value: ''
  };
  public currentDomRevision = -1;
  public canUndoDone = false;
  public canRedoDone = false;
  public rowIndex;
  public selectedRevision;
  public domUpdateFilter = {
    isChange: false,
    changeAc: ''
  };
  public prms = {
    ad_id: this.appService.adId,
    promotion_id: '',
    items: []
  };
  public dupPrms = {
    ad_id: this.appService.adId,
    promotion_id: '',
    items: []
  };
  public pasteInfo = {
    status: false,
    randKey: 0
  };
  public popUpStatus = false;
  public timeRef: any;
  public timeRefdup: any;
  // public promoSearch = '';
  public promoSearch = {
    placeHolder: 'Search...',
    value: ''
  };
  public image_url = APP.img_url + 'no-mod-image.png';
  public refreshData = false;
  public statementsData = [];
  public imagesData = [];
  public pricingData = [];
  public spText = [];
  public spTextTitle;
  public spTextHeaders = [];
  public modInfoData = [];
  private getRowNodeId;
  public gridApi: any;
  public gridApiRev5;
  public gridApiRev6;
  public filterTooltip = 'Filters';

  public promoDetails: any;
  public gridColumnApi: any;
  public pricingClassRules: any;
  public gridApiRev1: any;
  public gridApiRev3: any;
  public gridColumnApiRev1: any;
  public gridColumnApiRev3: any;
  public gridColumnApiRev5: any;
  public gridColumnApiRev6: any;
  public gridApiRev2: any;
  public gridColumnApiRev2: any;
  public togglePanelPromoId: any;
  public allAutoSizeColumns = [];
  public columnDefsStatement = [];
  public columnDefsImage = [];
  public columnDefsSptext = [];
  public columnDefsPrice = [];
  public columnDefsPapertext = [];
  public columnDefsMixmatchtext = [];
  public columnDefsDigitaltext = [];
  public filteredMods = [];
  public disableColumns = [];
  public gridVisibility = false;
  public gridVisibilityRev1 = false;
  public gridVisibilityRev3 = false;
  public gridVisibilityRev2 = false;
  public gridVisibilityRev5 = false;
  public gridVisibilityRev6 = false;

  public pointerEvents = false;
  public pointerEventsRev1 = false;
  public pointerEventsRev2 = false;
  public pointerEventsRev3 = false;

  public gridApiRev4;
  public gridColumnApiRev4;
  public gridVisibilityRev4 = false;
  public pointerEventsRev4 = false;
  public pointerEventsRev5 = false;
  public pointerEventsRev6 = false;
  public clonestatementsData = [];
  public clonestatementsData2 = [];
  public cloneimagesData = [];
  public clonepricingData = [];
  public clonespText = [];
  public clonepaperText = [];
  public clonemixMatchText = [];
  public clonedigitalText = [];

  public cloneimagesData2 = [];
  public clonepricingData2 = [];
  public clonespText2 = [];
  public clonepaperText2 = [];
  public clonemixMatchText2 = [];
  public clonedigitalText2 = [];
  public allowpowerline = true;

  public pinnedTopRowData = [];
  public pinnedTopRowData2 = [];
  public pinnedTopRowData3 = [];
  public pinnedTopRowData4 = [];
  public pinnedTopRowData5 = [];
  public pinnedTopRowData6 = [];
  public pinnedTopRowData7 = [];

  public promotionId;

  // public newTriggerClr = false;
  // public lastEditBfVal = '';
  public enableSaveBtn = false;
  public dataLoad = true;
  public offer_type_price_grid = '';
  public selectedRowsData = {
    page_id: '',
    mod_id: '',
    promotions: []
  };
  public powerlineGridData = [];
  public rowNode;
  public noData: any;
  public noModDetails: any;
  public currentPromoPagination: number = 1;
  public searchWord: any;
  public editModForm: FormGroup;
  public leftSliderValue = false;
  public frameworkComponents: any;
  public totalPromotionList = [];
  public varietyStatemntsOptions = [];
  public selectedPromoFilter = 'all';
  public scrollButton = false;
  public leftScrollButton = true;
  public rightScrollButton = false;
  public domRevisionHistory = [];
  public currentChange = '';
  public getRowNodeId2;
  public getRowNodeId3;
  public getRowNodeId4;
  public getRowNodeId5;
  public getRowNodeId6;
  public getRowNodeId7;

  public paperTextTitle;
  public mixMatchTextTitle;
  public digitalTextTitle;

  public paperText = [];
  public mixMatchText = [];
  public digitalText = [];

  public paperTextHeaders = [];
  public mixMatchTextHeaders = [];
  public digitalTextHeaders = [];

  public lastUpdatedData = '#@%$!#@';
  public unitOptions = [{ id: 'EA', name: 'EA' }, { id: 'LB', name: 'LB' }];
  public promoFilterOptions = [
    { id: 'inserted', name: 'Inserted' },
    { id: 'updated', name: 'Updated' },
    { id: 'deleted', name: 'Deleted' },
    { id: 'noChange', name: 'No Change' }
  ];
  public editCopyGrid = false;
  public editPriceGrid = false;
  public editImageGrid = false;
  public editSptextGrid = false;
  public editPapertextGrid = false;
  public editMixmatchGrid = false;
  public editDigitalGrid = false;
  public showLockIcon = false;

  public deleteKeyPressed = false;
  public disableSaveBtn = false;
  public revisionList = [];
  public revisionId;
  public imgCopyPasteFlag = false;
  public allowDelcal = true;
  public switchPromo = false;

  public category_list = [];
  public zone_list = [];
  public priority_list = [];
  public department_list = [];
  public mod_list = [];
  public page_list = [];
  public status_list = [];
  public notAllowed = false;

  public obj = {
    ad_category: '',
    ad_size: '',
    blowline: '',
    comb_ad_size: '',
    comb_blowline: '',
    comb_overline: '',
    dept: '',
    event: '',
    isPowerLineRow: 1,
    item_id: '',
    mod: '',
    overline_1: '',
    overline_2: '',
    overline_3: '',
    overline_4: '',
    page: '',
    promotion_id: '5efd9ab16f92a20137503a0e',
    prty: '',
    swing: '',
    zone: ''
  };
  sortOptions: any = {
    onUpdate: (event: any) => {
      this.promotionTabChanged({ index: event.newIndex });
      this.updatePromotionOrder();
    },
    onStart: (event: any) => {
      // this.disableBtn = false;
    }
  };
  customOwlOptions: OwlOptions = {
    loop: false,
    margin: 20,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    nav: true,
    navSpeed: 700,
    autoWidth: true,
    navText: [
      '<em class="pixel-icons icon-arrow-left"></em>',
      '<em class="pixel-icons icon-arrow-right"></em>'
    ]
    // navText: ['<em class = "pixel-icons arrow-left" ></em>', '<em class = "pixel-icons arrow-right"></em>'],
  };
  @ViewChild('searchingBox') searchingBox;
  @ViewChild('widgetsContent') widgetsContent: ElementRef;

  constructor(
    public adsService: AdsService,
    private fb: FormBuilder,
    private route: Router,
    private appService: AppService,
    public dialog: MatDialog,
    public snackbar: MatSnackBar,
    private _sanitizer: DomSanitizer,
    public searchcomp: SearchComponent,
    private overlayContainer: OverlayContainer
  ) {
    this.createForm();
    this.getRowNodeId = function(data) {
      return data.item_id;
    };
    this.getRowNodeId2 = function(data) {
      return data.item_id;
    };
    this.getRowNodeId3 = function(data) {
      return data.item_id;
    };
    this.getRowNodeId4 = function(data) {
      return data.item_id;
    };
    this.getRowNodeId5 = function(data) {
      return data.item_id;
    };
    this.getRowNodeId6 = function(data) {
      return data.item_id;
    };
    this.getRowNodeId7 = function(data) {
      return data.item_id;
    };
    this.frameworkComponents = {
      autofillEditor: EditWindowComponent,
      offerUnitCellRenderer: OfferUnitCellComponent,
      dateEditor: DateEditorComponent,
      numericEditor: NumericEditor,
      priceEditor: PriceEditor
    };
  }

  ngOnInit() {
    this.currentState = '';
    this.loaddata();
    if (this.appService.headerPermissions.EDIT_COPY) {
      this.editCopyGrid = true;
    } else {
      this.editCopyGrid = false;
    }
    if (this.appService.headerPermissions.EDIT_PRICE) {
      this.editPriceGrid = true;
    } else {
      this.editPriceGrid = false;
    }

    if (this.appService.headerPermissions.EDIT_IMAGES) {
      this.editImageGrid = true;
    } else {
      this.editImageGrid = false;
    }
    if (this.appService.headerPermissions.EDIT_SP_TEXT) {
      this.editSptextGrid = true;
    } else {
      this.editSptextGrid = false;
    }
    if (this.appService.headerPermissions.EDIT_PAPER_TEXT) {
      this.editPapertextGrid = true;
    } else {
      this.editPapertextGrid = false;
    }
    if (this.appService.headerPermissions.EDIT_MIXMTCH_TEXT) {
      this.editMixmatchGrid = true;
    } else {
      this.editMixmatchGrid = false;
    }
    if (this.appService.headerPermissions.DIGITAL_TEXT) {
      this.editDigitalGrid = true;
    } else {
      this.editDigitalGrid = false;
    }

    if (this.appService.headerPermissions.LOCK_UNLOCK_OFFERS) {
      this.showLockIcon = true;
    } else {
      this.showLockIcon = false;
    }
  }
  ngAfterViewInit() {
    this.buttonScroll();
  }

  loaddata() {
    if (this.data.fromComp == 'pages') {
      this.activeModData = _.cloneDeep(this.data.currMod);
      this.modsAllPages = _.cloneDeep(this.data.pagesInfo);

      let idx = _.findIndex(this.modsAllPages, {
        base_id: this.data.selectedPage
      });
      if (idx > -1) {
        this.selectedPageData = this.modsAllPages[idx];
      }
      this.activeModPromotions = this.activeModData.promotions;

      if (this.activeModPromotions.length) {
        this.togglePanelPromoId = this.activeModPromotions[0].id;
      }
      this.promotionTabChanged({ index: 0 });
      this.appService.getForms().then(data => {
        this.offerTypeArray = data.result.data.data;
      });
      if (this.editModForm) {
        this.editModForm.patchValue(this.activeModData);
        this.enableSaveBtn = false;
      }
      // listening form changes
      this.editModForm.valueChanges.subscribe(data => {
        if (this.editModForm.valid) {
          this.enableSaveBtn = true;
        } else {
          this.enableSaveBtn = false;
        }
        this.activeModData.headline = data.headline;
        this.activeModData.body_copy = data.body_copy;
        this.activeModData.price = data.price;
      });
    } else if (this.data.fromComp == 'promotions') {
      this.promoSearch.value = this.data.search;
      this.getTotalPromotions('');
      this.getVarietyStatements();
      this.appService.getForms().then(data => {
        this.offerTypeArray = data.result.data.data;
      });
    }
  }

  getRevisions() {
    let params = {
      ad_id: this.appService.adId,
      promotion_id: this.promotionId
    };
    this.adsService.sendOuput('getRevisions', params).then(res => {
      if (res.result.success) {
        this.revisionList = res.result.data;
        this.revisionList.unshift({
          id: this.promoObj.id,
          name: 'Default',
          promo_id: this.promoObj.promo_id,
          mod_id: this.promoObj.mod_id
            ? this.promoObj.mod_id
            : this.data.currMod.mod_id,
          current_tab: this.data.fromComp
        });

        this.selectedRevision = this.promoObj.id;
      }
    });
  }

  retainOnSwitch(flag) {
    this.appService.gridData.api.stopEditing();

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
      // console.log(result)
      if (result.from === 'switchPromo' && result.action == 'confirmed') {
        this.savePromoData();

        // this.promoSearch.value = '';

        setTimeout(() => {
          this.adsService.promotionItems.items = [];
          this.promoSearch.value = '';
        }, 500);
      } else {
        this.appService.switchPromoFlag = false;

        if (flag == 'revision') {
          setTimeout(() => {
            this.appService.switchPromoFlag = false;

            this.getRevisionData(this.revisionVal);
            this.adsService.promotionItems.items = [];
          }, 500);
          return;
        }
        if (flag == 'filter') {
          setTimeout(() => {
            this.appService.switchPromoFlag = false;

            this.showfltrPopover = true;

            // this.getFilteredPromotions(this.filterVal);
            this.adsService.promotionItems.items = [];
          }, 500);
          return;
        }
        if (flag == 'search') {
          setTimeout(() => {
            this.appService.switchPromoFlag = false;

            this.onPromoSearch(this.searchVal);
            this.adsService.promotionItems.items = [];
          }, 500);
          return;
        }
      }
    });
    // return
  }

  public revisionVal;
  public pinrowKeys = [];
  public pinrowKeys2 = [];

  getRevisionData(val) {
    this.revisionVal = val;
    // console.log(this.appService.gridData)
    if (this.appService.gridData != undefined) {
      this.appService.gridData.api.stopEditing();
    }

    if (this.appService.switchPromoFlag) {
      this.retainOnSwitch('revision');
      return;
    }

    this.selectedRevision = val.id;

    if (val.name == 'Default') {
      // this.getPromotionView(val);

      const params = {
        id: val.id,
        promo_id: val.promo_id,
        mod_id: val.mod_id ? val.mod_id : this.data.currMod.mod_id,
        current_tab: this.data.fromComp
      };
      this.adsService
        .getAdModules([{ url: 'getPromotionsDetails' }, params])
        .then(res => {
          if (res.result.success) {
            this.disableSaveBtn = false;

            this.statementsData = res.result.data.statements;

            this.pinrowKeys = Object.keys(this.statementsData[0]);
            this.pinrowKeys.forEach(obj => {
              let rowNode = this.gridApi.pinnedRowModel.pinnedTopRows[0];
              rowNode.setDataValue(obj, '');
              this.gridApi.refreshCells({
                rowNodes: [rowNode],
                columns: [obj]
              });
            });

            this.statementsData.shift();

            this.pricingData = res.result.data.pricing;
            let arry1 = [];
            arry1 = Object.keys(this.pricingData[0]);
            arry1.forEach(obj => {
              let rowNode = this.gridApiRev2.pinnedRowModel.pinnedTopRows[0];
              rowNode.setDataValue(obj, '');
              this.gridApi.refreshCells({
                rowNodes: [rowNode],
                columns: [obj]
              });
            });
            this.pricingData.shift();

            this.imagesData = res.result.data.images;
            let arry2 = [];
            arry2 = Object.keys(this.imagesData[0]);
            arry2.forEach(obj => {
              let rowNode = this.gridApiRev1.pinnedRowModel.pinnedTopRows[0];
              rowNode.setDataValue(obj, '');
              this.gridApi.refreshCells({
                rowNodes: [rowNode],
                columns: [obj]
              });
            });
            this.imagesData.shift();

            this.spText = res.result.data.spText;
            let arry3 = [];
            arry3 = Object.keys(this.spText[0]);
            arry3.forEach(obj => {
              let rowNode = this.gridApiRev3.pinnedRowModel.pinnedTopRows[0];
              rowNode.setDataValue(obj, '');
              this.gridApi.refreshCells({
                rowNodes: [rowNode],
                columns: [obj]
              });
            });
            this.spText.shift();

            this.paperText = res.result.data.paperText;
            let arry4 = [];
            arry4 = Object.keys(this.paperText[0]);
            arry4.forEach(obj => {
              let rowNode = this.gridApiRev4.pinnedRowModel.pinnedTopRows[0];
              rowNode.setDataValue(obj, '');
              this.gridApi.refreshCells({
                rowNodes: [rowNode],
                columns: [obj]
              });
            });
            this.paperText.shift();

            this.mixMatchText = res.result.data.mixMatchText;
            let arry5 = [];
            arry5 = Object.keys(this.mixMatchText[0]);
            arry5.forEach(obj => {
              let rowNode = this.gridApiRev5.pinnedRowModel.pinnedTopRows[0];
              rowNode.setDataValue(obj, '');
              this.gridApi.refreshCells({
                rowNodes: [rowNode],
                columns: [obj]
              });
            });
            this.mixMatchText.shift();

            this.digitalText = res.result.data.digitalText;
            let arry6 = [];
            arry6 = Object.keys(this.pricingData[0]);
            arry6.forEach(obj => {
              let rowNode = this.gridApiRev6.pinnedRowModel.pinnedTopRows[0];
              rowNode.setDataValue(obj, '');
              this.gridApi.refreshCells({
                rowNodes: [rowNode],
                columns: [obj]
              });
            });
            this.digitalText.shift();

            // for (let i = 0; i < 7; i++) {
            //   let a;
            //   a = document.getElementsByClassName('ag-floating-top-viewport')[
            //     i
            //   ];
            //   a.style.pointerEvents = 'unset';
            // }

            // this.pointerEvents = true;

            if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
              for (let i = 0; i < 7; i++) {
                let a;
                a = document.getElementsByClassName('ag-floating-top-viewport')[
                  i
                ];
                if (a != undefined) {
                  a.style.pointerEvents = 'none';
                }
              }

              this.pointerEvents = false;
              this.notAllowed = true;
              // this.pointerEventsRev1 = false;
              // this.pointerEventsRev2 = false;
              // this.pointerEventsRev3 = false;
              // this.pointerEventsRev4 = false;
              // this.pointerEventsRev5 = false;
              // this.pointerEventsRev6 = false;
            } else {
              for (let i = 0; i < 7; i++) {
                let a;
                a = document.getElementsByClassName('ag-floating-top-viewport')[
                  i
                ];
                if (a != undefined) {
                  a.style.pointerEvents = 'unset';
                }
              }
              this.pointerEvents = true;
              this.notAllowed = false;

              // this.pointerEventsRev1 = true;
              // this.pointerEventsRev2 = true;
              // this.pointerEventsRev3 = true;
              // this.pointerEventsRev4 = true;
              // this.pointerEventsRev5 = true;
              // this.pointerEventsRev6 = true;
            }
          }
        });
    } else {
      this.revisionId = val.id;
      let params = {
        id: this.revisionId,
        promotion_id: this.promotionId
      };
      this.adsService.sendOuput('getRevisionDetails', params).then(res => {
        // console.log(res)
        if (res.result.success) {
          this.disableSaveBtn = true;
          this.canRedoDone = false;
          this.canUndoDone = false;

          this.statementsData = res.result.data.statements;

          // if (!this.pinnedTopRowData.length) {
          //   this.pinnedTopRowData.push(this.statementsData[0]);
          // } else {
          //   Object.assign(this.pinnedTopRowData[0], this.statementsData[0]);
          // }
          this.pricingData = res.result.data.pricing;
          this.imagesData = res.result.data.images;
          this.imagesHeaders = res.result.data.imagesHeaders;

          this.generateColumns(this.imagesHeaders, 'images', '', '');

          this.spText = res.result.data.spText;
          this.paperText = res.result.data.paperText;
          this.mixMatchText = res.result.data.mixMatchText;
          this.digitalText = res.result.data.digitalText;

          let revArr = [];
          revArr = Object.keys(this.statementsData[0]);
          revArr.forEach(obj => {
            let rowNode = this.gridApi.pinnedRowModel.pinnedTopRows[0];
            rowNode.setDataValue(obj, '');
            this.gridApi.refreshCells({
              rowNodes: [rowNode],
              columns: [obj]
            });
          });

          let revArr1 = [];
          revArr1 = Object.keys(this.pricingData[0]);
          revArr1.forEach(obj => {
            let rowNode = this.gridApiRev2.pinnedRowModel.pinnedTopRows[0];
            rowNode.setDataValue(obj, '');
            this.gridApi.refreshCells({
              rowNodes: [rowNode],
              columns: [obj]
            });
          });
          let revArr2 = [];
          revArr2 = Object.keys(this.imagesData[0]);
          revArr2.forEach(obj => {
            let rowNode = this.gridApiRev1.pinnedRowModel.pinnedTopRows[0];
            rowNode.setDataValue(obj, '');
            this.gridApi.refreshCells({
              rowNodes: [rowNode],
              columns: [obj]
            });
          });
          let revArr3 = [];
          revArr3 = Object.keys(this.spText[0]);
          revArr3.forEach(obj => {
            let rowNode = this.gridApiRev3.pinnedRowModel.pinnedTopRows[0];
            rowNode.setDataValue(obj, '');
            this.gridApi.refreshCells({
              rowNodes: [rowNode],
              columns: [obj]
            });
          });

          let revArr4 = [];
          revArr4 = Object.keys(this.paperText[0]);
          revArr4.forEach(obj => {
            let rowNode = this.gridApiRev4.pinnedRowModel.pinnedTopRows[0];
            rowNode.setDataValue(obj, '');
            this.gridApi.refreshCells({
              rowNodes: [rowNode],
              columns: [obj]
            });
          });
          let revArr5 = [];
          revArr5 = Object.keys(this.mixMatchText[0]);
          revArr5.forEach(obj => {
            let rowNode = this.gridApiRev5.pinnedRowModel.pinnedTopRows[0];
            rowNode.setDataValue(obj, '');
            this.gridApi.refreshCells({
              rowNodes: [rowNode],
              columns: [obj]
            });
          });

          let revArr6 = [];
          revArr6 = Object.keys(this.digitalText[0]);
          revArr6.forEach(obj => {
            let rowNode = this.gridApiRev6.pinnedRowModel.pinnedTopRows[0];
            rowNode.setDataValue(obj, '');
            this.gridApi.refreshCells({
              rowNodes: [rowNode],
              columns: [obj]
            });
          });

          setTimeout(() => {
            this.appService.switchPromoFlag = false;
          }, 500);

          for (let i = 0; i < 7; i++) {
            let a;
            a = document.getElementsByClassName('ag-floating-top-viewport')[i];
            a.style.pointerEvents = 'none';
          }

          this.pointerEvents = false;
        }
      });
    }
  }
  getTotalPromotions(from) {
    this.category_list = JSON.parse(localStorage.getItem('categories'));
    this.zone_list = JSON.parse(localStorage.getItem('zones'));
    this.priority_list = JSON.parse(localStorage.getItem('priorities'));
    this.department_list = JSON.parse(localStorage.getItem('departments'));
    this.status_list = JSON.parse(localStorage.getItem('status1'));

    this.modList2 = JSON.parse(localStorage.getItem('modvalues'));
    this.pageList2 = JSON.parse(localStorage.getItem('pagevalues'));

    // console.log(this.modList)

    // if(this.category_list != null || this.zone_list != null ||
    //   this.priority_list != null || this.department_list) {}

    if (
      (this.category_list != null && this.category_list.length) ||
      (this.zone_list != null && this.zone_list.length) ||
      (this.priority_list != null && this.priority_list.length) ||
      (this.department_list != null && this.department_list.length) ||
      (this.status_list != null && this.status_list.length) ||
      (this.modList2 != null && this.modList2.length) ||
      (this.pageList2 != null && this.pageList2.length)
    ) {
      this.showRedDot = true;
      this.filterTooltip = 'Filters Applied';
    } else {
      this.showRedDot = false;
      this.filterTooltip = 'Filters';
    }

    let params = {
      filter: this.status_list,
      zones: this.zone_list,
      categories: this.category_list,
      departments: this.department_list,
      priorities: this.priority_list,
      pages: this.pageList2,
      mods: this.modList2,

      search: this.promoSearch.value,
      ad_id: this.appService.adId,
      pageNumber: this.currentPromoPagination,
      pageSize: 20
    };
    this.adsService.sendOuput('getPromotionLists', params).then(res => {
      // this.totalPromotionList = res.result.data.length ? res.result.data : [];

      if (res.result.success) {
        this.dataLoad = false;
        if (from == 'search' || from == 'filter') {
          this.totalPromotionList = res.result.data;

          // this.getPromotionView( this.promoObj )

          // this.gridApi.refreshCells('');
          // let rowNode = this.gridApi.pinnedRowModel.pinnedTopRows[0];
          // rowNode.setDataValue('page', '');
          // this.gridApi.refreshCells({
          //   rowNodes: [rowNode],
          //   columns: ['page']
          // });

          // const params = {
          //   id: "5f2c257ebf67b001cd2b3080",

          // };
          // this.adsService
          //   .getAdModules([{ url: 'getPromotionsDetails' }, params])
          //   .then(res => {
          //     if (res.result.success) {
          //       this.disableSaveBtn = false;

          //       this.statementsData = res.result.data.statements;
          //     }
          //   })

          // console.log(this.totalPromotionList);
          // this.totalPromotionList = this.totalPromotionList.filter(x => x.page == "1");
        } else {
          this.totalPromotionList.push(...res.result.data);
        }
        this.promoCollection = this.totalPromotionList;
        if (this.totalPromotionList.length) {
          // let promo = {
          //   id: '5df9c4906b7d1d004309da2c',
          //   mod_id: '5dfb20836b7d1d009d498e84',
          //   promo_id: 351520
          // };
          this.noData = false;
          let idx = -1;
          if (this.data.promoId && this.totalPromotionList.length > 1) {
            idx = _.findIndex(this.totalPromotionList, {
              id: this.data.promoId
            });
          }
          this.togglePanelPromoId =
            idx > -1
              ? this.totalPromotionList[idx].id
              : this.totalPromotionList[0].id;
          this.activePromotion =
            idx > -1
              ? this.totalPromotionList[idx]
              : this.totalPromotionList[0];
          if (from != 'scroll') {
            this.getPromotionView(this.activePromotion);
          }
          // this.getActivePromo(this.totalPromotionList[0]);
        } else {
          this.noData = true;
          this.dataLoad = false;
        }
      } else {
        this.dataLoad = true;
      }
    });
  }

  togglePanel(event) {
    this.togglePanelPromoId = event.id;
    const idx = _.findIndex(this.activeModPromotions, {
      promo_id: event.promo_id
    });
    this.selectedTabIndex = idx;
  }

  editPromoFromPage(promo, event) {
    event.stopPropagation();
    // this.route.navigateByUrl('vehicles/' + this.appService.adId + '/' + 'promotions');
    setTimeout(() => {
      window.open(
        APP.api_url +
          '#/vehicles/' +
          this.appService.adId +
          '/promotions' +
          '?search=' +
          promo.promo_id +
          '&id=' +
          this.activePromotion.id,
        '_blank'
      );
    }, 500);
  }

  goToPagesFromPromo(mod, event) {
    this.currentState = 'fromProm';
    this.adsService.hideHeader = true;
    this.data.fromComp = 'pages';
    this.data.currMod = mod;
    this.data.modDaata = '';
    this.data.selectedPage = mod.base_id;
    this.data.pagesInfo = this.appService.baseVersionDetails;
    this.activeModData = mod;
    this.previousId = '';
    this.loaddata();
    // window.open(
    //   APP.api_url + '#/vehicles/' + this.appService.adId + '/pages',
    //   '_blank'
    // );
  }

  createForm() {
    this.editModForm = this.fb.group({
      headline: [null],
      body_copy: [null],
      price: [null],
      offer_type_id: [null]
    });
  }

  promotionTabChanged(event) {
    // this.buttonScroll();
    if (this.selectedTabIndex == event.index) {
      return;
    }
    this.selectedTabIndex = event.index;
    this.activePromotion = this.activeModPromotions[this.selectedTabIndex];
    this.togglePanelPromoId = this.activePromotion.id;
    this.promoCollection = this.activeModPromotions;
    this.getPromotionView(this.activeModPromotions[this.selectedTabIndex]);
  }

  restrictSwitch() {
    // console.log(this.appService);
    // console.log(this.domRevisionHistory);

    this.appService.gridData.api.stopEditing();

    setTimeout(() => {
      this.adsService.promotionItems.ad_id = this.appService.adId;
      this.adsService.promotionItems.promotion_id = this.appService.promoId;
      this.adsService
        .updateFeatureItems([
          { url: 'updatePromotionsDetails' },
          this.adsService.promotionItems
        ])
        .then(res => {
          if (res.result.success) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Promotion Details Updated Successfully.'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });

            this.appService.gridData.api.tabToNextCell();

            // this.domRevisionHistory = [];
            // this.currentDomRevision = -1;
            // this.canUndoDone = false;
            // this.canRedoDone = false;
            // this.switchPromo = true;
            this.appService.switchPromoFlag = false;

            setTimeout(() => {
              this.adsService.promotionItems.items = [];
              this.canUndoDone = false;
              this.canRedoDone = false;
            }, 500);
            // console.log(this.appService);
          }
        });
    }, 1000);

    console.log(this.canUndoDone);
    return;
    let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog', 'warning-dialog'],
      width: '520px',
      data: {
        // rowData: rowData,
        mode: 'switchPromo',
        from: 'switchPromo'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.from == 'switchPromo' && result.action == 'confirmed') {
        // this.savePromoData();

        this.adsService.promotionItems.ad_id = this.appService.adId;
        this.adsService.promotionItems.promotion_id = this.appService.promoId;
        this.adsService
          .updateFeatureItems([
            { url: 'updatePromotionsDetails' },
            this.adsService.promotionItems
          ])
          .then(res => {
            if (res.result.success) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Promotion Details Updated Successfully.'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });

              // this.domRevisionHistory = [];
              // this.currentDomRevision = -1;
              // this.canUndoDone = false;
              // this.canRedoDone = false;
              // this.switchPromo = true;
              this.appService.switchPromoFlag = false;

              setTimeout(() => {
                this.adsService.promotionItems.items = [];
              }, 500);
              // console.log(this.appService);
            }
          });
      } else {
        this.appService.switchPromoFlag = false;

        setTimeout(() => {
          // this.adsubmodule.navigateTabs
        }, 500);

        // const params = {
        //   id: this.appService.promoId,
        //   // promo_id: val.promo_id,
        //   current_tab: 'promotions'
        // };
        // this.adsService
        // .getAdModules([{ url: 'getPromotionsDetails' }, params])
        // .then(res => {

        //   if (res.result.success) {

        //     // console.log(this.appService.gridapi)
        //     // this.appService.gridapi.refreshCells();

        //     // this.appService.gridapi.refreshCells();

        //     this.statementHeaders = res.result.data.statementHeaders;

        //   this.statementsData = res.result.data.statements;
        //   this.statementsData.shift();

        //   this.pricingData = res.result.data.pricing;
        //   this.pricingData.shift();

        //   this.imagesData = res.result.data.images;
        //   this.imagesData.shift();

        //   this.spText = res.result.data.spText;
        //   this.spText.shift();

        //   this.paperText = res.result.data.paperText;
        //   this.paperText.shift();

        //   this.mixMatchText = res.result.data.mixMatchText;
        //   this.mixMatchText.shift();

        //   this.digitalText = res.result.data.digitalText;
        //   this.digitalText.shift();

        //   this.appService.switchPromoFlag = false;
        //   setTimeout(() => {
        //     this.adsService.promotionItems.items = [];

        //   }, 500);
        //   }

        // })
      }
    });
  }
  public actpromoObj;
  public opendia = false;
  public promodata;
  getActivePromo(promo) {
    this.promodata = promo;
    // console.log(promo)
    // console.log(this.switchPromo);
    // console.log(this.appService.switchPromoFlag);
    // console.log(this.appService.switchPromoFlag)
    this.gridApi.stopEditing();
    this.gridApiRev1.stopEditing();
    this.gridApiRev2.stopEditing();
    this.gridApiRev3.stopEditing();
    this.gridApiRev4.stopEditing();
    this.gridApiRev5.stopEditing();
    this.gridApiRev6.stopEditing();

    this.showfltrPopover = false;

    setTimeout(() => {
      if (this.previousId == promo.id) {
        return;
      }

      if (this.opendia) {
        return;
      }
      if (
        this.appService.switchPromoFlag &&
        this.adsService.promotionItems.items.length
      ) {
        this.opendia = true;

        this.warnUserDialog(promo);
        // return
      } else {
        this.adsService.promotionItems.items = [];
        this.dataLoad = true;
        this.togglePanelPromoId = promo.id;

        // let prmo = {
        //   id: '5df9c4906b7d1d004309da2c',
        //   mod_id: '5dfb20836b7d1d009d498e84',
        //   promo_id: 351520
        // };
        this.activePromotion = promo;
        this.getPromotionView(promo);

        this.switchPromo = false;
        // this.appService.switchPromoFlag = false;
        // this.buttonScroll();
      }
    }, 500);
  }

  public pinrowArray = [];
  getPromotionView(promo) {
    this.promoObj = promo;

    // main view data call
    // if (this.previousId == this.togglePanelPromoId && promo.name == undefined) {
    //   return;
    // }

    this.previousId = promo.id;

    this.appService.promoId = this.previousId;
    const params = {
      id: promo.id,
      promo_id: promo.promo_id,
      mod_id: promo.mod_id ? promo.mod_id : this.data.currMod.mod_id,
      current_tab: this.data.fromComp
    };
    this.adsService
      .getAdModules([{ url: 'getPromotionsDetails' }, params])
      .then(res => {
        if (res.result.success) {
          this.promoDetails = res.result.data;
          this.statementsData = res.result.data.statements;

          if (res.result.data.statements.length) {
            this.promotionId = res.result.data.statements[0].promotion_id;
            this.getRevisions();
          }

          // let array23 = []
          //  array23 = res.result.data.statements;
          //  this.obj.promotion_id = array23[0].promotion_id;
          //  this.statementsData = array23.slice(1);
          if (!this.pinnedTopRowData.length) {
            this.pinnedTopRowData.push(this.statementsData[0]);
          } else {
            Object.assign(this.pinnedTopRowData[0], this.statementsData[0]);
          }

          this.statementsData.shift();

          // this.statementsData.map(ele => {
          //   if(!this.pinnedTopRowData.length) {
          //     this.pinnedTopRowData.push( this.statementsData[0]);

          //     Object.assign(this.statementsData[0], this.pinnedTopRowData[0])
          //     this.statementsData.shift();
          //   }

          // })

          // console.log(this.pinnedTopRowData)
          // console.log(this.statementsData)
          // this.statementsData.splice(0, 1)

          this.clonestatementsData = _.cloneDeep(this.statementsData);

          this.imagesData = res.result.data.images;
          if (!this.pinnedTopRowData3.length) {
            this.pinnedTopRowData3.push(this.imagesData[0]);
          } else {
            Object.assign(this.pinnedTopRowData3[0], this.imagesData[0]);
          }
          this.imagesData.shift();
          // console.log(this.imagesData);
          this.cloneimagesData = _.cloneDeep(this.imagesData);

          this.pricingData = res.result.data.pricing;
          if (!this.pinnedTopRowData2.length) {
            this.pinnedTopRowData2.push(this.pricingData[0]);
          } else {
            Object.assign(this.pinnedTopRowData2[0], this.pricingData[0]);
          }
          this.pricingData.shift();
          // console.log(this.pricingData);

          this.clonepricingData = _.cloneDeep(this.pricingData);

          this.spText = res.result.data.spText;

          if (!this.pinnedTopRowData4.length) {
            this.pinnedTopRowData4.push(this.spText[0]);
          } else {
            Object.assign(this.pinnedTopRowData4[0], this.spText[0]);
          }
          this.spText.shift();
          this.clonespText = _.cloneDeep(this.spText);

          this.paperText = res.result.data.paperText;
          if (!this.pinnedTopRowData5.length) {
            this.pinnedTopRowData5.push(this.paperText[0]);
          } else {
            Object.assign(this.pinnedTopRowData5[0], this.paperText[0]);
          }
          this.paperText.shift();
          this.clonepaperText = _.cloneDeep(this.paperText);

          this.mixMatchText = res.result.data.mixMatchText;
          if (!this.pinnedTopRowData6.length) {
            this.pinnedTopRowData6.push(this.mixMatchText[0]);
          } else {
            Object.assign(this.pinnedTopRowData6[0], this.mixMatchText[0]);
          }
          this.mixMatchText.shift();
          this.clonemixMatchText = _.cloneDeep(this.mixMatchText);

          this.digitalText = res.result.data.digitalText;
          if (!this.pinnedTopRowData7.length) {
            this.pinnedTopRowData7.push(this.digitalText[0]);
          } else {
            Object.assign(this.pinnedTopRowData7[0], this.digitalText[0]);
          }
          this.digitalText.shift();
          this.clonedigitalText = _.cloneDeep(this.digitalText);

          this.spTextTitle = res.result.data.spTextTitle;
          this.paperTextTitle = res.result.data.paperTextTitle;
          this.mixMatchTextTitle = res.result.data.mixMatchTextTitle;
          this.digitalTextTitle = res.result.data.digitalTextTitle;

          this.modInfoData = res.result.data.mod_info;
          if (res.result.data.promotion_info) {
            this.offer_type_price_grid =
              res.result.data.promotion_info.offer_type_id;
          }
          // this.modInfoData.push(...res.result.data.mod_info);
          this.statementHeaders = res.result.data.statementHeaders;
          this.imagesHeaders = res.result.data.imagesHeaders;
          this.pricingHeaders = res.result.data.pricingHeaders;
          this.spTextHeaders = res.result.data.spTextHeaders;
          this.paperTextHeaders = res.result.data.paperTextHeaders;
          this.mixMatchTextHeaders = res.result.data.mixMatchTextHeaders;
          this.digitalTextHeaders = res.result.data.digitalTextHeaders;
          // console.log(this.spTextHeaders);

          this.domRevisionHistory = [];
          this.currentDomRevision = -1;
          this.canUndoDone = false;
          this.canRedoDone = false;
          // this.disableSaveBtn = true;

          if (this.statementsData.length) {
            this.noData = false;
          } else {
            this.noData = true;
          }

          // this.columnDefsRev = res.result.data.headers;
          this.columnDefsStatement = this.generateColumns(
            this.statementHeaders,
            'statements',
            this.gridApi,
            this.statementsData
          );
          this.columnDefsImage = this.generateColumns(
            this.imagesHeaders,
            'images',
            this.gridApiRev1,
            this.imagesData
          );
          this.columnDefsPrice = this.generateColumns(
            this.pricingHeaders,
            'pricing',
            this.gridApiRev2,
            this.pricingData
          );

          this.columnDefsSptext = this.generateColumns(
            this.spTextHeaders,
            'sptext',
            this.gridApiRev3,
            this.spText
          );
          this.columnDefsPapertext = this.generateColumns(
            this.paperTextHeaders,
            'papertext',
            this.gridApiRev3,
            this.paperText
          );
          this.columnDefsMixmatchtext = this.generateColumns(
            this.mixMatchTextHeaders,
            'mixmatchtext',
            this.gridApiRev3,
            this.mixMatchText
          );
          this.columnDefsDigitaltext = this.generateColumns(
            this.digitalTextHeaders,
            'digitaltext',
            this.gridApiRev3,
            this.digitalText
          );

          setTimeout(() => {
            if (this.gridApiRev1) {
              if (this.imagesHeaders) {
                this.imagesHeaders.length < 8
                  ? this.gridApiRev1.sizeColumnsToFit()
                  : '';
              }
            }
          }, 500);
          this.dataLoad = false;
        } else {
          this.dataLoad = false;
        }

        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          for (let i = 0; i < 7; i++) {
            let a;
            a = document.getElementsByClassName('ag-floating-top-viewport')[i];
            if (a != undefined) {
              a.style.pointerEvents = 'none';
            }
          }

          this.pointerEvents = false;
          this.notAllowed = true;
          // this.pointerEventsRev1 = false;
          // this.pointerEventsRev2 = false;
          // this.pointerEventsRev3 = false;
          // this.pointerEventsRev4 = false;
          // this.pointerEventsRev5 = false;
          // this.pointerEventsRev6 = false;
        } else {
          for (let i = 0; i < 7; i++) {
            let a;
            a = document.getElementsByClassName('ag-floating-top-viewport')[i];
            if (a != undefined) {
              a.style.pointerEvents = 'unset';
            }
          }
          this.pointerEvents = true;
          this.notAllowed = false;
          // this.pointerEventsRev1 = true;
          // this.pointerEventsRev2 = true;
          // this.pointerEventsRev3 = true;
          // this.pointerEventsRev4 = true;
          // this.pointerEventsRev5 = true;
          // this.pointerEventsRev6 = true;
        }
      });
  }
  onFilterChanged(e) {
    console.log(e);
  }

  onGridReady(params) {
    this.gridApi = params.api;

    this.appService.gridapi = this.gridApi;
    // console.log(params)

    // Tell grid to run filter operation again
    // this.gridApi.onFilterChanged();
    // console.log(  this.gridApi.onFilterChanged()
    // )

    this.gridColumnApi = params.columnApi;
    this.autoSizeColumns();
    setTimeout(() => {
      this.gridVisibility = true;
      this.dataLoad = false;
      setTimeout(() => {
        // console.log(this.promoObj);
        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[0];
          a.style.pointerEvents = 'none';
          this.pointerEvents = false;
          this.notAllowed = true;
        } else {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[0];
          a.style.pointerEvents = 'unset';
          this.pointerEvents = true;
          this.notAllowed = false;
        }
      }, 500);
    }, 200);
  }

  onGridReadyRev1(params) {
    this.gridApiRev1 = params.api;

    this.appService.gridApiRev1 = this.gridApiRev1;

    this.gridColumnApiRev1 = params.columnApi;
    this.autoSizeColumnsRev1();

    setTimeout(() => {
      this.gridVisibilityRev1 = true;
      this.dataLoad = false;
      setTimeout(() => {
        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[1];
          a.style.pointerEvents = 'none';
          this.pointerEventsRev1 = false;
          this.notAllowed = true;
        } else {
          this.pointerEventsRev1 = true;
          this.notAllowed = false;
        }
      }, 500);
    }, 200);
  }

  onGridReadyRev2(params) {
    this.gridApiRev2 = params.api;

    this.appService.gridApiRev2 = this.gridApiRev2;

    this.gridColumnApiRev2 = params.columnApi;
    this.autoSizeColumnsRev2();

    setTimeout(() => {
      this.gridVisibilityRev2 = true;
      this.dataLoad = false;
      setTimeout(() => {
        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[2];
          a.style.pointerEvents = 'none';
          this.pointerEventsRev2 = false;
          this.notAllowed = true;
        } else {
          this.pointerEventsRev2 = true;
          this.notAllowed = false;
        }
      }, 500);
    }, 200);
  }

  onGridReadyRev3(params) {
    this.gridApiRev3 = params.api;
    this.appService.gridApiRev3 = this.gridApiRev3;

    this.gridColumnApiRev3 = params.columnApi;
    this.autoSizeColumnsRev3();

    setTimeout(() => {
      this.gridVisibilityRev3 = true;
      this.dataLoad = false;
      setTimeout(() => {
        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[3];
          a.style.pointerEvents = 'none';
          this.pointerEventsRev3 = false;
          this.notAllowed = true;
        } else {
          this.pointerEventsRev3 = true;
          this.notAllowed = false;
        }
      }, 500);
    }, 200);
  }
  onGridReadyRev4(params) {
    this.gridApiRev4 = params.api;
    this.appService.gridApiRev4 = this.gridApiRev4;

    this.gridColumnApiRev4 = params.columnApi;
    this.autoSizeColumnsRev4();

    setTimeout(() => {
      this.gridVisibilityRev4 = true;
      this.dataLoad = false;
      setTimeout(() => {
        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[4];
          a.style.pointerEvents = 'none';
          this.pointerEventsRev4 = false;
          this.notAllowed = true;
        } else {
          this.pointerEventsRev4 = true;
          this.notAllowed = false;
        }
      }, 500);
    }, 200);
  }

  onGridReadyRev5(params) {
    this.gridApiRev5 = params.api;
    this.appService.gridApiRev5 = this.gridApiRev5;

    this.gridColumnApiRev5 = params.columnApi;
    this.autoSizeColumnsRev5();

    setTimeout(() => {
      this.gridVisibilityRev5 = true;
      this.dataLoad = false;
      setTimeout(() => {
        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[5];
          a.style.pointerEvents = 'none';
          this.pointerEventsRev5 = false;
          this.notAllowed = true;
        } else {
          this.pointerEventsRev5 = true;
          this.notAllowed = false;
        }
      }, 500);
    }, 200);
  }

  onGridReadyRev6(params) {
    this.gridApiRev6 = params.api;
    this.appService.gridApiRev6 = this.gridApiRev6;

    this.gridColumnApiRev6 = params.columnApi;
    this.autoSizeColumnsRev6();

    setTimeout(() => {
      this.gridVisibilityRev6 = true;
      this.dataLoad = false;
      setTimeout(() => {
        if (this.promoObj.flag == 'deleted' || this.promoObj.lock == 1) {
          let a;
          a = document.getElementsByClassName('ag-floating-top-viewport')[6];
          a.style.pointerEvents = 'none';
          this.pointerEventsRev6 = false;
          this.notAllowed = true;
        } else {
          this.pointerEventsRev6 = true;
          this.notAllowed = false;
        }
      }, 500);
    }, 200);
  }
  // public gridApiRev5;
  // public gridColumnApiRev5;
  // public gridVisibilityRev5 = false;
  // public pointerEventsRev5 = false;
  autoSizeColumns() {
    this.gridColumnApi.autoSizeColumns(this.allAutoSizeColumns);
  }

  autoSizeColumnsRev1() {
    this.gridColumnApiRev1.autoSizeColumns(this.allAutoSizeColumns);
  }
  autoSizeColumnsRev2() {
    this.gridColumnApiRev2.autoSizeColumns(this.allAutoSizeColumns);
  }
  autoSizeColumnsRev3() {
    this.gridColumnApiRev3.autoSizeColumns(this.allAutoSizeColumns);
  }
  autoSizeColumnsRev4() {
    this.gridColumnApiRev4.autoSizeColumns(this.allAutoSizeColumns);
  }
  autoSizeColumnsRev5() {
    this.gridColumnApiRev5.autoSizeColumns(this.allAutoSizeColumns);
  }
  autoSizeColumnsRev6() {
    this.gridColumnApiRev6.autoSizeColumns(this.allAutoSizeColumns);
  }
  suppressEnter(params) {
    let KEY_ENTER = 13;
    var event = params.event;
    var key = event.which;
    var suppress = key === KEY_ENTER;
    return suppress;
  }
  generateColumns(data: any[], from: any, grid, griddata) {
    // console.log(data);
    const columnDefinitions = [];
    this.allAutoSizeColumns = [];
    // tslint:disable-next-line:forin
    for (const i in data) {
      const temp = {};
      temp['tooltipValueGetter'] = params => params.value;
      temp['headerName'] = data[i].name;
      temp['field'] = data[i].key;
      temp['headerTooltip'] = data[i].name;
      temp['promoId'] = this.promoObj;

      if (data[i].type == 'image') {
        temp['cellEditor'] = 'autofillEditor';
        // temp['cellRenderer'] = params => {
        // }
      }

      if (data[i].key == 'images') {
        temp['cellClass'] = 'img-search promo-img-field';
        if (from === 'images') {
          temp['cellRenderer'] = params => {
            let arr = [];
            // if (params.data[data[i].key].length) {
            //   let cnt =
            //     params.data[data[i].key][0].length > 3
            //       ? params.data[data[i].key][0].length - 3
            //       : 0;
            //   let arrLoop = data[i].name;
            //   params.data[data[i].key][0].length > 3
            //     ? 3
            //     : params.data[data[i].key][0].length;
            //   for (let i1 = 0; i1 < arrLoop; i1++) {
            //     arr.push(
            //       `<img class="img-responsive offer-img" src="` +
            //         params.data[data[i].key][0][i1].previewUrl +
            //         `">`
            //     );
            //   }
            //   if (cnt > 0) {
            //     arr.push(`<span class="img-count">` + '+' + cnt + `</span>`);
            //   }
            // }
            if (this.data.fromComp == 'promotions' && data[i].key == 'images') {
              return (
                arr +
                `<span class="search-icon"><em class="pixel-icons icon-search"></em></span>`
              );
            } else {
              return arr + ``;
            }

            // params.value
            //   ? `<img class="img-responsive offer-img" src="
            //   ` +
            //       params.data.image +
            //       `">`
            //   : '';
          };
        }
      }
      if (from === 'statements') {
        this.disableColumns = this.promoDetails.statementDisableColumns;
      }
      if (from === 'images') {
        this.disableColumns = this.promoDetails.imagesDisableColumns;
        if (data[i].type === 'image') {
          // temp['editable'] = false;
          // temp['tooltipComponent'] = 'customTooltipComponent';
          temp['tooltipValueGetter'] = params => '';
          temp['suppressKeyboardEvent'] = this.suppressEnter;
          temp['cellClass'] = 'fetured-img img-search';
          temp['type'] = 'image';

          // temp['tooltipComponentParams'] =  data[i].key;
          temp['cellRenderer'] = params => {
            // let arr = [];
            // console.log(params);
            let arr;
            // console.log(params)
            // console.log(params.data[data[i].key])

            if (
              params.data[data[i].key] != '' &&
              params.data[data[i].key].image_path != undefined
            ) {
              // console.log(params.data[data[i].key]);
              // console.log(JSON.parse(params.data[data[i].key]))

              arr =
                ` <div class="img-delete-sec"><img class="img-responsive offer-img" src="` +
                params.data[data[i].key].image_path +
                `">
               
                </div>`;

              //   <span class="search-icon" *ngIf="`
              //   +     params.data[data[i].key] +
              //  `"><em class="pixel-icons icon-delete"></em></span>
            } else if (
              params.data[data[i].key] != '' &&
              params.data[data[i].key].image_path == undefined
            ) {
              let a = JSON.parse(params.data[data[i].key]);
              // console.log(a)

              if (a.value != '' && typeof a.value == 'object') {
                // console.log(JSON.parse(params.data[data[i].key]))

                arr =
                  ` <div class="img-delete-sec"><img class="img-responsive offer-img" src="` +
                  a.value.image_path +
                  `">
               
                </div>`;
              }

              //   <span class="search-icon" *ngIf="`
              //   +     params.data[data[i].key] +
              //  `"><em class="pixel-icons icon-delete"></em></span>
            } else {
              // console.log(params.data[data[i].key]);

              arr = '';
            }
            // if (params.data[data[i].key].length) {
            //   let cnt =
            //     params.data[data[i].key][0].length > 3
            //       ? params.data[data[i].key][0].length - 3
            //       : 0;
            //   let arrLoop = data[i].name;
            //   params.data[data[i].key][0].length > 3
            //     ? 3
            //     : params.data[data[i].key][0].length;
            //   for (let i1 = 0; i1 < arrLoop; i1++) {
            //     arr.push(
            //       `<img class="img-responsive offer-img" src="` +
            //         params.data[data[i].key][0][i1].previewUrl +
            //         `">`
            //     );
            //   }
            //   if (cnt > 0) {
            //     arr.push(`<span class="img-count">` + '+' + cnt + `</span>`);
            //   }
            // }
            if (this.data.fromComp == 'promotions' && data[i].key == 'images') {
              return (
                arr +
                `<span class="search-icon"><em class="pixel-icons icon-search"></em></span>`
              );
            } else {
              return arr;
              // +
              // `<span class="search-icon"><em class="pixel-icons icon-delete 123"></em></span>`
            }

            // params.value
            //   ? `<img class="img-responsive offer-img" src="
            //   ` +
            //       params.data.image +
            //       `">`
            //   : '';
          };
          temp['keyCreator'] = params => {
            try {
              var parsed = JSON.parse(params.value);
            } catch (e) {
              // Oh well, but whatever...
            }
            // console.log(parsed)

            //  let parseVal = params.newValue ? parsed : params.newValue;
            let idx1 = _.findIndex(this.imagesData, {
              id: parsed ? parsed.id : params.value
            });
            if (idx1 > -1) {
              return parsed.value['dam:scene7File'];
            } else {
              return parsed.value['dam:scene7File'];
            }
          };
          temp['valueGetter'] = params => {
            if (params.data) {
              let dummyJson = {
                id: params.data ? params.data.item_id : '',
                col: params.colDef.field,
                value: params.data[data[i].key]
              };
              return JSON.stringify(dummyJson);
            }
          };
        }
      }

      if (from === 'pricing') {
        // this.pricingClassRules = {
        //   'editable_cells hidden': function(params) {

        //     return params.data ? params.data.isPowerLineRow : '';
        //   },

        // };

        // temp['cellClass'] = params => {
        //   console.log(params)

        //   return (params.data.srpq == '' ?'editable_cells hidden':'editable_cells');

        // }

        // if(data[i].type == 'number' && griddata[0].isPowerLineRow) {
        // temp['cellClass'] = 'editable_cells hidden';

        // }

        this.disableColumns = this.promoDetails.pricingDisableColumns;
      }

      if (from === 'sptext') {
        this.disableColumns = this.promoDetails.spTextDisableColumns;
      }
      if (from === 'papertext') {
        this.disableColumns = this.promoDetails.paperTextDisableColumns;
      }
      if (from === 'digitaltext') {
        this.disableColumns = this.promoDetails.digitalTextDisableColumns;
      }
      if (from === 'mixmatchtext') {
        this.disableColumns = this.promoDetails.mixMatchTextDisableColumns;
      }

      if (this.data.fromComp == 'promotions') {
        // console.log(from, data[i].type);
        if (from === 'images' && data[i].type == 'image') {
          temp['cellClass'] = 'editable_cells img-search';
        }

        // console.log(this.disableColumns)
        if (this.disableColumns != null) {
          const navIdx = this.disableColumns.indexOf(temp['field']);

          temp['editable'] = !(navIdx > -1);
          if (temp['editable'] && !temp['cellClass']) {
            if (data[i].type == 'image') {
              temp['cellClass'] = 'editable_cells hidden';
            } else {
              temp['cellClass'] = 'editable_cells';
            }

            temp['type'] = data[i].type;
            // temp['filter'] = false;

            // temp['cellStyle'] = params => {
            //   if (this.newTriggerClr && params.value != this.lastEditBfVal) {
            //     if (data[i].key === 'unit') {
            //       temp['cellClass'] = ' editable_cells edit_done';
            //     }
            //     return { backgroundColor: '#fff1c1' };
            //   }
            // };
            if (
              data[i].key == 'edited_headline' ||
              data[i].key == 'edited_body_copy'
            ) {
              temp['cellEditor'] = 'autofillEditor';
              // temp['cellRenderer'] = params => {
              // }
            }
            if (data[i].type === 'multi_select' || data[i].type == 'dropdown') {
              // temp['cellClass'] = 'editable_cells multi-select';
              // temp['cellEditor'] = 'offerUnitCellRenderer';
            } else if (data[i].type === 'date') {
              temp['cellEditor'] = 'dateEditor';
              temp['cellClass'] = 'editable_cells calendar-icon';
            } else if (data[i].type === 'price') {
              temp['cellEditor'] = 'priceEditor';
              temp['cellClass'] = 'editable_cells price';
            } else if (data[i].type === 'number') {
              temp['cellEditor'] = 'numericEditor';
              temp['cellClass'] = 'editable_cells number';
            } else if (data[i].type == 'checkbox') {
              // temp['checkboxSelection'] = true;
              // temp['headerCheckboxSelection'] = false;
              // temp['headerCheckboxSelectionFilteredOnly'] = true;
              temp['cellRendererFramework'] = AgGridCheckboxComponent;
              temp['cellClass'] = 'ag-custom-checkbox';
            }
          }
          if (data[i].type === 'multi_select' || data[i].type === 'dropdown') {
            temp['cellClass'] = 'editable_cells multi-select';
            temp['cellEditor'] = 'offerUnitCellRenderer';
            temp['tooltipValueGetter'] = params => params.value.values;
            temp['onCellValueChanged'] = params => {
              // console.log(params)
              if (document.querySelector('.pi-select-list')) {
                document.body.removeChild(
                  document.querySelector('.pi-select-list')
                );
              }
            };
            temp['cellRenderer'] = params => {
              // console.log(typeof params.data[data[i].key].id);
              if (typeof params.data[data[i].key].id == 'string') {
                if (
                  params.data[data[i].key] &&
                  params.data[data[i].key].value
                ) {
                  // console.log(typeof params.data[data[i].key].id)
                  // console.log(typeof params.data[data[i].key])

                  return params.data[data[i].key].value;
                } else {
                  // console.log(typeof params.data[data[i].key].id)

                  return params.data[data[i].key].values;
                }
              } else {
                // console.log(data[i].key)

                if (data[i].key == 'logo_04') {
                  if (
                    params.data[data[i].key] &&
                    params.data[data[i].key].value
                  ) {
                    // console.log(typeof params.data[data[i].key].id)
                    // console.log(typeof params.data[data[i].key])

                    return params.data[data[i].key].value;
                  } else {
                    // console.log(typeof params.data[data[i].key].id)

                    return params.data[data[i].key].values;
                  }
                } else {
                  return;
                }

                // return;
                // console.log(typeof params.data[data[i].key].id)
                // console.log(typeof params.data[data[i].key])
              }
            };

            temp['valueGetter'] = params => {
              if (params.data) {
                let dummyJson = {
                  id: params.data ? params.data.item_id : '',
                  col: params.colDef.field,
                  value: params.data[data[i].key]
                };
                return JSON.stringify(dummyJson);
              }
            };
            temp['keyCreator'] = params => {
              // console.log(JSON.parse( params.value))
              let a = JSON.parse(params.value);
              return a.value.value;
            };
          } else if (data[i].type === 'date') {
            // temp['cellEditor'] = 'dateEditor';
            // temp['cellClass'] = 'editable_cells calendar-icon';
            temp['cellRenderer'] = (params: { value: moment.MomentInput }) => {
              if (params.value) {
                return moment(params.value).format('MM/DD/YYYY');
              }
            };
            temp['keyCreator'] = (params: { value: moment.MomentInput }) => {
              return moment(params.value).format('MM/DD/YYYY');
            };
          }
        }
      }
      if (this.data.fromComp == 'pages') {
        if (data[i].type === 'multi_select' || data[i].type === 'dropdown') {
          temp['tooltipValueGetter'] = params => params.value.values;
          temp['cellRenderer'] = params => {
            if (params.value && params.value.values) {
              return params.value.values;
            } else {
              return '';
            }
          };
          temp['keyCreator'] = params => {
            return params.value.values;
          };
        } else if (data[i].type === 'date') {
          // temp['cellEditor'] = 'dateEditor';
          // temp['cellClass'] = 'editable_cells calendar-icon';
          temp['cellRenderer'] = (params: { value: moment.MomentInput }) => {
            if (params.value) {
              return moment(params.value).format('MM/DD/YYYY');
            }
          };
        } else if (data[i].type == 'checkbox') {
          temp['checkboxSelection'] = true;
          temp['headerCheckboxSelection'] = false;
          temp['headerCheckboxSelectionFilteredOnly'] = true;
        }
      }

      this.allAutoSizeColumns.push(data[i].key);
      columnDefinitions.push(temp);
    }
    return columnDefinitions;
  }
  // cellEditingStarted(ev) {
  //   this.lastEditBfVal = ev.value;
  //   this.newTriggerClr = true;
  // }
  // cellEditingStopped(ev) {
  //   this.newTriggerClr = false;
  // }
  close() {
    if (!this.enableSaveBtn) {
      this.adsService.hideHeader = false;
      if (this.currentState == 'fromProm') {
        this.previousId = '';
        this.data.fromComp = 'promotions';
        this.getPromotionView(this.activePromotion);
        this.currentState = '';
        return;
      }
      this.closeEdit.emit(event);
      return;
    }
    let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      data: {
        // rowData: rowData,
        selectedRow: { ad_id: this.appService.adId },
        mode: 'split-mod'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.from === 'confirm') {
        this.adsService.hideHeader = false;
        if (this.currentState == 'fromProm') {
          this.previousId = '';
          this.data.fromComp = 'promotions';
          this.getPromotionView(this.activePromotion);
          this.currentState = '';
          return;
        }
        this.closeEdit.emit(event);
      }
    });
  }

  updatedPowerLineValue(array, colname, params) {
    array.forEach(element => {
      let itemsObj = {
        key: colname,
        item_id: element.item_id,
        value: element[colname]
      };

      if (params.colDef.type == 'price') {
        itemsObj.value = parseFloat(params.newValue);
      } else if (params.colDef.type == 'number') {
        itemsObj.value = parseInt(params.newValue);
      } else if (params.colDef.type == 'image') {
        let imgpath = JSON.parse(params.newValue);
        let a;
        let path;
        if (imgpath.value != '') {
          a = JSON.parse(imgpath.value);
          path = a.value;
          itemsObj.value = path;
        } else {
          a = '';
          path = a;
          itemsObj.value = path;
        }
      } else {
        if (params.colDef.cellEditor == 'offerUnitCellRenderer') {
          itemsObj.value = element[colname].id;
        }
        if (params.colDef.field == 'logo_04') {
          if (element[colname].id == '') {
            itemsObj.value = '';
          } else {
            itemsObj.value = element[colname].id[0];
          }
        }
      }

      this.adsService.promotionItems.items.push(itemsObj);
    });
  }

  public aggridFilterRows = [];
  public aggridFilterRows1 = [];
  public newDomrev = [];
  onPasteStart(e) {
    console.log(e);
    this.pasteInfo.status = true;
    this.pasteInfo.randKey = Math.floor(1000000 + Math.random() * 9000000);
  }
  onPasteEnd(e) {
    console.log(e);
    this.pasteInfo.status = false;
    this.pasteInfo.randKey = 0;
  }
  onCellValueChanged(params, gridData, gridname) {
    // let cellRanges =params.api.getCellRanges();
    // console.log(123);

    this.appService.gridData = params;
    // console.log(params);
    // console.log(typeof JSON.parse(params.value));
    // let val1;
    // if (params.colDef.type != 'image' && params.value != '') {
    //   val1 = JSON.parse(params.value);
    // } else {
    //   val1 = params.value;
    // }

    // if (params.colDef.type != 'image' && typeof val1 == 'object') {
    //   // let rowNode = this.gridApi.getRowNode(params.data.item_id);
    //   params.node.setDataValue(params.colDef.field, params.oldValue);
    //   this.gridApi.flashCells({
    //     rowNodes: [params.node],
    //     columns: [params.colDef.field]
    //   });
    //   return;
    // }
    // console.log(JSON.parse(params.data[params.colDef.field]))

    // this.generateColumns(this.imagesHeaders, 'images', '', '') ;

    // this.imagesData = res.result.data.images;

    // let  filterInstance = this.gridApi.getFilterInstance('page')
    // console.log(
    //   this.currentDomRevision,
    //   this.domRevisionHistory,
    //   this.domUpdateFilter
    // );

    this.aggridFilterRows = [];
    if (this.domUpdateFilter.isChange && this.currentDomRevision > -1) {
      if (this.domUpdateFilter.changeAc == 'redo') {
        this.aggridFilterRows = this.domRevisionHistory[
          this.currentDomRevision - 1
        ].filterRows;
      } else {
        this.aggridFilterRows = this.domRevisionHistory[
          this.currentDomRevision
        ].filterRows;
      }
      this.domUpdateFilter.isChange = false;
    } else {
      this.aggridFilterRows = params.api.rowModel.rowsToDisplay;
    }
    // console.log( this.aggridFilterRows)
    // var arr = _.cloneDeep( this.aggridFilterRows);
    //     console.log(arr)

    // console.log(this.aggridFilterRows)

    // console.log(params.colDef.cellEditor);

    if (params.oldValue == '' && params.newValue == '') {
      return;
    }

    // if (params.oldValue == params.newValue) {
    //   return;
    // }
    // console.log(this.appService.focusImgFlag)
    if (this.appService.focusImgFlag && !params.data.isPowerLineRow) {
      let path;
      let b = JSON.parse(params.newValue);
      // console.log(b)

      let d = b.value;

      if (d == undefined) {
        return;
      }
      let e;
      // console.log(d)
      if (d == '') {
        return;
      }

      if (d != undefined && typeof d != 'object') {
        e = JSON.parse(d);
      } else {
        e = d;
      }
      // console.log(e)

      // console.log(e.value)
      if (typeof e.value != 'string') {
        // console.log(params.data.item_id)

        let rowNode1;

        if (e.value != undefined) {
          rowNode1 = this.gridApiRev1.getRowNode(params.data.item_id);
          // console.log(rowNode1)
          rowNode1.setDataValue(params.colDef.field, e.value);
        } else {
          rowNode1 = this.gridApiRev1.getRowNode(params.data.item_id);
          // console.log(rowNode1)
          rowNode1.setDataValue(params.colDef.field, e);
        }

        this.gridApiRev1.refreshCells({
          force: true,
          rowNodes: [rowNode1],
          columns: [params.colDef.field]
        });
        this.appService.focusImgFlag = false;
      } else {
        // console.log(e)
        if (e.value != '') {
          let a = JSON.parse(e.value);

          let rowNode1 = this.gridApiRev1.getRowNode(params.data.item_id);
          rowNode1.setDataValue(params.colDef.field, a.value);
          this.gridApiRev1.refreshCells({
            force: true,
            rowNodes: [rowNode1],
            columns: [params.colDef.field]
          });
          this.appService.focusImgFlag = false;
        } else {
          let rowNode1 = this.gridApiRev1.getRowNode(params.data.item_id);
          rowNode1.setDataValue(params.colDef.field, e.value);
          this.gridApiRev1.refreshCells({
            force: true,
            rowNodes: [rowNode1],
            columns: [params.colDef.field]
          });
          this.appService.focusImgFlag = false;
        }
      }
    }

    // this.switchPromo = false;

    // POWERLINE FEATURE

    // this.disableSaveBtn = false;

    if (params.data.isPowerLineRow) {
      // console.log(22222)
      this.powerlineGridData = gridData;
      var parsed = params.data[params.colDef.field];
      var parsedOld = params.oldValue;
      let colname = params.colDef.field;
      let arr = [];

      // this.powerlineGridData.map(element => {
      //   if (element.hasOwnProperty(params.colDef.field)) {
      //     let colname = params.colDef.field;
      //     element[colname] = parsed;

      //     arr.push(element);
      //   }
      // });

      // this.clonestatementsData2.forEach((obj, index) => {
      //           console.log(params.colDef.field)
      //           console.log(params.data[params.colDef.field])

      // })

      if (gridname == 'copystatement') {
        // console.log(params.oldValue)
        // console.log(params.newValue)
        // let stData = this.statementsData;

        if (params.data[params.colDef.field] != '') {
          // this.aggridFilterRows = [];
          this.aggridFilterRows1 = [];
          if (this.aggridFilterRows.length) {
            this.aggridFilterRows.map(ele => {
              // console.log(this.aggridFilterRows, ele);
              this.aggridFilterRows1.push(ele.data);

              // MY new code
              let idx1 = _.findIndex(this.statementsData, {
                item_id: ele.data.item_id
              });
              this.statementsData[idx1][colname] = parsed;
              params.api.refreshCells({
                force: true,
                rowNodes: [ele],
                columns: [colname]
              });

              // params.api.onFilterChanged();
              // params.api.setFilterModel(parsed);
              //end of code
            });
            // this.statementsData = this.aggridFilterRows1;
          } else {
            this.statementsData = this.statementsData;
          }

          this.clonestatementsData2 = this.statementsData;

          this.updatedPowerLineValue(
            this.statementsData,
            params.colDef.field,
            params
          );
        } else {
          let arr2 = [];
          // console.log(this.clonestatementsData);
          // console.log(this.clonestatementsData2);

          // let target = this.statementsData[0];
          // let source = this.clonestatementsData2[0];

          // Object.assign(source, target);

          this.clonestatementsData2.map((obj, index) => {
            this.domRevisionHistory.forEach(element => {
              // if (obj.item_id == element.item_id) {
              //   let colname = params.colDef.field;

              //   if (obj.item_id != '') {
              //     obj[colname] = element.old_value;
              //   }
              // }
              let rowNode = this.gridApi.getRowNode(obj.item_id);

              let idx1 = _.findIndex(this.statementsData, {
                item_id: obj.item_id
              });
              this.statementsData[idx1][colname] = obj[colname];
              params.api.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: [colname]
              });
            });

            arr2.push(obj);
          });

          // this.statementsData = arr2;
        }
      } else if (gridname == 'pricingdata') {
        if (params.data[params.colDef.field] != '') {
          this.aggridFilterRows1 = [];
          if (this.aggridFilterRows.length) {
            this.aggridFilterRows.map(ele => {
              this.aggridFilterRows1.push(ele.data);
              // MY new code
              let idx1 = _.findIndex(this.pricingData, {
                item_id: ele.data.item_id
              });
              this.pricingData[idx1][colname] = parsed;
              params.api.refreshCells({
                force: true,
                rowNodes: [ele],
                columns: [colname]
              });
              // params.api.onFilterChanged();
              // params.api.setFilterModel([parsed]);
              //end of code
            });
            // this.pricingData = this.aggridFilterRows1;
          } else {
            this.pricingData = this.pricingData;
          }

          this.updatedPowerLineValue(
            this.pricingData,
            params.colDef.field,
            params
          );
          this.clonepricingData2 = this.pricingData;
        } else {
          let arr2 = [];
          this.clonepricingData2.map((obj, index) => {
            this.domRevisionHistory.forEach(element => {
              // if (obj.item_id == element.item_id) {
              //   let colname = params.colDef.field;
              //   if (obj.item_id != '') {
              //     obj[colname] = element.old_value;
              //   }
              // }
              let rowNode = this.gridApi.getRowNode(obj.item_id);

              let idx1 = _.findIndex(this.pricingData, {
                item_id: obj.item_id
              });
              this.pricingData[idx1][colname] = obj[colname];
              params.api.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: [colname]
              });
            });
            // arr2.push(obj);
          });
          // this.pricingData = arr2;
        }
      } else if (gridname == 'imagedata') {
        if (
          params.data[params.colDef.field] != '' &&
          params.data[params.colDef.field].id != ''
        ) {
          this.aggridFilterRows1 = [];
          if (this.aggridFilterRows.length) {
            this.aggridFilterRows.map(ele => {
              this.aggridFilterRows1.push(ele.data);

              // MY new code
              let idx1 = _.findIndex(this.imagesData, {
                item_id: ele.data.item_id
              });
              // console.log(parsed)
              this.imagesData[idx1][colname] = parsed;
              params.api.refreshCells({
                force: true,
                rowNodes: [ele],
                columns: [colname]
              });
              // params.api.onFilterChanged();
              // params.api.setFilterModel([parsed]);
              //end of code
            });
            // this.imagesData = this.aggridFilterRows1;
          } else {
            this.imagesData = this.imagesData;
          }

          this.updatedPowerLineValue(
            this.imagesData,
            params.colDef.field,
            params
          );
          this.cloneimagesData2 = this.imagesData;
        } else {
          // this.imagesData = this.cloneimagesData2;

          let arr2 = [];

          this.cloneimagesData2.map((obj, index) => {
            this.domRevisionHistory.forEach(element => {
              // if (obj.item_id == element.item_id) {
              //   let colname = params.colDef.field;
              //   if (obj.item_id != '') {
              //     obj[colname] = element.old_value;
              //   }
              // }

              let rowNode = this.gridApi.getRowNode(obj.item_id);

              let idx1 = _.findIndex(this.imagesData, {
                item_id: obj.item_id
              });
              this.imagesData[idx1][colname] = obj[colname];
              params.api.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: [colname]
              });
            });
            // arr2.push(obj);
          });

          // this.imagesData = arr2;
        }
      } else if (gridname == 'sptext') {
        if (params.data[params.colDef.field] != '') {
          this.aggridFilterRows1 = [];
          if (this.aggridFilterRows.length) {
            this.aggridFilterRows.map(ele => {
              this.aggridFilterRows1.push(ele.data);

              // MY new code
              let idx1 = _.findIndex(this.spText, {
                item_id: ele.data.item_id
              });
              this.spText[idx1][colname] = parsed;
              params.api.refreshCells({
                force: true,
                rowNodes: [ele],
                columns: [colname]
              });
              // params.api.onFilterChanged();
              // params.api.setFilterModel([parsed]);
              //end of code
            });
            // this.spText = this.aggridFilterRows1;
          } else {
            this.spText = this.spText;
          }

          this.updatedPowerLineValue(this.spText, params.colDef.field, params);
          this.clonespText2 = this.spText;
        } else {
          let arr2 = [];
          this.clonespText2.map((obj, index) => {
            this.domRevisionHistory.forEach(element => {
              // if (obj.item_id == element.item_id) {
              //   let colname = params.colDef.field;
              //   if (obj.item_id != '') {
              //     obj[colname] = element.old_value;
              //   }
              // }

              let rowNode = this.gridApi.getRowNode(obj.item_id);

              let idx1 = _.findIndex(this.spText, {
                item_id: obj.item_id
              });
              this.spText[idx1][colname] = obj[colname];
              params.api.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: [colname]
              });
            });
            // arr2.push(obj);
          });

          // this.spText = this.spText;
        }
      } else if (gridname == 'papertext') {
        if (params.data[params.colDef.field] != '') {
          // this.paperText = arr;
          this.aggridFilterRows1 = [];
          if (this.aggridFilterRows.length) {
            this.aggridFilterRows.map(ele => {
              this.aggridFilterRows1.push(ele.data);

              // MY new code
              let idx1 = _.findIndex(this.paperText, {
                item_id: ele.data.item_id
              });
              this.paperText[idx1][colname] = parsed;
              params.api.refreshCells({
                force: true,
                rowNodes: [ele],
                columns: [colname]
              });
              // params.api.onFilterChanged();
              // params.api.setFilterModel([parsed]);
              //end of code
            });
            // this.paperText = this.aggridFilterRows1;
          } else {
            this.paperText = this.paperText;
          }

          this.updatedPowerLineValue(
            this.paperText,
            params.colDef.field,
            params
          );
          this.clonepaperText2 = this.paperText;
        } else {
          let arr2 = [];
          this.clonepaperText2.map((obj, index) => {
            this.domRevisionHistory.forEach(element => {
              // if (obj.item_id == element.item_id) {
              //   let colname = params.colDef.field;
              //   if (obj.item_id != '') {
              //     obj[colname] = element.old_value;
              //   }
              // }

              let rowNode = this.gridApi.getRowNode(obj.item_id);

              let idx1 = _.findIndex(this.paperText, {
                item_id: obj.item_id
              });
              this.paperText[idx1][colname] = obj[colname];
              params.api.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: [colname]
              });
            });
            // arr2.push(obj);
          });
          // this.paperText = this.paperText;
        }
      } else if (gridname == 'mixmatchtext') {
        if (params.data[params.colDef.field] != '') {
          // this.mixMatchText = arr;
          this.aggridFilterRows1 = [];
          if (this.aggridFilterRows.length) {
            this.aggridFilterRows.map(ele => {
              this.aggridFilterRows1.push(ele.data);

              // MY new code
              let idx1 = _.findIndex(this.mixMatchText, {
                item_id: ele.data.item_id
              });
              this.mixMatchText[idx1][colname] = parsed;
              params.api.refreshCells({
                force: true,
                rowNodes: [ele],
                columns: [colname]
              });
              // params.api.onFilterChanged();
              // params.api.setFilterModel([parsed]);
              //end of code
            });
            // this.mixMatchText = this.aggridFilterRows1;
          } else {
            this.mixMatchText = this.mixMatchText;
          }

          this.updatedPowerLineValue(
            this.mixMatchText,
            params.colDef.field,
            params
          );
          this.clonemixMatchText2 = this.mixMatchText;
        } else {
          let arr2 = [];
          this.clonemixMatchText2.map((obj, index) => {
            this.domRevisionHistory.forEach(element => {
              // if (obj.item_id == element.item_id) {
              //   let colname = params.colDef.field;
              //   if (obj.item_id != '') {
              //     obj[colname] = element.old_value;
              //   }
              // }

              let rowNode = this.gridApi.getRowNode(obj.item_id);

              let idx1 = _.findIndex(this.mixMatchText, {
                item_id: obj.item_id
              });
              this.mixMatchText[idx1][colname] = obj[colname];
              params.api.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: [colname]
              });
            });
            // arr2.push(obj);
          });
          // this.mixMatchText = arr2;
        }
      } else if (gridname == 'digitaltext') {
        if (params.data[params.colDef.field] != '') {
          // this.digitalText = arr;
          if (this.aggridFilterRows.length) {
            this.aggridFilterRows.map(ele => {
              this.aggridFilterRows1.push(ele.data);

              // MY new code
              let idx1 = _.findIndex(this.digitalText, {
                item_id: ele.data.item_id
              });
              this.digitalText[idx1][colname] = parsed;
              params.api.refreshCells({
                force: true,
                rowNodes: [ele],
                columns: [colname]
              });
              // params.api.onFilterChanged();
              // params.api.setFilterModel([parsed]);
              //end of code
            });
            // this.digitalText = this.aggridFilterRows1;
          } else {
            this.digitalText = this.digitalText;
          }

          this.updatedPowerLineValue(
            this.digitalText,
            params.colDef.field,
            params
          );
          this.clonedigitalText2 = this.digitalText;
        } else {
          let arr2 = [];
          this.clonedigitalText2.map((obj, index) => {
            this.domRevisionHistory.forEach(element => {
              // if (obj.item_id == element.item_id) {
              //   let colname = params.colDef.field;
              //   if (obj.item_id != '') {
              //     obj[colname] = element.old_value;
              //   }
              // }

              let rowNode = this.gridApi.getRowNode(obj.item_id);

              let idx1 = _.findIndex(this.digitalText, {
                item_id: obj.item_id
              });
              this.digitalText[idx1][colname] = obj[colname];
              params.api.refreshCells({
                force: true,
                rowNodes: [rowNode],
                columns: [colname]
              });
            });
            // arr2.push(obj);
          });
          // this.digitalText = arr2;
        }
      }

      //   const rowNode = params.api.getDisplayedRowAtIndex(params.rowIndex);

      //   if(parsed != parsedOld) {
      // rowNode.setDataValue(params.colDef.field, parsed);

      //   }
    } else {
      if (params.colDef.type == 'image' && this.imgCopyPasteFlag) {
        // let b = JSON.parse(params.newValue);

        // let d = b.value;
        // let e;
        // if (typeof d != 'object') {
        //   e = JSON.parse(d);
        // } else {
        //   e = d;
        // }

        // let rowNode1 = this.gridApiRev1.getRowNode(params.data.item_id);
        // rowNode1.setDataValue(
        //   params.colDef.field,
        //   params.data[params.colDef.field]
        // );
        // this.gridApiRev1.refreshCells({
        //   force: true,
        //   rowNodes: [rowNode1],
        //   columns: [params.colDef.field]
        // });
        // console.log(54545454)

        let itemsObj = {
          item_id: params.data.item_id,
          key: params.colDef.field,
          value: params.data[params.colDef.field]
        };

        this.adsService.promotionItems.items.push(itemsObj);
      } else if (params.colDef.type == 'image' && !this.imgCopyPasteFlag) {
        // let b = JSON.parse(params.newValue);
        // if(b != '') {
        //   let c = JSON.parse(b.value)

        // }
        // console.log(b)
        let itemsObj = {
          item_id: params.data.item_id,
          key: params.colDef.field,
          value: params.data[params.colDef.field]
        };
        if (
          params.data[params.colDef.field] != '' &&
          typeof params.data[params.colDef.field] == 'string'
        ) {
          let obj = JSON.parse(params.data[params.colDef.field]);
          itemsObj.value = obj.value;
        } else {
          itemsObj.value = params.data[params.colDef.field];
        }

        this.adsService.promotionItems.items.push(itemsObj);
      }
      //    const rowNode = params.api.getDisplayedRowAtIndex(params.data.item_id);
      //    var parsed = params.data[params.colDef.field];
      //    console.log(rowNode)
      // rowNode.setDataValue(params.colDef.field, parsed);
      // let itemsObj = {
      //   item_id: params.data.item_id,
      //   key: params.colDef.field,
      //   value: params.newValue
      // };
      // this.adsService.promotionItems.items.push(itemsObj);
      // this.prms.items.push(itemsObj);
      //  if(this.allowDelcal) {
      // const params1 = {
      //   id: this.activePromotion.id,
      //   promo_id: this.activePromotion.promo_id,
      //   offer_type_id: this.offer_type_price_grid,
      //   current_tab: this.data.fromComp
      // };
      // this.adsService
      //   .getAdModules([{ url: 'getPromotionsDetails' }, params1])
      //   .then(res => {
      //     this.imagesData = res.result.data.images;
      //     this.imagesData.shift();
      //   });
      // }
    }

    this.rowIndex = params.rowIndex;

    // let a = params.api.rangeController.cellRanges[0].start.rowIndex;
    // let b = params.api.rangeController.cellRanges[0].end.rowIndex;

    // console.log(a, b)

    // if( this.cellKeyDown ) {
    // // for(let i = a; i <= b; i++) {
    // this.newDomrev.push(params.data);
    // // }
    // }
    // console.log(this.newDomrev)

    // if(this.newDomrev.length != 2) {
    //   return
    // }

    let revHis;

    revHis = {
      item_id: params.data.item_id,
      column_key: params.colDef.field, // change to key
      old_value: params.oldValue,
      new_value: params.newValue,
      batch_id: this.pasteInfo.status ? this.pasteInfo.randKey : 0,
      flag: gridname,
      filterRows: this.aggridFilterRows
    };
    this.cellclickFlag = false;

    if (params.colDef.cellEditor == 'offerUnitCellRenderer') {
      let a = JSON.parse(params.oldValue);
      let b = JSON.parse(params.newValue);

      revHis.old_value = a.value;
      revHis.new_value = b.value;

      this.imgCopyPasteFlag = true;
    } else {
      // console.log(params)
      revHis.old_value = params.oldValue;
      revHis.new_value = params.newValue;
    }
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
      //  if(!this.cellKeyDown) {
      this.domRevisionHistory.push(revHis);
      //  } else {
      //    this.newDomrev.push(revHis);
      //  }

      this.currentDomRevision = -1;
      this.canUndoDone = true;
    }

    if (
      params.colDef.cellEditor != 'offerUnitCellRenderer' &&
      params.colDef.type != 'image'
    ) {
      let itemsObj = {
        item_id: params.data.item_id,
        key: params.colDef.field,
        value: params.newValue
      };

      if (params.colDef.type == 'price') {
        itemsObj.value = parseFloat(params.newValue);
      } else if (params.colDef.type == 'number') {
        itemsObj.value = parseInt(params.newValue);
      } else {
        itemsObj.value = params.newValue;
      }
      this.adsService.promotionItems.items.push(itemsObj);
      this.prms.items.push(itemsObj);
    }

    // if (!this.domRevisionHistory.length) {
    //   this.appService.switchPromoFlag = false;
    // } else {
    //   this.appService.switchPromoFlag = true;
    // }
    // console.log(this.domRevisionHistory);

    // console.log(this.statementsData);
    // console.log(this.clonestatementsData)

    // console.log(this.clonestatementsData2)
    return;

    if (this.deleteKeyPressed) {
      setTimeout(() => {
        this.deleteKeyPressed = false;
      }, 500);
      return;
    }
    this.prms.promotion_id = params.data.promotion_id;
    const rowNode = params.api.getDisplayedRowAtIndex(params.rowIndex);

    if (this.lastUpdatedData === params.newValue) {
      return;
    }
    if (!params.value && params.oldValue == params.newValue) {
      return;
    }
    if (params.value == null) {
      return;
    }
    try {
      var parsed = JSON.parse(params.data[params.colDef.field]);
      var parsedOld = JSON.parse(params.oldValue);
    } catch (e) {
      // Oh well, but whatever...
    }
    if (
      parsedOld &&
      parsedOld.id &&
      parsedOld.value &&
      params.colDef.cellEditor == 'offerUnitCellRenderer' &&
      this.popUpStatus
    ) {
      rowNode.setDataValue(params.colDef.field, parsedOld.value);
      this.popUpStatus = false;
      return;
    }

    //  let parseVal = params.newValue ? parsed : params.newValue;
    let idx1 = _.findIndex(gridData, {
      item_id: parsed ? parsed.id : params.newValue
    });

    if (
      parsed &&
      parsed.col != params.colDef.field &&
      (params.colDef.field == 'image_details' ||
        params.colDef.field == 'logo_details' ||
        params.colDef.cellEditor != 'offerUnitCellRenderer')
    ) {
      try {
        var parsedOld = JSON.parse(params.oldValue);
        var parseNew = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }

      let itemsObj = {
        item_id: params.data.item_id,
        key: params.colDef.field,
        value: params.newValue
      };
      this.adsService.promotionItems.items.push(itemsObj);
      this.prms.items.push(itemsObj);

      if (
        parseNew.id &&
        parseNew.value.id &&
        parseNew.col === params.colDef.field
      ) {
        return;
      }

      if (parsedOld.id && parsedOld.value) {
        rowNode.setDataValue(params.colDef.field, parsedOld.value);
      }

      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          status: 'fail',
          msg: 'Trying to paste invalid data.'
        },
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      return;
    }
    if (
      !parsed &&
      (params.colDef.field == 'image_details' ||
        params.colDef.field == 'logo_details' ||
        params.colDef.cellEditor != 'offerUnitCellRenderer')
    ) {
      try {
        var parsedOld = JSON.parse(params.oldValue);
      } catch (e) {
        // Oh well, but whatever...
      }
      // return;
      if (
        parsedOld &&
        parsedOld.id &&
        !parsedOld.value.id &&
        typeof parsedOld.value == 'object'
      ) {
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, parsedOld.value);
        return;
      }
    }

    if (!parsed && params.colDef.cellEditor == 'offerUnitCellRenderer') {
      try {
        var parsedOld = JSON.parse(params.oldValue);
        var parsedNew = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }
      // return;
      if (
        parsedOld &&
        parsedOld.id &&
        parsedOld.value.id &&
        !parsedNew.value.id
      ) {
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, parsedOld.value);
        return;
      }
    }
    if (parsed && parsed.col == params.colDef.field) {
      if (JSON.stringify(parsed.id) == JSON.stringify(params.data.item_id)) {
        // this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, parsedOld.value);
        params.api.refreshCells({
          force: true,
          rowNodes: [rowNode],
          columns: [params.colDef.field]
        });
        return;
      }
    }
    if (parsed && parsed.id == params.data.item_id) {
      return;
    }

    if (idx1 > -1) {
      this.lastUpdatedData = params.oldValue;

      let itemsObj = {
        key: params.colDef.field,
        item_id: params.data.item_id,
        value: gridData[idx1][params.colDef.field]
      };
      let queryPrms = {
        ad_id: this.appService.adId,
        promotion_id: params.data.promotion_id,
        items: []
      };
      if (
        params.colDef.field == 'image_details' ||
        params.colDef.field == 'logo_details'
      ) {
        itemsObj.value = gridData[idx1][params.colDef.field].length
          ? gridData[idx1][params.colDef.field][0]
          : gridData[idx1][params.colDef.field];
        queryPrms.items = [itemsObj];
        // this.lastUpdatedData = JSON.stringify(parsed);
      } else if (params.colDef.cellEditor == 'offerUnitCellRenderer') {
        itemsObj.value = gridData[idx1][params.colDef.field].id;
        queryPrms.items = [itemsObj];
      } else {
        // console.log(params)
        // this.lastUpdatedData = params.oldValue;
        // rowNode.setDataValue(params.colDef.field, params.oldValue);
        // params.api.refreshCells({
        //   force: true,
        //   rowNodes: [rowNode],
        //   columns: [params.colDef.field]
        // });
        return;
      }
      if (parsed.col === params.colDef.field) {
        if (!itemsObj.value) {
          return;
        }
        // this.prms.items.push(itemsObj);
        this.adsService.promotionItems.items.push(itemsObj);

        // clearTimeout(this.timeRef);
        // this.timeRef = setTimeout(() => {
        //   this.adsService
        //     .updateFeatureItems([{ url: 'updatePromotionsDetails' }, this.prms])
        //     .then(res => {});
        //   this.prms.items = [];
        // }, 300);
        this.updateGridVal(gridData, idx1, params);
        return;
      } else {
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        params.api.refreshCells({
          force: true,
          rowNodes: [rowNode],
          columns: [params.colDef.field]
        });
        return;
      }
    }

    if (
      params.colDef.field == 'image_details' ||
      params.colDef.field == 'logo_details' ||
      params.colDef.cellEditor == 'offerUnitCellRenderer'
    ) {
      try {
        var parsedOld = JSON.parse(params.oldValue);
        var parseNew = JSON.parse(params.newValue);
      } catch (e) {
        // Oh well, but whatever...
      }
      if (
        parseNew.id &&
        parseNew.value.id &&
        parseNew.col === params.colDef.field
      ) {
        return;
      }
      if (parsedOld.id && parsedOld.value.id) {
        // this.lastUpdatedData = params.oldValue;
        // rowNode.setDataValue(params.colDef.field, parsedOld.value);
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'Trying to paste invalid data.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });

        return;
      }
      // this.lastUpdatedData = params.oldValue;

      // rowNode.setDataValue(params.colDef.field, parsedOld.value);
      return;
    }
    if (params.colDef.cellEditor === 'numericEditor') {
      if (params.newValue == '') {
        params.newValue = 0;
      }
      params.newValue = parseInt(params.newValue);
      params.oldValue = parseInt(params.oldValue);
      if (isNaN(params.newValue)) {
        params.newValue = '';
        rowNode.setDataValue(
          params.colDef.field,
          isNaN(params.oldValue) ? '' : params.oldValue
        );
        return;
      }
      if (isNaN(params.oldValue)) {
        params.oldValue = '';
      }
    }
    if (params.colDef.cellEditor === 'priceEditor') {
      if (params.newValue == '') {
        params.newValue = 0;
      }
      params.newValue = parseFloat(params.newValue);
      params.oldValue = parseFloat(params.oldValue);
      if (isNaN(params.newValue)) {
        params.newValue = '';
        rowNode.setDataValue(
          params.colDef.field,
          isNaN(params.oldValue) ? '' : params.oldValue
        );
        return;
      }
      if (isNaN(params.oldValue)) {
        params.oldValue = '';
      }
      if (
        params.colDef.field == 'regular_price' ||
        params.colDef.field == 'percent_off_regular_price'
      ) {
        let regPrice = params.data['regular_price']
          ? params.data['regular_price']
          : 0;
        let perRegPrice = params.data['percent_off_regular_price']
          ? params.data['percent_off_regular_price']
          : 0;
        let clubPrice = regPrice - (regPrice * perRegPrice) / 100;
        let idx1 = _.findIndex(<any>this.pricingHeaders, { key: 'club_price' });
        if (idx1 > -1) {
          rowNode.setDataValue('club_price', clubPrice);
          params.api.refreshCells({
            force: true,
            rowNodes: [rowNode],
            columns: ['club_price']
          });
        }
      }
    }
    if (params.colDef.cellEditor === 'dateEditor') {
      if (!moment(params.newValue).isValid()) {
        this.lastUpdatedData = params.oldValue;
        rowNode.setDataValue(params.colDef.field, params.oldValue);
        return;
      }
    }
    let itemsObj = {
      item_id: params.data.item_id,
      key: params.colDef.field,
      value: params.newValue
    };
    this.adsService.promotionItems.items.push(itemsObj);
    this.prms.items.push(itemsObj);
    // clearTimeout(this.timeRef);
    // this.timeRef = setTimeout(() => {
    //   this.adsService
    //     .updateFeatureItems([{ url: 'updatePromotionsDetails' }, this.prms])
    //     .then(res => {});
    //   this.prms.items = [];
    // }, 300);
  }

  domRevisions(change) {
    console.log(change, this.domRevisionHistory);
    this.gridApi.stopEditing();
    this.gridApiRev1.stopEditing();
    this.gridApiRev2.stopEditing();
    this.gridApiRev3.stopEditing();
    this.gridApiRev4.stopEditing();
    this.gridApiRev5.stopEditing();
    this.gridApiRev6.stopEditing();

    this.timeRef = setTimeout(() => {
      // this.cellclickFlag = true;

      this.cellKeyDown = false;

      this.currentChange = change;
      // console.log(this.domRevisionHistory)

      if (this.domRevisionHistory.length) {
        this.domUpdateFilter.isChange = true;
        this.domUpdateFilter.changeAc = change;
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
            old_value: this.domRevisionHistory[this.currentDomRevision]
              .old_value,
            gridflag: this.domRevisionHistory[this.currentDomRevision].flag,
            copydata: this.domRevisionHistory[this.currentDomRevision].data,
            batch_id: this.domRevisionHistory[this.currentDomRevision].batch_id
            // new_value : params.newValue,
          };
          let dupCurrRev = this.currentDomRevision;

          if (this.currentDomRevision > -1) {
            this.updateRecord(params);
            // let idx = this.domRevisionHistory.length - (this.currentDomRevision + 1);
            // this.domRevisionHistory.splice(idx, 1);
            this.canUndoDone = true;
            if (
              this.currentDomRevision ===
              this.domRevisionHistory.length - 1
            ) {
              this.canRedoDone = false;
            }
            this.currentDomRevision++;
          }
          if (
            dupCurrRev > -1 &&
            this.domRevisionHistory[dupCurrRev + 1].batch_id &&
            params.batch_id == this.domRevisionHistory[dupCurrRev + 1].batch_id
          ) {
            this.domRevisions(change);
            this.pasteInfo.status = true;
            this.pasteInfo.randKey = params.batch_id;
          } else {
            setTimeout(() => {
              this.pasteInfo.status = false;
              this.pasteInfo.randKey = 0;
            });
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
            old_value: this.domRevisionHistory[this.currentDomRevision]
              .old_value,
            gridflag: this.domRevisionHistory[this.currentDomRevision].flag,
            copydata: this.domRevisionHistory[this.currentDomRevision].data,
            batch_id: this.domRevisionHistory[this.currentDomRevision].batch_id
            // new_value : params.newValue,
          };
          let dupCurrRev = this.currentDomRevision;
          this.updateRecord(params);
          // this.domRevisionHistory.splice(this.currentDomRevision, 1);
          if (this.currentDomRevision === 0) {
            this.canUndoDone = false;
          }
          if (this.currentDomRevision > -1) {
            this.canRedoDone = true;
          }
          if (
            dupCurrRev > 0 &&
            this.domRevisionHistory[dupCurrRev - 1].batch_id &&
            params.batch_id == this.domRevisionHistory[dupCurrRev - 1].batch_id
          ) {
            this.domRevisions(change);
            this.pasteInfo.status = true;
            this.pasteInfo.randKey = params.batch_id;
          } else {
            setTimeout(() => {
              this.pasteInfo.status = false;
              this.pasteInfo.randKey = 0;
            });
          }
        }
      }
    }, 50);
  }

  updateRecord(record) {
    // this.gridApiRev2.clearRangeSelection();
    // this.offersRevisionNav.close();

    // console.log(record);

    // let a = record.old_value
    // console.log(a.value);

    // console.log(this.domRevisionHistory);

    // this.domRevisionHistory.forEach(obj => {
    //   let rowNode = this.gridApi.getRowNode(obj.item_id);
    //   rowNode.setDataValue(obj.column_key, obj.old_value);
    //   this.gridApi.flashCells({
    //     rowNodes: [rowNode],
    //     columns: [obj.column_key]
    //   });
    // })
    // return
    if (record.gridflag == 'copystatement') {
      this.clonestatementsData2 = _.cloneDeep(this.clonestatementsData);
      if (record.item_id != '') {
        let rowNode = this.gridApi.getRowNode(record.item_id);
        rowNode.setDataValue(record.column_key, record.old_value);
        this.gridApi.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      } else {
        let rowNode = this.gridApi.pinnedRowModel.pinnedTopRows[0];
        rowNode.setDataValue(record.column_key, record.old_value);
        this.gridApi.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      }
      //  this.gridApi.setFocusedCell(rowNode.rowIndex, record.column_key, null);
    } else if (record.gridflag == 'pricingdata') {
      this.clonepricingData2 = _.cloneDeep(this.clonepricingData);

      if (record.item_id != '') {
        let rowNode = this.gridApiRev2.getRowNode(record.item_id);
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      } else {
        let rowNode = this.gridApiRev2.pinnedRowModel.pinnedTopRows[0];
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      }
    } else if (record.gridflag == 'imagedata') {
      // console.log(record)

      this.cloneimagesData2 = _.cloneDeep(this.cloneimagesData);

      let val;

      // console.log(a)

      if (record.item_id != '') {
        let path;
        if (
          record.column_key == 'logo_01' ||
          record.column_key == 'logo_02' ||
          record.column_key == 'logo_03' ||
          record.column_key == 'logo_04'
        ) {
          path = record.old_value;
        } else {
          let a = JSON.parse(record.old_value);

          path = a.value;

          // console.log(typeof path)
          // console.log(path)

          // if (typeof path == 'object') {
          //   if (path == '') {
          //     val = '';
          //   } else {
          //     val = path.image_path;
          //   }
          // } else {
          //   if (path == '') {
          //     val = '';
          //   } else {
          //     val = path;
          //   }
          // }
          // console.log(val)
        }
        // console.log(path)
        let rowNode = this.gridApiRev1.getRowNode(record.item_id);
        rowNode.setDataValue(record.column_key, path);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      } else {
        let path1;
        if (
          record.column_key == 'logo_01' ||
          record.column_key == 'logo_02' ||
          record.column_key == 'logo_03' ||
          record.column_key == 'logo_04'
        ) {
          path1 = record.old_value;
        } else {
          let a = JSON.parse(record.old_value);

          path1 = a.value;

          // console.log(typeof path)
          // console.log(path)

          // if (typeof path == 'object') {
          //   if (path == '') {
          //     val = '';
          //   } else {
          //     val = path.image_path;
          //   }
          // } else {
          //   if (path == '') {
          //     val = '';
          //   } else {
          //     val = path;
          //   }
          // }
          // console.log(val)
        }
        let rowNode = this.gridApiRev1.pinnedRowModel.pinnedTopRows[0];
        rowNode.setDataValue(record.column_key, path1);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      }
    } else if (record.gridflag == 'sptext') {
      this.clonespText2 = _.cloneDeep(this.clonespText);

      if (record.item_id != '') {
        let rowNode = this.gridApiRev3.getRowNode(record.item_id);
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      } else {
        let rowNode = this.gridApiRev3.pinnedRowModel.pinnedTopRows[0];
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      }
    } else if (record.gridflag == 'papertext') {
      this.clonepaperText2 = _.cloneDeep(this.clonepaperText);

      if (record.item_id != '') {
        let rowNode = this.gridApiRev4.getRowNode(record.item_id);
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      } else {
        let rowNode = this.gridApiRev4.pinnedRowModel.pinnedTopRows[0];
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      }
    } else if (record.gridflag == 'mixmatchtext') {
      this.clonemixMatchText2 = _.cloneDeep(this.clonemixMatchText);

      if (record.item_id != '') {
        let rowNode = this.gridApiRev5.getRowNode(record.item_id);
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      } else {
        let rowNode = this.gridApiRev5.pinnedRowModel.pinnedTopRows[0];
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      }
    } else if (record.gridflag == 'digitaltext') {
      this.clonedigitalText2 = _.cloneDeep(this.clonedigitalText);

      if (record.item_id != '') {
        let rowNode = this.gridApiRev6.getRowNode(record.item_id);
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      } else {
        let rowNode = this.gridApiRev6.pinnedRowModel.pinnedTopRows[0];
        rowNode.setDataValue(record.column_key, record.old_value);
        // this.gridApiRev2.setFocusedCell(rowNode.rowIndex, record.column_key, null);
        this.gridApiRev2.flashCells({
          rowNodes: [rowNode],
          columns: [record.column_key]
        });
      }
    }

    // console.log(rowNode)
    clearTimeout(this.timeRefdup);
    this.timeRefdup = setTimeout(() => {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          status: 'success',
          msg: 'Value Updated'
        },
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }, 500);
  }
  public assetImages = [];
  public cellclickFlag = false;
  onCellClicked(params) {
    // console.log(params)
    this.cellclickFlag = true;

    this.imgCopyPasteFlag = false;

    if (params.colDef.field == 'crv') {
      params.api.stopEditing();
    }

    if (params.colDef.field === 'images' && params.data.item_id != '') {
      // return;
      // console.log(params.data.id);
      // let params = {
      //   ad_id: this.appService.adId,
      //   pageNumber: this.params.pageNumber,
      //   pageSize: this.params.pageSize,
      //   flag: "ads_list",
      //   sku: ''

      // }
      // this.adsService
      // .getAdModules([
      //   { url: 'searchPromotionsOnSKU' },
      //   params
      // ])
      // .then(res => {

      // })

      this.dialogRef = this.dialog.open(PromoImageAssetsComponent, {
        panelClass: ['overlay-dialog'],
        width: '850px',
        disableClose: true,
        data: {
          title: 'Add Promotion',
          // pageNumber: this.params.pageNumber,
          // pageSize: this.params.pageSize,
          // flag: 'ads_list',
          // skuValues: params.value,
          // skuPromoId: params.data.id,
          adId: this.appService.adId,
          promoId: params.data.promotion_id,
          itemId: params.data.item_id
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        if (res && res.result.success) {
          this.assetImages = res.result.data;

          // console.log(this.assetImages)

          this.assetImages.forEach(obj => {
            // let path = this._sanitizer.bypassSecurityTrustResourceUrl(
            //   obj.value
            // );

            // let imgpath =
            //   `<img class="img-responsive offer-img" src="` + obj.value + `">`;

            // console.log(obj)

            let rowNode = this.gridApiRev1.getRowNode(obj.item_id);
            rowNode.setDataValue(obj.key, obj.value);
            this.gridApiRev1.refreshCells({
              force: true,
              rowNodes: [rowNode],
              columns: [obj.key]
            });
          });
          this.imgCopyPasteFlag = true;

          // this.onGridReadyRev1(params)

          // this.imagesData.map(ele => {
          //   let a ;
          //    this.assetImages.forEach(obj => {
          //     let rowNode = this.gridApiRev1.getRowNode(obj.item_id);

          //     let idx1 = _.findIndex(this.imagesData, {
          //           item_id: obj.item_id
          //         });
          //          a = obj.key;

          //       this.imagesData[idx1][a] = 123;

          //     this.gridApiRev1.refreshCells({
          //       force: true,
          //       rowNodes: [rowNode],
          //       columns: [a]

          //    })

          //   });
          //   console.log(this.imagesData)

          //   });
        }

        // this.generateColumns(this.imagesHeaders, 'images', '', '') ;
      });
    }

    // if (
    //   params.colDef.type == 'image' &&
    //   params.data[params.colDef.field] != ''
    // ) {
    //   this.dialogRef = this.dialog.open(ConfirmDeleteComponent, {
    //     panelClass: ['confirm-delete', 'overlay-dialog'],
    //     width: '500px',
    //     disableClose: true,
    //     data: {
    //       title: 'Add Promotion',
    //       // pageNumber: this.params.pageNumber,
    //       // pageSize: this.params.pageSize,
    //       // flag: 'ads_list',
    //       // skuValues: params.value,
    //       // skuPromoId: params.data.id,
    //       adId: this.appService.adId,
    //       promoId: params.data.promotion_id,
    //       itemId: params.data.item_id,
    //       from: 'promoImageDel',
    //       mode: 'delete',
    //       label: params.colDef.field,
    //       delItem: params.data[params.colDef.field]
    //     }
    //   });
    //   this.dialogRef.afterClosed().subscribe(res => {
    //     console.log(res);

    //     if (res.action == 'confirmed') {
    //       let itemsObj = {
    //         key: params.colDef.field,
    //         item_id: params.data.item_id,
    //         value: ''
    //       };
    //       this.adsService.promotionItems.ad_id = this.appService.adId;
    //       this.adsService.promotionItems.promotion_id =
    //         params.data.promotion_id;
    //       this.adsService.promotionItems.items.push(itemsObj);

    //       this.adsService
    //         .updateFeatureItems([
    //           { url: 'updatePromotionsDetails' },
    //           this.adsService.promotionItems
    //         ])
    //         .then(res => {
    //           if (res.result.success) {
    //             let rowNode = this.gridApiRev1.getRowNode(params.data.item_id);
    //             rowNode.setDataValue(params.colDef.field, '');
    //             this.gridApiRev1.refreshCells({
    //               force: true,
    //               rowNodes: [rowNode],
    //               columns: [params.colDef.field]
    //             });
    //           }
    //         });
    //     }
    //   });
    // }
  }

  onCellDoubleClicked(params) {
    // if(params.data[params.colDef.field] == '') {
    //   return
    // }
    // this.popUpStatus = true;
    console.log(98766);
    this.pasteInfo.status = false;
    this.pasteInfo.randKey = 0;
    const coldef = params.colDef.field;

    return;
    if (
      this.data.fromComp == 'pages' ||
      this.activePromotion.flag == 'deleted'
    ) {
      return;
    }
    let prms = params;
    let rowDataCpy = _.clone(params.data);
    this.gridApiRev1.getDisplayedRowAtIndex(prms.rowIndex);

    if (
      params.colDef.field === 'image_details' ||
      params.colDef.field === 'logo_details'
    ) {
      rowDataCpy['image_upcs'] = rowDataCpy['apex_image_upcs'];
      if (typeof rowDataCpy['logo_details'] == 'string') {
        rowDataCpy['logo_details'] = [];
      } else {
        rowDataCpy['logo_details'] =
          rowDataCpy['logo_details'].length > 0
            ? rowDataCpy['logo_details'][0]
            : rowDataCpy['logo_details'];
      }
      if (typeof rowDataCpy['image_details'] == 'string') {
        rowDataCpy['image_details'] = [];
      } else {
        rowDataCpy['image_details'] =
          rowDataCpy['image_details'].length > 0
            ? rowDataCpy['image_details'][0]
            : rowDataCpy['image_details'];
      }
      if (
        rowDataCpy['image_details'].length &&
        typeof rowDataCpy['image_details'] != 'string'
      ) {
        rowDataCpy['image_details'].map(val => {
          val.selected = true;
        });
      }
      if (
        rowDataCpy['logo_details'].length &&
        typeof rowDataCpy['logo_details'] != 'string'
      ) {
        rowDataCpy['logo_details'].map(val => {
          val.selected = true;
        });
      }

      this.dialogRef = this.dialog.open(ImageAssestsComponent, {
        panelClass: ['overlay-dialog'],
        width:
          params.colDef.field === 'image' ||
          params.colDef.field === 'image_details'
            ? '760px'
            : '680px',

        data: {
          title: params.data.apex_image_upcs,
          rowData: rowDataCpy,
          url: 'updatePromotionsDetails',
          from: params.colDef.field === 'logo_details' ? 'logos' : 'image',
          fromComp: 'promo-view'
        }
      });
      this.dialogRef.afterClosed().subscribe(res => {
        // this.isDailogOpen = false;
        //  const index = _.findIndex(this.imagesData, { id: params.data.item_id });
        // const focusedCell = this.gridApi.getFocusedCell();
        if (res ? res.data && res.data.result.success : false) {
          // this.updateGridVal(this.imagesData, params.rowIndex, params);
          const rowNode = this.gridApiRev1.getDisplayedRowAtIndex(
            prms.rowIndex
          );
          this.imagesData[prms.rowIndex][coldef] = [res.imgAssts];
          // rowNode.setDataValue('image_details', [res.imgAssts]);
          // this.gridApiRev1.flashCells({
          //   rowNodes: [rowNode],
          //   columns: ['image_details']
          // });
          this.gridApiRev1.refreshCells({
            force: true,
            rowNodes: [rowNode],
            columns: [coldef]
          });
          params.api.stopEditing();
        } else {
          // this.gridApiRev1.refreshCells({
          //   force: true,
          //   rowNodes: [rowNode],
          //   columns: [coldef]
          // });
          // const logo_details = Object.values(res);
          // const index = _.findIndex(this.rowData, { id: params.data.id });
          // const focusedCell = this.gridApi.getFocusedCell();
          // const rowNode = this.gridApi.getDisplayedRowAtIndex(
          //   focusedCell.rowIndex
          // );
          // this.rowData[index][this.imageInfo] = logo_details;
          // rowNode.setDataValue(this.imageInfo, logo_details);
          params.api.stopEditing();
        }
      });
    }
  }
  public cellKeyDown = false;
  onCellKeyDown(params) {
    if (params.event.keyCode == 17 || params.event.keyCode == 67) {
      return;
    }

    if (params.event.keyCode == 86) {
      this.cellKeyDown = true;
    } else {
      this.cellKeyDown = false;
    }

    // console.log(this.cellKeyDown)

    this.appService.gridData = params;

    // this.cellKeyDown = true;

    // console.log(this.adsService.promotionI)

    if (
      !this.adsService.promotionItems.items.length ||
      !this.domRevisionHistory.length
    ) {
      this.appService.switchPromoFlag = true;
    }

    let cellRanges = params.api.getRangeSelections();
    if (params.event.keyCode == 46 && cellRanges) {
      this.deleteKeyPressed = true;
      params.api.stopEditing();
      let strtIndx =
        cellRanges[0].start.rowIndex <= cellRanges[0].end.rowIndex
          ? cellRanges[0].start.rowIndex
          : cellRanges[0].end.rowIndex;
      let endIndx =
        cellRanges[0].start.rowIndex >= cellRanges[0].end.rowIndex
          ? cellRanges[0].start.rowIndex
          : cellRanges[0].end.rowIndex;
      for (let i = strtIndx; i < endIndx + 1; i++) {
        let rowNode = params.api.getDisplayedRowAtIndex(i);
        for (let j = 0; j < cellRanges[0].columns.length; j++) {
          this.deleteKeyPressed = true;
          if (cellRanges[0].columns[j].colDef.editable) {
            if (
              cellRanges[0].columns[j].colDef.cellEditor ==
              'offerUnitCellRenderer'
            ) {
              params.api.stopEditing();
              this.updateEditorVal(
                rowNode,
                cellRanges[0].columns[j].colDef.field,
                'select'
              );
            } else if (
              cellRanges[0].columns[j].colDef.cellEditor == 'numericEditor' ||
              cellRanges[0].columns[j].colDef.cellEditor == 'priceEditor'
            ) {
              params.api.stopEditing();
              this.updateEditorVal(
                rowNode,
                cellRanges[0].columns[j].colDef.field,
                'number'
              );
              // rowNode.setDataValue(cellRanges[0].columns[j].colDef.field, 0);
            } else if (
              cellRanges[0].columns[j].colDef.cellEditor == 'dateEditor'
            ) {
              params.api.stopEditing();
              this.updateEditorVal(
                rowNode,
                cellRanges[0].columns[j].colDef.field,
                'date'
              );
            } else if (
              cellRanges[0].columns[j].colDef.field == 'image_details'
            ) {
              params.api.stopEditing();
              this.updateEditorVal(
                rowNode,
                cellRanges[0].columns[j].colDef.field,
                'image'
              );
            } else {
              params.api.stopEditing();
              this.updateEditorVal(
                rowNode,
                cellRanges[0].columns[j].colDef.field,
                ''
              );
              // rowNode.setDataValue(cellRanges[0].columns[j].colDef.field, '');
            }
          }
        }
      }
      // console.log(this.gridColumnApi.getCellRanges())
    }
  }
  updateEditorVal(node, col, type) {
    this.deleteKeyPressed = true;
    this.dupPrms.promotion_id = node.data.promotion_id;

    switch (type) {
      case 'select': {
        node.setDataValue(col, { id: [], values: '' });
        let itemsObj = {
          item_id: node.data.item_id,
          key: col,
          value: []
        };

        this.updateDelVal(itemsObj);
        break;
      }
      case 'date': {
        node.setDataValue(col, null);
        let itemsObj = {
          item_id: node.data.item_id,
          key: col,
          value: null
        };

        this.updateDelVal(itemsObj);
        break;
      }
      case 'image': {
        node.setDataValue(col, []);
        let itemsObj = {
          item_id: node.data.item_id,
          key: col,
          value: []
        };
        this.updateDelVal(itemsObj);
        break;
      }
      case 'number': {
        node.setDataValue(col, 0);
        let itemsObj = {
          item_id: node.data.item_id,
          key: col,
          value: 0
        };

        this.updateDelVal(itemsObj);
        break;
      }
      default: {
        node.setDataValue(col, '');
        let itemsObj = {
          item_id: node.data.item_id,
          key: col,
          value: ''
        };

        this.updateDelVal(itemsObj);
        break;
      }
    }
    // node.setDataValue(col, (type == 'date' ? null : type == 'image' ? [] : { id: [], values: '' }));
    // let prms = {
    //   ad_id: this.appService.adId,
    //   promotion_id: node.data.promotion_id,
    //   items: [
    //     {
    //       item_id: node.data.item_id,
    //       key: col,
    //       value: type == 'date' ? '' : []
    //     }
    //   ]
    // };
    // this.adsService
    //   .updateFeatureItems([{ url: 'updatePromotionsDetails' }, prms])
    //   .then(res => {
    //     this.deleteKeyPressed = true;
    //   });
  }
  updateDelVal(prms) {
    this.adsService.promotionItems.items.push(prms);
    setTimeout(() => {
      this.deleteKeyPressed = true;
    }, 300);
    // this.dupPrms.items.push(prms);
    // clearTimeout(this.timeRefdup);
    // this.timeRefdup = setTimeout(() => {
    //   this.adsService
    //     .updateFeatureItems([{ url: 'updatePromotionsDetails' }, this.dupPrms])
    //     .then(res => {
    //       this.deleteKeyPressed = true;
    //     });
    // }, 300);
  }
  onRangeSelectionChanged(params) {
    // console.log(params)
  }
  onCellKeyPress(params) {
    // this.appService.gridData = params;
    // // console.log(this.adsService.promotionI)
    // if (
    //   !this.adsService.promotionItems.items.length ||
    //   !this.domRevisionHistory.length
    // ) {
    //   this.appService.switchPromoFlag = true;
    // }
    // console.log(this.appService.switchPromoFlag )
    // console.log(this.appService.gridData);
  }
  updateGridVal(gridData, idx1, params) {
    const rowNode = params.api.getDisplayedRowAtIndex(params.rowIndex);
    rowNode.setDataValue(
      params.colDef.field,
      gridData[idx1][params.colDef.field]
    );
    params.api.refreshCells({
      force: true,
      rowNodes: [rowNode],
      columns: [params.colDef.field]
    });
  }
  onSearch(event, from) {
    if (from === 'modSearch') {
      this.searchWord = this.searchingBox.searchElement.nativeElement.value;
      return;
    }
    if (this.activeModData.images.length > 5 && from == 'images') {
      if (event) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Maximum images have been selected.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
      return;
    }
    if (this.activeModData.icons.length > 5 && from == 'icon_path') {
      if (event) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Maximum images have been selected.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
      return;
    }

    if (this.activeModData.logos.length > 5 && from == 'logos') {
      if (event) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'success',
            msg: 'Maximum images have been selected.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
      return;
    }
    if (event) {
      this.dialogRef1 = this.dialog.open(ImageAssestsComponent, {
        panelClass: ['campaign-dialog', 'overlay-dialog'],
        width: '680px',
        data: {
          title: 'Add Images',
          rowData: [],
          url: '',
          from: from,
          fromComp: 'editMod',
          search: event,
          activeModData: this.activeModData
        }
      });
      this.dialogRef1.afterClosed().subscribe(res => {
        if (res.data) {
          if (res.data.assetType === 'logos') {
            this.activeModData.logos = res.data.selectedAssets;
          } else if (res.data.assetType === 'images') {
            if (this.activeModData.images.length) {
              this.activeModData.images = [
                ...this.activeModData.images,
                ...res.data.selectedAssets
              ];
            } else {
              this.activeModData.images = res.data.selectedAssets;
            }
            this.activeModData.images = _.unionBy(
              this.activeModData.images,
              'assetId'
            );
          } else if (
            res.data.assetType === 'icon_path' ||
            res.data.assetType === 'icons'
          ) {
            if (this.activeModData.icons.length) {
              this.activeModData.icons = [
                ...this.activeModData.icons,
                ...res.data.selectedAssets
              ];
            } else {
              this.activeModData.icons = res.data.selectedAssets;
            }
            this.activeModData.icons = _.unionBy(
              this.activeModData.icons,
              'assetId'
            );
          }
          if (res.data.selectedAssets.length) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg:
                  (from === 'icon_path' || from === 'icons'
                    ? 'Icons'
                    : from === 'image' || from === 'images'
                    ? 'Image'
                    : from === 'logos'
                    ? 'Logos'
                    : 'Images') + ' Updated Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.enableSaveBtn = true;
          }
        } else {
          return;
        }
      });
    }
  }
  public searchVal;
  onPromoSearch(event) {
    this.searchVal = event;

    if (this.appService.switchPromoFlag) {
      this.appService.gridData.api.stopEditing();

      this.retainOnSwitch('search');
      return;
    }

    this.currentPromoPagination = 1;
    // this.search = event;
    this.promoSearch.value = event;
    this.getTotalPromotions('search');
  }
  savePromoData() {
    // console.log(this.adsService)

    this.gridApi.stopEditing();
    this.gridApiRev1.stopEditing();
    this.gridApiRev2.stopEditing();
    this.gridApiRev3.stopEditing();
    this.gridApiRev4.stopEditing();
    this.gridApiRev5.stopEditing();
    this.gridApiRev6.stopEditing();

    this.timeRef = setTimeout(() => {
      if (!this.adsService.promotionItems.items.length) {
        this.snackbar.openFromComponent(SnackbarComponent, {
          data: {
            status: 'fail',
            msg: 'No Edits Done.'
          },
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        return;
      }
      this.adsService.promotionItems.ad_id = this.appService.adId;
      this.adsService.promotionItems.promotion_id = this.activePromotion.id;
      this.adsService
        .updateFeatureItems([
          { url: 'updatePromotionsDetails' },
          this.adsService.promotionItems
        ])
        .then(res => {
          if (res.result.success) {
            this.autoSizeColumns();
            this.activePromotion.saving_status = 'completed';
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Promotion Details Updated Successfully.'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });

            this.gridApi.tabToNextCell();
            this.gridApiRev1.tabToNextCell();
            this.gridApiRev2.tabToNextCell();
            this.gridApiRev3.tabToNextCell();
            this.gridApiRev4.tabToNextCell();
            this.gridApiRev5.tabToNextCell();
            this.gridApiRev6.tabToNextCell();

            // this.getTotalPromotions('filter')

            this.domRevisionHistory = [];
            this.currentDomRevision = -1;
            this.canUndoDone = false;
            this.canRedoDone = false;
            this.switchPromo = true;
            this.appService.switchPromoFlag = false;
            this.adsService.promotionItems.items = [];

            // this.disableSaveBtn = true;
          }
        });
    }, 500);
  }

  deletePreviewItems(from, mode, action, selectedItem) {
    if (action == 'deltePreviewItems') {
      if (from == 'image') {
        if (this.activeModData.images.length) {
          const idx = _.findIndex(this.activeModData.images, {
            assetId: selectedItem.assetId
          });
          if (idx >= 0) {
            this.activeModData.images.splice(idx, 1);
            this.enableSaveBtn = true;
          }
        }
      } else if (from == 'icon') {
        if (this.activeModData.icons.length) {
          const idx = _.findIndex(this.activeModData.icons, {
            icon_id: selectedItem.icon_id
          });
          if (idx >= 0) {
            this.activeModData.icons.splice(idx, 1);
            this.enableSaveBtn = true;
          }
        }
      } else if (from == 'logo') {
        if (this.activeModData.logos.length) {
          const idx = _.findIndex(this.activeModData.logos, {
            assetId: selectedItem.assetId
          });
          if (idx >= 0) {
            this.activeModData.logos.splice(idx, 1);
            this.enableSaveBtn = true;
          }
        }
      }
    }
  }

  onScrollDown() {
    this.currentPromoPagination++;
    this.getTotalPromotions('scroll');
  }

  eventStop(event) {
    if (this.showfltrPopover) {
      event.stopPropagation();
    }
  }

  public showfltrPopover = false;
  public showRedDot = false;
  preventCloseOnClickOut() {
    if (!this.appService.switchPromoFlag) {
      // this.overlayContainer
      //   .getContainerElement()
      //   .classList.add('disable-backdrop-click');

      this.showfltrPopover = true;

      this.getFilterRoutes();
    } else {
      this.showfltrPopover = false;
      this.appService.gridData.api.stopEditing();
      this.retainOnSwitch('filter');
      return;
    }
  }

  allowCloseOnClickOut(flag) {
    if (flag == 'cancel') {
      this.showfltrPopover = false;
    }
  }

  public categoryList = [];
  public departmentList = [];
  public ProrityList = [];
  public zonesList = [];
  public modList = [];
  public pageList = [];

  getFilterRoutes() {
    let params = {
      column: '',
      pageNumber: 1,
      pageSize: 21,
      search: '',
      sort: 'asc'
    };
    this.adsService.sendOuput('getCategory', params).then(res => {
      if (res.result.success) {
        this.categoryList = res.result.data.data;
      }
    });

    this.adsService.sendOuput('getDepartments', params).then(res => {
      if (res.result.success) {
        this.departmentList = res.result.data.data;
      }
    });

    this.adsService.sendOuput('getPriority', params).then(res => {
      if (res.result.success) {
        this.ProrityList = res.result.data.data;
      }
    });

    this.adsService.sendOuput('getZones', params).then(res => {
      if (res.result.success) {
        this.zonesList = res.result.data.data;
      }
    });

    // this.adsService.sendOuput('getModTypes', params).then(res => {
    //   if (res.result.success) {
    //     this.modList = res.result.data.data;
    //   }
    // });

    // this.adsService.sendOuput('getPageTemplates', params).then(res => {
    //   if (res.result.success) {
    //     this.pageList = res.result.data.data;
    //   }
    // });
  }

  catgoryChanged(event) {
    this.category_list = event;
  }
  zoneChanged(event) {
    this.zone_list = event;
  }
  priorityChanged(event) {
    this.priority_list = event;
  }
  departmentChanged(event) {
    this.department_list = event;
  }

  public modList2 = [];
  public modVal;
  public modarray = [];
  public showModValidationMsg = false;
  modChanged(event) {
    let myRe = /^[0-9, ]*$/g;
    let myArray = myRe.exec(event.target.value);
    if (myArray == null) {
      this.showModValidationMsg = true;
    } else {
      this.showModValidationMsg = false;
    }
    // event.target.value = event.target.value.replace(/[^0-9]*/g, '');

    this.modVal = event.target.value;
    this.modarray.push(this.modVal.split(','));

    let indx = this.modarray.length - 1;

    this.modList2 = this.modarray[indx];
    // console.log(this.modList2)

    // this.modList2 = this.modList[0].split(',');

    // this.mod_list = event;
  }
  public pageList2 = [];
  public pageVal;
  public pagesarr = [];
  public showPageValidation = false;
  pageChanged(event) {
    let myRe = /^[0-9, ]*$/g;
    let myArray = myRe.exec(event.target.value);
    if (myArray == null) {
      this.showPageValidation = true;
    } else {
      this.showPageValidation = false;
    }
    this.pageVal = event.target.value;
    this.pagesarr.push(this.pageVal.split(','));

    let indx = this.pagesarr.length - 1;

    this.pageList2 = this.pagesarr[indx];
    // console.log(this.pageList2)
  }

  statusChanged(event) {
    this.status_list = event;
  }

  clearFilters() {
    this.category_list = [];
    this.zone_list = [];
    this.priority_list = [];
    this.department_list = [];
    this.modList2 = [];
    this.pageList2 = [];
    this.status_list = [];

    this.getFilteredPromotions('');
  }

  public filterVal;
  getFilteredPromotions(filter) {
    this.filterVal = filter;

    this.dataLoad = true;
    this.noData = false;

    this.showfltrPopover = false;

    localStorage.setItem('categories', JSON.stringify(this.category_list));
    localStorage.setItem('zones', JSON.stringify(this.zone_list));
    localStorage.setItem('priorities', JSON.stringify(this.priority_list));
    localStorage.setItem('departments', JSON.stringify(this.department_list));
    localStorage.setItem('status1', JSON.stringify(this.status_list));

    localStorage.setItem('modvalues', JSON.stringify(this.modList2));
    localStorage.setItem('pagevalues', JSON.stringify(this.pageList2));

    if (this.appService.switchPromoFlag) {
      this.retainOnSwitch('filter');
      return;
    }

    this.selectedPromoFilter = filter;
    this.currentPromoPagination = 1;
    this.getTotalPromotions('filter');
  }
  public stopmultiDia = false;
  lockPromo(index, event, promo) {
    // console.log(index)
    this.gridApi.stopEditing();
    this.gridApiRev1.stopEditing();
    this.gridApiRev2.stopEditing();
    this.gridApiRev3.stopEditing();
    this.gridApiRev4.stopEditing();
    this.gridApiRev5.stopEditing();
    this.gridApiRev6.stopEditing();

    event.stopPropagation();
    if (
      !this.showLockIcon ||
      this.stopmultiDia ||
      !this.adsService.editPermission
    ) {
      return;
    }

    if (promo.id != this.togglePanelPromoId) {
      return;
    }

    if (this.opendia) {
      return;
    }

    this.stopmultiDia = true;

    setTimeout(() => {
      // console.log(this.activePromotion.lock);
      // console.log(this.appService.promoId);
      // console.log(this.adsService.promotionItems.items);

      if (!this.adsService.promotionItems.items.length) {
        let dialogRef = this.dialog.open(ConfirmDeleteComponent, {
          panelClass: ['confirm-delete', 'overlay-dialog'],
          width: '500px',

          data: {
            // rowData: rowData,
            selectedRow: {
              promotion_id: this.appService.promoId,
              lockStatus: this.totalPromotionList[index].lock
            },
            rowData: {
              delete_api: 'lockPromotions',
              label: 'Promotion'
            },
            mode: 'lockpromo',
            from: 'lockpromo'
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          // console.log(result);
          this.stopmultiDia = false;
          if (result == 1) {
            for (let i = 0; i < 7; i++) {
              let a;
              a = document.getElementsByClassName('ag-floating-top-viewport')[
                i
              ];
              if (a != undefined) {
                a.style.pointerEvents = 'none';
              }
            }
            this.pointerEvents = false;
            this.notAllowed = true;
            this.activePromotion.lock = 1;
            this.totalPromotionList[index].lock = 1;

            // this.getTotalPromotions('');
          } else if (result == 2) {
            for (let i = 0; i < 7; i++) {
              let a;
              a = document.getElementsByClassName('ag-floating-top-viewport')[
                i
              ];
              if (a != undefined) {
                a.style.pointerEvents = 'unset';
              }
            }
            this.pointerEvents = true;
            this.notAllowed = false;
            this.activePromotion.lock = 2;
            this.totalPromotionList[index].lock = 2;
          }
        });
      } else {
        this.opendia = true;
        this.warnUserDialog(promo);
      }
    }, 1000);
  }

  warnUserDialog(promo) {
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
      // console.log(result)
      if (result.from === 'switchPromo' && result.action == 'confirmed') {
        this.savePromoData();

        this.appService.switchPromoFlag = false;
        this.opendia = false;
        this.stopmultiDia = false;

        setTimeout(() => {
          this.adsService.promotionItems.items = [];
        }, 500);
      } else {
        this.adsService.promotionItems.items = [];
        this.dataLoad = true;
        this.togglePanelPromoId = promo.id;
        this.appService.switchPromoFlag = false;
        this.opendia = false;
        this.stopmultiDia = false;

        // let prmo = {
        //   id: '5df9c4906b7d1d004309da2c',
        //   mod_id: '5dfb20836b7d1d009d498e84',
        //   promo_id: 351520
        // };
        this.activePromotion = promo;
        this.getPromotionView(promo);

        this.switchPromo = false;
      }
    });
  }

  getVarietyStatements() {
    let params = {
      column: '',
      pageNumber: 1,
      pageSize: 21,
      search: '',
      status: [1],
      sort: 'asc'
    };
    this.adsService.sendOuput('getVarietyStatements', params).then(res => {
      if (res.result.success) {
        this.varietyStatemntsOptions = res.result.data.data;
      }
    });
  }

  priceGridOfferTypeChange(event) {
    let prms = {
      ad_id: this.appService.adId,
      promotion_id: this.activePromotion.id,
      items: [
        {
          key: 'offer_type_id',
          value: event
        }
      ]
    };
    const params = {
      id: this.activePromotion.id,
      promo_id: this.activePromotion.promo_id,
      offer_type_id: this.offer_type_price_grid,
      current_tab: this.data.fromComp
    };
    this.adsService
      .updateFeatureItems([{ url: 'updatePromotionsDetails' }, prms])
      .then(res => {});
    this.adsService
      .getAdModules([{ url: 'getPromotionsDetails' }, params])
      .then(res => {
        this.pricingHeaders = res.result.data.pricingHeaders;
        this.columnDefsPrice = this.generateColumns(
          this.pricingHeaders,
          'pricing',
          this.gridApiRev2,
          this.pricingData
        );
        this.pricingData = res.result.data.pricing;
        setTimeout(() => {
          this.autoSizeColumnsRev2();
        }, 200);
      });
  }
  updatePromotionOrder() {
    let params = {
      ad_id: this.appService.adId,
      promotions: _.map(this.activeModPromotions, 'id')
    };
    this.adsService.sendOuput('updatePromotionOrder', params).then(res => {});
  }
  buttonScroll() {
    if (!document.getElementById('modpromostablist')) {
      return;
    }
    var actualWidth = document.getElementById('modpromostablist').offsetWidth;
    var calculateWidth =
      this.activeModPromotions.length *
      document.getElementById('modpromostab').offsetWidth;
    if (calculateWidth > actualWidth) {
      this.scrollButton = true;
    } else {
      this.scrollButton = false;
    }
  }
  scrollLeft() {
    this.rightScrollButton = false;
    this.widgetsContent.nativeElement.scrollLeft -= 150;
    if (this.widgetsContent.nativeElement.scrollLeft == 0) {
      this.leftScrollButton = true;
    } else {
      this.leftScrollButton = false;
    }
  }

  scrollRight() {
    this.leftScrollButton = false;
    this.widgetsContent.nativeElement.scrollLeft += 150;
    if (
      this.widgetsContent.nativeElement.scrollLeft +
        this.widgetsContent.nativeElement.offsetWidth +
        150 >=
      this.widgetsContent.nativeElement.scrollWidth
    ) {
      this.rightScrollButton = true;
    } else {
      this.rightScrollButton = false;
    }
  }

  // onResize(event) {
  //   console.log(event.target.innerWidth);
  //   this.buttonScroll();

  // }
}

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {
  private regex: RegExp = new RegExp(/^-?[0-9]+(\.[0-9]*){0,1}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab'];

  constructor(private el: ElementRef) {}
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
