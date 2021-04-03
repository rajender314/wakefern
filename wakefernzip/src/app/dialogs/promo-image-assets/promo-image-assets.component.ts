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
import { SettingsService } from '@app/settings/settings.service';
import { DomSanitizer } from '@angular/platform-browser';

const APP: any = window['APP'];
@Component({
  selector: 'app-promo-image-assets',
  templateUrl: './promo-image-assets.component.html',
  styleUrls: ['./promo-image-assets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PromoImageAssetsComponent implements OnInit {
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

  public filename = '';
  public upcValue = '';
  public productname = '';
  public dataLoading = false;
  public imageAssets = [];
  public selectedAssetList = [];
  public imagePath;
  public btnName = 'Next';
  public pageNumber = 0;
  public cloneImgArray = [];
  public noImgSelected = true;
  public noImgFound = false;
  public selectedValue = '';
  public arr = [];

  public indexArr = [];

  public imageDropdownList = [
    { id: 'image_01', name: 'Image 01', status: 'active' },
    { id: 'image_02', name: 'Image 02', status: 'active' },
    { id: 'image_03', name: 'Image 03', status: 'active' },
    { id: 'image_04', name: 'Image 04', status: 'active' },
    { id: 'image_05', name: 'Image 05', status: 'active' },
    { id: 'image_06', name: 'Image 06', status: 'active' },
    { id: 'image_07', name: 'Image 07', status: 'active' },
    { id: 'image_08', name: 'Image 08', status: 'active' },
    { id: 'image_09', name: 'Image 09', status: 'active' },
    { id: 'image_10', name: 'Image 10', status: 'active' }
  ];
  public bindvalue = '';

  public filteredList = [];
  public paramArray = [];
  public cloneImgList = [];

  globalSeachKeyCalled$ = this.globalSeachKey.asObservable();
  @ViewChild('UPCsGroup') private tabGroup: MatTabGroup;

  constructor(
    private adsService: AdsService,
    private appService: AppService,
    private settingsService: SettingsService,
    public dialogRef: MatDialogRef<PromoImageAssetsComponent>,
    private snackbar: MatSnackBar,
    private http: HttpClient,
    private _sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    this.cloneImgList = _.cloneDeep(this.imageDropdownList);
    // console.log( this.cloneImgList);
  }
  getAssetData() {
    // console.log(1212)
    let params = {
      fileName: this.filename,
      upc: this.upcValue,
      productName: this.productname
    };

    this.settingsService
      .deleteItem([{ url: 'getAssetsData' }, params])
      .then(response => {
        if (response.result.success) {
          let imageArr = [];
          this.dataLoading = false;
          // response.result.data.data.map(obj => {
          //   let a = obj.image_path;
          //   this.imagePath = this._sanitizer.bypassSecurityTrustResourceUrl(a);

          //   obj.image_path = this.imagePath;
          // });

          // console.log(this.imagePath);
          this.imageAssets = response.result.data.data;

          if (!this.imageAssets.length) {
            this.noImgFound = true;
          } else {
            this.noImgFound = false;
          }

          this.cloneImgArray = this.imageAssets.slice(0, 30);
          this.selectedAssetList = [];

          // this.cloneImageAssets();

          // this.cloneImgArray = [
          //   ...this.imageAssets,
          //   ...this.imageAssets,
          // ];

          // console.log(this.cloneImgArray)
          // let length = this.imageAssets.length-1;
          // let a = 5;

          // for(let i = 0; i < this.pageNumber; i++) {

          //   this.imageAssets.splice(a, length);
          //   a = a + 5;

          // }
        } else {
          this.dataLoading = false;
        }
      });
  }

  cloneImageAssets() {
    this.cloneImgArray = [
      ...this.cloneImgArray,
      ...this.imageAssets.slice(this.pageNumber, this.pageNumber + 30)
    ];
    // console.log(this.cloneImgArray)
    this.toggleClass = false;

    // console.log(this.cloneImgArray)
  }
  valChangedQty(event, field) {
    // console.log(event)
    if (field == 'filename') {
      this.filename = event.target.value;
      // this.getAssetData();
    }
    if (field == 'upc') {
      this.upcValue = event.target.value;
      // this.getAssetData();
    }
    if (field == 'product_name') {
      this.productname = event.target.value;
      // this.getAssetData();
    }
  }
  assetSelected(asset, index) {
    // console.log(asset)
    // asset.selected = asset.selected ? false : true;
    asset.selected = !asset.selected;

    if (asset.selected) {
      this.selectedAssetList.push(asset);
    } else {
      this.selectedAssetList.splice(index, 1);
    }

    // console.log(this.selectedAssetList)

    if (this.selectedAssetList.length) {
      this.disableSave = false;
    } else {
      this.disableSave = true;
    }
    // console.log(this.selectedAssetList);
  }

  close() {
    this.dialogRef.close();
  }
  searchAsset() {
    this.pageNumber = 0;
    // console.log(this.pageNumber)

    this.noImgSelected = false;
    this.dataLoading = true;
    this.getAssetData();
  }

  saveImages(btn) {
    if (btn == 'Next') {
      this.btnName = 'Save';
    } else {
      // this.btnName = 'Next';
      // console.log(this.selectedAssetList);
      // this.dialogRef.close();
      this.saveCall();
    }
  }

  saveCall() {
    let params = {
      ad_id: this.data.adId,
      items: this.paramArray,
      promotion_id: this.data.promoId
    };

    this.settingsService
      .deleteItem([{ url: 'updatePromotionsDetails' }, params])
      .then(response => {
        // console.log(response);
        if (response.result.success) {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: ' Updated Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.dialogRef.close(response);
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: response.result.data
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.dialogRef.close(response);
        }
      });
  }
  public idxArr = [];
  backToimgList() {
    this.btnName = 'Next';

    for (let i = 0; i < this.idxArr.length; i++) {
      this.imageDropdownList[i] = {
        ...this.imageDropdownList[i],
        ...{ inactive: false }
      };
    }
  }

  onImgChanges(event, index, image) {
    // console.log(this.imageDropdownList)
    let idxValPair = {
      idx: index,
      id: event
    };

    this.selectedValue = event;
    // console.log(this.selectedValue)
    let drpIdx = _.findIndex(this.imageDropdownList, {
      id: event
    });
    if (drpIdx > -1) {
      this.imageDropdownList[drpIdx] = {
        ...this.imageDropdownList[drpIdx],
        ...{ inactive: true }
      };

      this.idxArr.push(drpIdx);
    }
    let lastIdx = _.findIndex(this.indexArr, {
      idx: index
    });
    if (lastIdx > -1) {
      let oldIdx = _.findIndex(this.imageDropdownList, {
        id: this.indexArr[lastIdx].id
      });
      if (oldIdx > -1) {
        this.imageDropdownList[oldIdx] = {
          ...this.imageDropdownList[oldIdx],
          ...{ inactive: false }
        };
        this.idxArr.splice(drpIdx, 1);
      }
      this.indexArr.splice(lastIdx, 1);
      this.paramArray.splice(lastIdx, 1);
    }
    this.indexArr.push(idxValPair);

    // this.indexArr.push(image)

    this.paramArray.push({
      key: event,
      item_id: this.data.itemId,
      value: image
    });

    // console.log(this.indexArr)

    // this.imageDropdownList =  this.imageDropdownList.filter(obj => {
    //     if (obj.id == event) {
    //       obj.status = 'inactive';
    //     }
    //     return obj.status == 'active';
    //   });

    // console.log(this.imageDropdownList)
    // this.imageDropdownList.filter((ele, i) => {

    //   return

    // });
    // console.log(arr);
    // console.log(this.imageDropdownList);

    // this.filteredList = this.imageDropdownList.filter(ele => {
    //   return event != ele.id;
    // });

    // this.imageDropdownList = this.filteredList;

    // console.log(this.imageDropdownList)

    // this.selectedAssetList.map((obj, i) => {
    //   if (index == i) {
    //     Object.assign(obj, { key: event, item_id: this.data.itemId });
    //   }
    // });

    //  console.log( this.selectedAssetList)
  }
  onScrollDown() {
    // if (this.selectedUpc === 'Selected Images' || this.selectedAssetPreview) {
    //   return;
    // }
    // this.imageAssestsInfo.pageNumber = this.imageAssestsInfo.pageNumber + 1;
    this.pageNumber = this.pageNumber + 30;
    if (this.cloneImgArray.length != this.imageAssets.length) {
      this.toggleClass = true;
      // this.getAssetData();
      setTimeout(() => {
        this.cloneImageAssets();
      }, 2000);
    }

    // console.log(this.toggleClass)
  }
}
