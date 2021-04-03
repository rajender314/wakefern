import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';
import {
  MatSnackBar,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatTabGroup
} from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';
import { AppService } from '@app/app.service';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { HttpClient } from '@angular/common/http';
import { Subject, forkJoin } from 'rxjs';
import { debug } from 'util';

const APP: any = window['APP'];

@Component({
  selector: 'app-image-assests',
  templateUrl: './image-assests.component.html',
  styleUrls: ['./image-assests.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImageAssestsComponent implements AfterViewInit, OnInit {
  public imageAssestsInfo = {
    search: null,
    assetType: '',
    pageSize: 20,
    pageNumber: 1
  };
  public rowData: any;
  public assetType: any;
  public activeUPC: any;
  public isEditUpc = 0;
  public subscription: any;
  public assestsCollection = [];
  public selectedAssests = [];
  public imagesFromEditMod = [];
  public imageUpcs = [];
  public noData = false;
  public progress = false;
  public selectedAssetPreview = false;
  public edited = false;
  public noExistingLogosMsg = false;
  public newTabProgress = true;
  public dynamicArray = [];
  public updateParams: {};
  public dataStatus = true;
  public toggleClass = false;
  public disableSave = true;
  public imageDetails = [];
  public imageCollection = [];
  public iconDetails = [];
  public iconCollection = [];
  public logoDetails = [];
  public logoCollection = [];
  public selectedUpc = '';
  public fromComp = '';
  public noLogo = APP.img_url + 'nologo.png';
  private globalSeachKey = new Subject<any>();
  public currentUpc = '';
  globalSeachKeyCalled$ = this.globalSeachKey.asObservable();
  @ViewChild('UPCsGroup') private tabGroup: MatTabGroup;

  constructor(
    private adsService: AdsService,
    private appService: AppService,
    public dialogRef: MatDialogRef<ImageAssestsComponent>,
    private snackbar: MatSnackBar,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.data.fromComp != 'editMod') {
      this.rowData = this.data.rowData;

      this.logoDetails = this.data.rowData.logo_details;
      this.logoCollection = Object.assign({}, this.logoDetails); // duplicate value of 'logoDetails'

      this.imageDetails =
        this.assetType === 'image' ? this.data.rowData.image_details : [];
      this.imageCollection = Object.assign({}, this.imageDetails); // duplicate value of 'imageDetails'

      this.iconDetails = this.data.rowData.icons;
      this.iconCollection = Object.assign({}, this.iconDetails); // duplicate value of 'iconDetails'
      // this.imageAssestsInfo.search = '';
      this.imageUpcs.push('Selected Images');
      this.imageUpcs =
        this.data.fromComp == 'adPromotions'
          ? this.rowData.upc
            ? this.imageUpcs.concat(this.rowData.upc.split(/[,;]+/))
            : []
          : this.rowData.image_upcs
          ? this.imageUpcs.concat(this.rowData.image_upcs.split(/[,;]+/))
          : [];
      this.imageUpcs = this.imageUpcs.filter(element => {
        // if no value for element we not showing in UI using this filtering
        if (element) {
          return element;
        }
      });

      for (var i = 0; i < this.imageUpcs.length; i++) {
        this.imageUpcs[i] = this.imageUpcs[i].trim();
      }
      this.imageUpcs = _.uniq(this.imageUpcs);
      this.dynamicArray = Array(this.imageUpcs.length);
      this.assetType = this.data.from;
      if (this.rowData['brand'] !== '' && this.assetType !== 'image') {
        if (this.assetType != 'icon_path') {
          this.imageAssestsInfo.search = this.rowData['brand'];
          if (!this.rowData.logo_details.length) {
            this.searchAsset();
          }
        }
      }

      if (this.assetType === 'image') {
        this.selectedUpc = this.imageUpcs[0];
        this.getImages(this.imageUpcs[0], 0);
      }
    } else if (this.data.fromComp && this.data.fromComp === 'editMod') {
      this.imagesFromEditMod = [];
      this.fromComp = this.data.fromComp;
      this.imageAssestsInfo.search = this.data.search;
      this.assetType = this.data.from;
      if (this.assetType == 'images') {
        this.imagesFromEditMod = this.data.activeModData.images;
      } else {
        this.imagesFromEditMod = this.data.activeModData.icons;
      }
      this.selectedAssests = this.imagesFromEditMod;

      if (this.data.action == 'editModImages') {
        // here when need to get already selected data and make it as selected by default, caling from right ahnd side of edit mod click
        if (this.data.from == 'images') {
          this.assestsCollection = this.data.activeModData.images;
          this.selectedAssests = this.assestsCollection;
        } else {
          // Icons
          this.assestsCollection = this.data.activeModData.icons;
          this.selectedAssests = this.assestsCollection;
        }
      } else {
        this.searchAsset();
      }
    }
  }

  ngAfterViewInit() {
    if (this.data.fromComp && this.data.fromComp === 'editMod') {
      return;
    }
    if (this.assetType == 'image') {
      this.imageAssestsInfo.search = this.imageUpcs[0];
    }
    this.UpdateAssetInfo(0);
    this.activeUPC = this.imageAssestsInfo.search;
  }
  onEnter(params) {
    if (this.progress || !this.imageAssestsInfo.search) {
      return;
    }
    this.searchAsset();
  }
  UpdateAssetInfo(idx) {
    if (this.assetType === 'image') {
      this.progress = true;
      this.noData = false;
      if (this.rowData.image_details.length) {
        const index = _.findIndex(this.rowData.image_details, {
          image_upc: this.imageAssestsInfo.search
        });
        if (index > -1) {
          this.rowData.image_details.forEach(imageInfo => {
            if (imageInfo.image_upc === this.imageAssestsInfo.search) {
              this.assestsCollection.push(imageInfo);
              this.dynamicArray[idx] = this.assestsCollection;
              //  this.tabGroup.selectedIndex
            }
          });
          this.progress = false;
          this.noData = false;
          this.selectedAssetPreview = true;
        } else {
          this.getAssetInfo(idx);
        }
      } else {
        this.getAssetInfo(idx);
      }
    } else if (this.assetType === 'logos') {
      if (this.rowData.logo_details.length) {
        this.noExistingLogosMsg = false;
        this.assestsCollection = this.rowData.logo_details;
        this.selectedAssests = this.assestsCollection;
        this.selectedAssetPreview = true;
      } else {
        this.noExistingLogosMsg = true;
      }
    } else if (this.assetType === 'icon_path') {
      if (this.rowData.icons.length || this.rowData.icon_path != '') {
        this.noExistingLogosMsg = false;
        if (this.rowData.icons.length) {
          this.assestsCollection = this.rowData.icons;
          this.selectedAssests = this.assestsCollection;
          this.selectedAssetPreview = true;
        }
      } else {
        this.noExistingLogosMsg = true;
      }
    }
  }

  getAssetInfo(index) {
    let idx = index;
    this.dataStatus = true;
    this.progress = true;
    this.noData = false;
    if (idx === 0 || this.selectedUpc === 'Selected Images') {
      this.assestsCollection =
        this.selectedAssests.length > 0
          ? this.selectedAssests
          : this.rowData.image_details;
      this.progress = false;
      if (this.assestsCollection.length) {
        this.noData = false;
      } else {
        this.noData = true;
      }
      return;
    }
    if (this.assetType === 'logos' || this.assetType === 'logo_path') {
      this.imageAssestsInfo.assetType = 'logos'; //   "this.imageAssestsInfo" -- used in rest call
    } else {
      this.imageAssestsInfo.assetType = undefined;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.adsService
      .getAssetInfo(this.imageAssestsInfo, this.assetType)
      .subscribe(
        res => {
          this.progress = false;
          this.toggleClass = false;
          if (res['result'].success) {
            const currentAssetCollection = res['result'].data.assetsData
              ? res['result'].data.assetsData
              : [];

            if (
              currentAssetCollection.length < 1 ||
              currentAssetCollection.length < this.imageAssestsInfo.pageSize
            ) {
              this.dataStatus = false;
            }
            // if asset type is image
            if (this.assetType === 'image') {
              if (this.assestsCollection.length) {
                this.assestsCollection.push(...res['result'].data.assetsData);
                this.noData = false;
              } else {
                this.assestsCollection = res['result'].data.assetsData
                  ? res['result'].data.assetsData
                  : [];
                this.noData = true;
              }
            } // non-image context(logo/icon)
            else if (
              this.assetType === 'logos' ||
              this.assetType === 'icon_path' ||
              (this.assetType === 'images' && this.fromComp === 'editMod')
            ) {
              if (
                res['result'].data.assetsData &&
                res['result'].data.assetsData.length
              ) {
                res['result'].data.assetsData.map((item, idx) => {
                  res['result'].data.assetsData[idx].selected = false;
                });
              }
              if (this.assestsCollection.length) {
                this.assestsCollection.push(...res['result'].data.assetsData);
                this.chkSelection();
              } else {
                this.assestsCollection = res['result'].data.assetsData;
                this.chkSelection();
              }
              // if (this.assetType === 'images' && this.fromComp === 'editMod'){
              //   console.log('main collection');
              //   console.log(this.assestsCollection);
              //   console.log('already available from mod ');
              //   console.log(this.data.activeModData.images);
              //   this.assestsCollection.map((data)=> {
              //     this.data.activeModData.images.map((image)=> {
              //       if(data.assetId == image.assetId){
              //         data.selected = true;
              //       }
              //     });
              //   });
              // }
            }
            // in editMod page, icons selection --> deselecting by default
            if (this.assetType === 'icon_path' && this.fromComp === 'editMod') {
              this.assestsCollection.map(data => {
                data.selected = false;
              });
              this.chkSelection();
            }

            if (res['result'].data.returnStatus) {
              if (this.assestsCollection.length) {
                this.assestsCollection.forEach(asset => {
                  if (asset.selected != true) {
                    asset.selected = false;
                  }
                });

                if (this.assetType === 'image') {
                  this.dynamicArray[idx] = this.assestsCollection;
                }
                this.chkSelection();
                this.noData = false;
                this.progress = false;
              }
            } else {
              this.noData = true;
              this.progress = false;
            }
          }
        },
        error => {},
        () => {
          // console.log('call completed');
        }
      );
  }

  stopSearchProcess() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.assetType === 'logos' && this.progress) {
      this.assestsCollection = Object.values(this.logoCollection);
    }
    if (this.assetType === 'icon_path' && this.progress) {
      this.assestsCollection = Object.values(this.iconCollection);
    }
    this.progress = false;
  }
  searchAsset() {
    this.disableSave = true;
    this.imageAssestsInfo.pageNumber = 1;
    this.assestsCollection = [];
    this.selectedAssetPreview = false;
    if (this.assetType !== 'image') {
      this.noExistingLogosMsg = false;
    }
    this.getAssetInfo('');
  }

  chkSelection() {
    // if (this.fromComp === 'editMod') {
    //   return;
    // }
    // if (this.assetType === 'image') {
    //   if (this.rowData.image_details.length) {
    //     this.rowData.image_details.map((val: any) => {
    //       this.chkAssetSelection(val);
    //     });
    //   }
    // } else if (this.assetType === 'logos') {
    //   if (this.rowData.logo_details.length) {
    //     this.rowData.logo_details.map((val: any) => {
    //       this.chkAssetSelection(val);
    //     });
    //   }
    // } else if (this.assetType === 'icon_path') {
    //   if (this.rowData.icons.length) {
    //     this.rowData.icons.map((val: any) => {
    //       this.chkAssetSelection(val);
    //     });
    //   }
    // }
    this.selectedAssests.map((val: any) => {
      this.chkAssetSelection(val);
    });
  }
  chkAssetSelection(val: { assetId: _.PartialDeep<any>; image_upc: any }) {
    const index = _.findIndex(this.assestsCollection, {
      assetId: val.assetId
    });
    if (
      index > -1 &&
      this.assestsCollection[index].image_upc === val.image_upc
    ) {
      this.assestsCollection[index].selected = true;
    } else if (index > -1) {
      this.assestsCollection[index].selected = true;
    }
  }
  tabChanged(event) {
    // console.log(event,"tab-select");
    // this.imageAssestsInfo.pageNumber = 1;
    // this.assestsCollection = [];
    // this.imageAssestsInfo.search = event.tab.textLabel.trim();
    // this.activeUPC = this.imageAssestsInfo.search;
    // console.log(this.tabGroup,"tab");
    // if (this.dynamicArray[this.tabGroup.selectedIndex] === undefined) {
    //   this.UpdateAssetInfo();
    // } else {
    //   this.assestsCollection = this.dynamicArray[this.tabGroup.selectedIndex];
    //   this.noData = false;
    // }
  }

  getImages(event, index) {
    if (this.isEditUpc) {
      this.progress = false;
      return;
    }
    this.imageAssestsInfo.pageNumber = 1;
    this.assestsCollection = [];
    this.imageAssestsInfo.search = event;
    this.activeUPC = this.imageAssestsInfo.search;
    this.selectedUpc = event;

    if (index === 0 && this.assetType === 'image') {
      // when clicked on selected image text.
      this.assestsCollection =
        this.selectedAssests.length > 0
          ? this.selectedAssests
          : this.rowData.image_details;
      this.selectedAssests = this.rowData.image_details;
      if (this.assestsCollection.length) {
        this.noData = false;
      } else {
        this.noData = true;
      }
      return;
    }
    if (this.dynamicArray[index] === undefined) {
      this.UpdateAssetInfo(index);
    } else {
      this.assestsCollection = this.dynamicArray[index];
      this.noData = false;
    }
  }

  assetSelected(assetInfo) {
    // return;
    assetInfo.selected = !assetInfo.selected;

    // this.assestsCollection = this.assestsCollection.concat(this.selectedAssests);
    // this.assestsCollection = _.uniqBy(this.assestsCollection, 'assetId');
    if (this.assetType != 'image') {
      // const index = _.findIndex(this.selectedAssests, {
      //   assetId: assetInfo.assetId
      // });
      // if(index > -1){
      //   this.selectedAssests[index].selected = !this.selectedAssests[index].selected
      // }
      let selAssets = _.filter(this.assestsCollection, function(o) {
        if (o.selected === true) {
          return o;
        }
      });
      let dupSelAssets = _.filter(this.selectedAssests, function(o) {
        if (o.selected === true) {
          return o;
        }
      });
      this.selectedAssests = selAssets.concat(dupSelAssets);
    } else {
      this.selectedAssests = _.filter(this.assestsCollection, function(o) {
        if (o.selected === true) {
          return o;
        }
      });
    }

    if (assetInfo.selected) {
      //logo context
      if (this.assetType === 'logos' && this.logoDetails.length) {
        this.disableSave = false;
      } else if (this.assetType === 'image' && this.imageDetails.length) {
        //image context
        this.disableSave = false;
      } else {
        if (this.selectedAssests.length) {
          this.disableSave = false;
        } else {
          this.disableSave = true;
        }
      }
    }

    this.dynamicArray.forEach(val => {
      val.map(subVal => {
        if (subVal.selected === true) {
          const index = _.findIndex(this.selectedAssests, {
            assetId: subVal.assetId
          });
          if (index < 0) {
            this.selectedAssests.push(subVal);
          }
        }
      });
    });
    this.selectedAssests = [...this.selectedAssests, ...this.imageDetails];
    this.selectedAssests = _.uniqBy(this.selectedAssests, 'assetId');
    this.selectedAssests = _.filter(this.selectedAssests, ['selected', true]);
    if (this.assetType === 'icon_path') {
      this.selectedAssests = [...this.selectedAssests, ...this.iconDetails];
      this.selectedAssests = _.uniqBy(this.selectedAssests, 'assetId');
      this.selectedAssests = _.filter(this.selectedAssests, ['selected', true]);
    }
    if (this.selectedAssests.length) {
      this.disableSave = false;
    } else {
      this.disableSave = true;
    }
  }

  updateAssets() {
    if (this.fromComp === 'editMod') {
      let assetData = {
        selectedAssets: this.selectedAssests,
        assetType: this.assetType
      };
      this.dialogRef.close({ data: assetData });
      return;
    }
    let itemsObj = {
      key:
        this.data.from === 'image'
          ? 'image_details'
          : this.data.from === 'logos'
          ? 'logo_details'
          : 'icons',
      item_id: ''
    };

    itemsObj['item_id'] =
      this.data.url == 'updatePromotionsDetails'
        ? this.rowData.item_id
        : this.rowData.id;
    itemsObj = Object.assign({}, itemsObj, { value: this.selectedAssests });
    const params = {
      ad_id: this.appService.adId,
      items: [],
      promotion_id:
        this.data.url == 'updatePromotionsDetails'
          ? this.data.rowData.promotion_id
          : ''
    };
    params.items.push(itemsObj);
    this.adsService.promotionItems.items.push(itemsObj);

    if (this.data.url != 'updatePromotionsDetails') {
      this.adsService
        .updateFeatureItems([{ url: this.data.url }, params])
        .then(res => {
          if (res.result.success) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg:
                  (this.data.from === 'icon_path'
                    ? 'Icons'
                    : this.data.from === 'image'
                    ? 'Image'
                    : this.data.from === 'logos'
                    ? 'Logos'
                    : this.data.from) + ' Updated Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.dialogRef.close({ data: res, imgAssts: this.selectedAssests });
          }
        });
    } else if (this.data.url == 'updatePromotionsDetails') {
      let res = {
        assetType: this.data.from,
        result: {
          success: true
        }
      };
      this.dialogRef.close({ data: res, imgAssts: this.selectedAssests });
    }
  }

  onSearch(event) {
    this.imageAssestsInfo.search = event;
  }

  close() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.assetType === 'icon_path') {
      // icons case
      this.dialogRef.close(this.iconCollection);
    } else if (this.assetType === 'image') {
      // IMAGE case
      this.dialogRef.close(this.imageCollection);
    } else {
      // Logos case
      this.dialogRef.close(this.logoCollection);
    }
  }
  onScrollDown() {
    if (this.selectedUpc === 'Selected Images' || this.selectedAssetPreview) {
      return;
    }
    this.imageAssestsInfo.pageNumber = this.imageAssestsInfo.pageNumber + 1;
    if (this.dataStatus) {
      this.toggleClass = true;
      this.getAssetInfo('');
    }
  }
  editUpc() {
    this.isEditUpc = 1;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // this.currentUpc = this.selectedUpc;
  }
  updateUpc(idx) {
    this.isEditUpc = 0;
    this.getImages(this.selectedUpc, idx);
  }
  valChanged(val, i) {
    // this.imageUpcs[i] = val;
    this.selectedUpc = val;
    event.stopPropagation();
  }
}
