import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from '@app/app.service';
import { GridLayoutDesignerComponent } from '../grid-layout-designer/grid-layout-designer.component';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AddPageComponent } from '@app/dialogs/add-page/add-page.component';
import { Title } from '@angular/platform-browser';

// interface FoodNode {
//   name: string;
//   base?: FoodNode[];
// }
@Component({
  selector: 'app-ad-design',
  templateUrl: './ad-design.component.html',
  styleUrls: ['./ad-design.component.scss'],
  animations: [
    trigger('rightAnimate', [
      transition(':enter', [
        style({ transform: 'translateX(100px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 1, 0.25, 1)', style('*'))
      ])
    ])
  ]
})
export class AdDesignComponent implements OnInit {
  pages: any;
  selectedPage = {
    cols: 0,
    rows: 0,
    width: 0,
    height: 0
  };
  selectedMods: any;
  selectedTool: any;
  showPageInfo = false;
  public isOpen: any;
  public totalData = [];
  public currentLayout = [];
  public promoDetData = [];
  public dropListInfo = [];
  public dbModId = '';
  public noData: boolean;
  public progress = true;
  private selectedBase: any;
  private selectedBaseTitle: any;
  public selectedBaseOrder: any;
  public createPagePer = true;
  public createModPer = true;
  activePage: any;
  // treeControl = new NestedTreeControl<FoodNode>(node => node.base);
  // dataSource = new MatTreeNestedDataSource<FoodNode>();
  constructor(
    public appService: AppService,
    public adsService: AdsService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private dialog: MatDialog,
    private titleService: Title
  ) {
    // this.dataSource.data = this.totalData;
  }

  // hasChild = (_: number, node: FoodNode) => !!node.base && node.base.length > 0;
  ngOnInit() {
    if (!this.appService.headerPermissions['VIEW_DESIGN']) {
      this.router.navigateByUrl('access-denied');
    }
    // this.
    this.titleService.setTitle('Design');
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'ADS'
      });
      if (i < 0) {
        // if users module not- allowed for user based on permissions
        this.router.navigateByUrl('access-denied');
        return;
      }
    }
    this.getPagesData();
    if (this.appService.adDetails) {
      this.pages = this.appService.adDetails['pages_details'];
      // this.selectPage(this.pages[0]);
      this.selectTool('block');
    }
    this.createPagePer = this.appService.headerPermissions
      ? this.appService.headerPermissions['CREATE_EDIT_PAGES']
      : true;
    this.createModPer = this.appService.headerPermissions
      ? this.appService.headerPermissions['CREATE_EDIT_MODS']
      : true;
  }
  selectPage(page, lay) {
    // this.selectedPage = this.updateModDetails(page);
    this.selectedPage.cols = parseInt(page.cols);
    this.selectedPage.rows = parseInt(page.rows);
    this.selectedPage.width = page.width * 96;
    // // this.selectedPage.height = 21 * 96;
    this.selectedPage.height = page.height * 96;
  }
  updateModDetails(selPage) {
    if (selPage.blocks && selPage.blocks.length) {
      selPage.blocks.map(params => {
        if (params.sequenceId && params.type === 'block') {
          const i = _.findIndex(<any>this.appService.currentBaseValues, {
            mod_order: parseInt(params.sequenceId, 10)
          });
          // fetching data from promotions :: need to delted when data updated
          const param = {
            ad_id: this.appService.adId,
            pageNumber: this.activePage,
            modNumber: parseInt(params.sequenceId, 10),
            versions:
              i > -1
                ? this.appService.currentBaseValues[i].versions.split(',')
                : [],
            filter: true,
            promo_id:
              i > -1
                ? this.appService.currentBaseValues[i].promo_ids.split(',')
                : []
          };
          // this.getPromoData(param, i);
          this.adsService
            .getAdModules([{ url: 'getPromotionView' }, param])
            .then(res => {
              const promoData = res.result.data.data;
              if (promoData.length && i > -1) {
                params.headline = promoData[0].headline;
                params.bodycopy = promoData[0].body_copy;
                params.brand = promoData[0].brand;
                this.appService.currentBaseValues[i].headline =
                  promoData[0].headline;
                this.appService.currentBaseValues[i].body_copy =
                  promoData[0].body_copy;
                this.appService.currentBaseValues[i].brand = promoData[0].brand;
              }
            });
          if (i > -1) {
            params.price = this.appService.currentBaseValues[i].price;
            params.price_fct = this.appService.currentBaseValues[i].price_fct;
            // params.headline = this.appService.currentBaseValues[i].icon_path;
            // params.bodycopy = this.appService.currentBaseValues[i].body_copy;
            params.icons = this.appService.currentBaseValues[i].icon_path;
            // params.brand = this.appService.currentBaseValues[i].brand;
          }
        } else if (
          params.type === 'layout' &&
          params.blocks &&
          params.blocks.length
        ) {
          params.blocks.map(param => {
            if (param.sequenceId) {
              const i = _.findIndex(<any>this.appService.currentBaseValues, {
                mod_order: parseInt(param.sequenceId, 10)
              });
              const par = {
                ad_id: this.appService.adId,
                pageNumber: this.activePage,
                modNumber: parseInt(param.sequenceId, 10),
                versions: this.appService.currentBaseValues[i].versions.split(
                  ','
                ),
                promo_id:
                  i > -1
                    ? this.appService.currentBaseValues[i].promo_ids.split(',')
                    : [],
                filter: true
              };
              // this.getPromoData(par, i);
              this.adsService
                .getAdModules([{ url: 'getPromotionView' }, par])
                .then(res => {
                  const promoData = res.result.data.data;
                  if (promoData.length && i > -1) {
                    param.headline = promoData[0].headline;
                    param.bodycopy = promoData[0].body_copy;
                    param.brand = promoData[0].brand;
                    this.appService.currentBaseValues[i].headline =
                      promoData[0].headline;
                    this.appService.currentBaseValues[i].body_copy =
                      promoData[0].body_copy;
                    this.appService.currentBaseValues[i].brand =
                      promoData[0].brand;
                  }
                });
              if (i > -1) {
                param.price = this.appService.currentBaseValues[i].price;
                param.price_fct = this.appService.currentBaseValues[
                  i
                ].price_fct;
                // param.headline = this.appService.currentBaseValues[i].icon_path;
                // param.bodycopy = this.appService.currentBaseValues[i].body_copy;
                param.icons = this.appService.currentBaseValues[i].icon_path;
                // param.brand = this.appService.currentBaseValues[i].brand;
              }
            }
          });
        }
      });
    }
    // this.selectPage(selPage);
    selPage = Object.assign({}, selPage, { activePage: this.activePage });
    this.selectedPage = selPage;
    return selPage;
  }
  selectTool(tool) {
    this.selectedTool = tool;
  }
  getPromoData(param, i) {
    this.adsService
      .getAdModules([{ url: 'getPromotionView' }, param])
      .then(res => {
        const promoData = res.result.data.data;
        if (promoData.length && i > -1) {
          this.appService.currentBaseValues[i].headline = promoData[0].headline;
          this.appService.currentBaseValues[i].body_copy =
            promoData[0].body_copy;
          this.appService.currentBaseValues[i].brand = promoData[0].brand;
        }
      });
  }
  toggleInfo() {
    this.showPageInfo = !this.showPageInfo;
    this.selectTool(null);
  }

  @HostListener('click', ['$event'])
  hidePopup(): void {
    if (GridLayoutDesignerComponent.blockInfoPopup) {
      GridLayoutDesignerComponent.blockInfoPopup = null;
    }
    if (this.showPageInfo) {
      this.showPageInfo = false;
    }
  }
  getPagesData() {
    // this.getSearchModPromo();
    this.router.navigateByUrl(
      'vehicles/' + this.appService.adId + '/ad-design'
    );
    const params = {
      ad_id: this.appService.adId,
      type: 'all'
      // base_id: obj.base_id
    };
    this.progress = true;

    this.adsService.sendOuput('getDesignPages', params).then(res => {
      if (res.result.success) {
        this.totalData = res.result.data;
        // this.totalData = [];
        // this.totalData.push(res.result.data[6]);
        this.progress = false;

        // this.dataSource.data = this.totalData;
        if (this.totalData.length) {
          this.noData = false;
          this.totalData[0].show = true;
          this.selectedBase = this.totalData[0].zoneInfo[0].key;
          this.selectedBaseTitle = this.totalData[0].id;
          this.selectedBaseOrder = this.totalData[0].page_order;
          this.appService.currPageOrder = this.totalData[0].page_order;
          this.activePage = this.totalData[0].id;
          this.getBasePrices(
            this.totalData[0].zoneInfo[0],
            this.totalData[0].zones[0],
            this.totalData[0]
          );

          // const currentObj = {
          //   versions: this.totalData[0].base_version[
          //     this.totalData[0].base[0].key
          //   ],
          //   pageNumber: this.totalData[0].page,
          //   base_id: this.totalData[0].base_id,
          //   current_base: this.totalData[0].base[0].key
          // };
          // this.appService.currentObj = currentObj;
        } else {
          this.noData = true;
        }
      }

      this.progress = false;
    });
  }
  getSearchModPromo(page_order, zoneInfo) {
    const params = {
      ad_id: this.appService.adId,
      page: page_order,
      mod: '',
      zone: zoneInfo.value,
      pageNumber: 1,
      pageSize: 125
    };
    this.adsService.sendOuput('searchModPromo', params).then(res => {
      if (res.result.success) {
        this.promoDetData = res.result.data;
      } else {
        this.promoDetData = [];
      }
    });
  }
  getBasePrices(obj, id, currData) {
    this.getSearchModPromo(currData.page_order, obj);
    this.appService.currZoneValue = obj.value;
    const params = {
      ad_id: this.appService.adId,
      page_id: this.selectedBaseTitle,
      zone_id: obj.key
    };
    this.adsService.sendOuput('getDesignMods', params).then(res => {
      this.selectedMods = [];
      // this.currentLayout = [];
      this.dbModId = '';
      this.dropListInfo = [];
      if (res.result.data.length) {
        this.selectedMods = res.result.data;
        this.dbModId = res.result.data[res.result.data.length - 1].id;
        this.currentLayout =
          res.result.data[res.result.data.length - 1].promotion_info;
        if (this.selectedMods) {
          this.selectedMods.map(attr => {
            if (attr.type == 'layout' && attr.blocks) {
              attr.blocks.map(attrdup => {
                this.dropListInfo.push(attrdup.id);
              });
            }
            this.dropListInfo.push(attr.id);
          });
        }
      } else {
        // this.currentLayout = this.selectedPage;
      }

      // blockInfo[blockInfo.length].promotion_info.layout.blocks
      // return;
      // res.result.data.layout = [];

      // this.appService.currentBaseValues = res.result.data.data;
      // this.selectPage({ data: res.result.data });
      // let cloneData = {};
      let cloneData = { ...currData };
      cloneData.width = currData.width * 96;
      cloneData.height = currData.height * 96;
      cloneData.cols = parseInt(currData.cols);
      cloneData.rows = parseInt(currData.rows);
      cloneData['blocks'] = this.selectedMods ? this.selectedMods : [];
      cloneData['placeholderBlocks'] = Array(currData.rows * currData.cols);
      // this.selectedPage.cols = parseInt(currData.cols);
      // this.selectedPage.rows = parseInt(currData.rows);
      // this.selectedPage.width = currData.width * 96;
      // // // this.selectedPage.height = 21 * 96;
      // this.selectedPage.height = currData.height * 96;
      // this.selectedPage['blocks']= this.selectedMods ? this.selectedMods : [];
      // this.selectedPage['placeholderBlocks'] = Array(
      //   this.selectedPage.rows *  this.selectedPage.cols
      // );
      this.selectedPage = cloneData;
      // this.selectedPage.cols = 0;
      // this.selectPage(currData,'layout');
    });
  }
  dropdownTrigger(list) {
    this.selectedVal(list.zoneInfo[0], list);
    this.totalData.forEach(attr => {
      attr.show = false;
    });
    // if(list.length){
    // }
    list.show = !list.show;
  }
  drop(e) {
    console.log(e);
  }
  selectedVal(base, data) {
    const i = _.findIndex(this.totalData, { id: data.id });
    // const currentObj = {
    //   versions: i > -1 ? this.totalData[i].base_version[base.key] : '',
    //   pageNumber: data.page,
    //   base_id: data.base_id,
    //   current_base: base.key
    // };
    // this.updateModDetails(
    //   this.totalData[i].layout[currentObj.current_base]
    //     ? this.totalData[i].layout[currentObj.current_base]
    //     : { data: data }
    // );
    this.selectedBaseTitle = data.id;
    this.selectedBaseOrder = data.page_order;
    this.appService.currPageOrder = data.page_order;

    this.selectedBase = base.key;
    this.activePage = data.id;
    // this.appService.currentObj = currentObj;
    this.getBasePrices(base, data.base_id, data);
  }

  // selectedVal(base, data) {
  //   let pageData = data.expansionModel.selected[0];
  //   let i = _.findIndex(this.totalData, { page: pageData.page });
  //   let currentObj = {
  //     versions: i > -1 ? this.totalData[i].base_version[base.key] : '',
  //     pageNumber: pageData.page,
  //     base_id: data.base_id,
  //     current_base: base.key
  //   };
  //   this.selectPage(
  //     this.totalData[i].layout[currentObj.current_base]
  //       ? this.totalData[i].layout[currentObj.current_base]
  //       : { data: pageData }
  //   );
  //   this.selectedBaseTitle = pageData.page;
  //   this.selectedBase = base.value;
  //   this.appService.currentObj = currentObj;
  //   this.getBasePrices(base, pageData.base_id);
  // }

  onCreate(data) {
    this.updateModBlocks(data);
    // let updateParams={
    //   base_id :this.appService.currentObj.base_id,
    //   ad_id : this.appService.adId,
    //   layout: {}
    //    }
    //    var obj ={ }
    //    obj[this.appService.currentObj.current_base] = this.selectedPage;
    //    updateParams.layout=(Object.assign({}, updateParams.layout ,obj))
    //    this.adsService.updateFeatureItems([{ url: 'updateBaseVersion' }, updateParams])
    //    .then(res => {
    //    });
  }
  deleteBlock(data) {
    this.updateModBlocks(data);
  }
  updateModBlocks(data) {
    // return;
    // return;
    console.log(data);
    let layoutInfo = {
      blockWidth: data.layout ? data.layout.blockWidth : '',
      blockHeight: data.layout ? data.layout.blockHeight : ''
    };
    if (!this.currentLayout || !this.currentLayout.length) {
      this.currentLayout = data.layout;
    }
    const updateParams = {
      page_id: this.selectedBaseTitle,
      ad_id: this.appService.adId,
      zone_id: this.selectedBase,
      mod_order: data.block
        ? data.block.block_info.sequenceId
          ? data.block.block_info.sequenceId
          : ''
        : '',
      block_info: data.block
        ? data.block.block_info
          ? data.block.block_info
          : data.block
        : data,
      layout_info: layoutInfo,
      promotion_info: data.block
        ? data.block.promotion_info
          ? data.block.promotion_info
          : []
        : [],
      promotion_id: data.block
        ? data.block.promotion_id
          ? data.block.promotion_id
          : []
        : [],
      id: data.block
        ? data.block.id && data.block.id != 'new'
          ? data.block.id
          : ''
        : '',
      placeholderBlocks: data.block.placeholderBlocks
        ? data.block.placeholderBlocks
        : [],
      layout: this.currentLayout
    };
    this.adsService.sendOuput('saveMod', updateParams).then(res => {
      if (res.result.success) {
        this.dbModId = res.result.data.id ? res.result.data.id : this.dbModId;
      }
      if (this.selectedPage['blocks'] && this.selectedPage['blocks'].length) {
        let i = _.findIndex(<any>this.selectedPage['blocks'], {
          id: 'new'
        });
        if (i > -1 && res.result.data) {
          this.selectedPage['blocks'][i] = res.result.data;
          this.selectedPage['blocks'][i]['placeholderBlocks'] = data.block
            .placeholderBlocks
            ? data.block.placeholderBlocks
            : [];
        }
      }
      let prmIdx = _.findIndex(<any>this.selectedPage['blocks'], {
        id: updateParams.id
      });
      if (prmIdx > -1 && res.result.data && res.result.data.promotion_info) {
        this.selectedPage['blocks'][prmIdx]['promotion_info'] =
          res.result.data.promotion_info;
      }

      if (this.selectedPage['blocks'] && this.selectedPage['blocks'].length) {
        this.dropListInfo = [];
        this.selectedPage['blocks'].map(attr => {
          if (attr.type == 'layout' && attr.blocks) {
            attr.blocks.map(attrdup => {
              this.dropListInfo.push(attrdup.id);
            });
          }
          this.dropListInfo.push(attr.id);
        });
      }
    });

    // const obj = {};
    // setTimeout(() => {
    //   obj[this.appService.currentObj.current_base] = this.selectedPage;
    //   updateParams.layout = Object.assign({}, updateParams.layout, obj);
    //   this.adsService
    //     .updateFeatureItems([{ url: 'updateBaseVersion' }, updateParams])
    //     .then(res => {});
    // });
  }

  public dialogRef: any;
  public collapseFlag = false;
  public rightCollapseFlag = true;
  adPages() {
    this.dialogRef = this.dialog.open(AddPageComponent, {
      panelClass: ['ads-dialog', 'overlay-dialog', 'add-page-dialog'],
      width: '760px',
      data: {
        pagesData: this.totalData
      }
    });
    this.dialogRef.afterClosed().subscribe(res => {
      if (res.from == 'save') {
        this.totalData.push(res.res);
        let i = this.totalData.length - 1;
        this.dropdownTrigger(this.totalData[i]);
        // return;
        // this.totalData[i].show = true;
        // this.selectedBase = this.totalData[i].zoneInfo[0].key;
        // this.selectedBaseTitle = this.totalData[i].id;
        // this.selectedBaseOrder = this.totalData[i].page_order;
        // this.appService.currPageOrder = this.totalData[i].page_order;
        // this.activePage = this.totalData[i].id;

        // this.getBasePrices(
        //   this.totalData[i].zoneInfo[0],
        //   this.totalData[i].zones[0],
        //   this.totalData[i]
        // );
      }
    });
  }

  collapsePageList() {
    this.collapseFlag = !this.collapseFlag;
  }
  collapseRightPageList() {
    this.rightCollapseFlag = !this.rightCollapseFlag;
  }
}
