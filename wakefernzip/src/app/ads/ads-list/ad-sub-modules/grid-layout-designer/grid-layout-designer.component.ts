import {
  Component,
  OnInit,
  Input,
  ElementRef,
  HostListener,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { PromtionsViewComponent } from '@app/dialogs/promtions-view/promtions-view.component';
import { AppService } from '@app/app.service';
import * as _ from 'lodash';
import { AdsService } from '@app/ads/ads.service';
const APP: any = window['APP'];

@Component({
  selector: 'app-grid-layout-designer',
  templateUrl: './grid-layout-designer.component.html',
  styleUrls: ['./grid-layout-designer.component.scss']
})
export class GridLayoutDesignerComponent implements OnInit, OnChanges {
  @Input() layout: any;
  @Input() currentPage: any;
  @Input() blockType: string = 'block';
  @Output() onCreate = new EventEmitter();
  @Output() onDeleteLayout = new EventEmitter();
  @Output() onDeleteBlock = new EventEmitter();

  static blockInfoPopup: any;

  layoutEl: any;
  moveObject: any = {};
  backgroundColors: any[] = [
    '#DBECFF',
    '#172B4D',
    '#8F7125',
    '#DE5459',
    '#975D3C',
    '#00875A',
    '#717C90',
    '#4286D5 ',
    '#FFE6A8',
    '#FFDFE0',
    '#FFD9C4',
    '#FF991F',
    '#E0E2E9'
  ];
  public drag = true;
  public dialogRef: any;
  public pageOrder = '';
  public noImage = APP.img_url + 'no-image.png';
  public submitted = false;
  constructor(
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private appService: AppService,
    private adsService: AdsService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.pageOrder = this.layout.page_order;
    this.layoutEl = this.elementRef.nativeElement.querySelector('.grid-layout');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.layout) {
      this.setup();
    }
  }
  drop(e, block) {
    // block.sequenceId =  block.idKey ;

    let currPromoData = e.item.data;
    let currModId = currPromoData.mod ? currPromoData.mod.split(',') : [];
    block.block_info.sequenceId = currModId.length ? currModId[0] : '';
    block.block_info.tempSequenceId = currModId.length ? currModId[0] : '';
    block.promo_info = currPromoData;
    block.promotion_info = [];
    if (block.promotion_id && block.promotion_id.length) {
      block.promotion_id.push(currPromoData.id);
    } else {
      block.promotion_id = [currPromoData.id];
    }
    //   block.price = currPromoData.net_retail;
    //   block.price_fct = currPromoData.type;
    //   block.headline = currPromoData.blowline;
    //  block.bodycopy = currPromoData.comb_overline;
    //  block.icons = currPromoData.image_01;
    //  block.sequenceId =  block.idKey ;

    this.onCreate.emit({ layout: this.layout, block: block });
  }
  setup() {
    if (!this.layout.block_info) {
      this.layout.header = this.layout.header || 0;
      this.layout.blockWidth = this.layout.width / this.layout.cols;
      this.layout.blockHeight =
        (this.layout.height - this.layout.header) / this.layout.rows + 40;
      if (this.layout.rows && this.layout.cols)
        this.layout.placeholderBlocks = Array(
          this.layout.rows * this.layout.cols
        );
    } else if (this.layout.block_info) {
      this.layout.header = this.layout.block_info.header
        ? this.layout.block_info.header
        : 0;
      this.layout.blockWidth =
        this.layout.block_info.width / this.layout.block_info.cols;
      this.layout.blockHeight =
        (this.layout.block_info.height - this.layout.block_info.header) /
          this.layout.block_info.rows +
        40;
      if (this.layout.block_info.rows && this.layout.block_info.cols)
        this.layout.placeholderBlocks = Array(
          this.layout.block_info.rows * this.layout.block_info.cols
        );
    }

    this.drag = false;
    /* Creating Mods based on seleceted page */
    // this.createMods();
  }
  createMods() {
    this.layout.blocks = [];
    // for(var i= 0; i<1;i++ ){
    var i = 0;
    for (var j = 0; j < this.layout.rows; j++) {
      for (var z = 0; z < this.layout.cols; z++) {
        if (i < this.layout.data.count) {
          let temp = {
            rows: 1,
            cols: 1,
            left: z,
            top: j,
            title: this.layout.data.data[i].mod_position,
            sequenceId: this.layout.data.data[i].mod_order,
            price: this.layout.data.data[i].price,
            price_fct: this.layout.data.data[i].price_fct,
            headline: this.layout.data.data[i].headline,
            bodycopy: this.layout.data.data[i].body_copy,
            icons: this.layout.data.data[i].icon_path,
            brand: this.layout.data.data[i].brand
          };
          i++;
          this.layout.blocks.push(temp);
        }
      }
    }
  }

  startMove(
    event: any,
    moveType: string,
    position: string | null = null
  ): void {
    if (this.blockType === 'block' || this.blockType === 'layout') {
      event.preventDefault();
      this.togglePopup(null);
      let pageCoordinates = this.getEventPageCoordinates(event);
      this.moveObject = {
        active: true,
        type: moveType,
        blockType: this.blockType,
        position: position,
        x1: pageCoordinates.x,
        y1: pageCoordinates.y,
        x2: pageCoordinates.x,
        y2: pageCoordinates.y,
        width: 0,
        height: 0
      };
    }
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  move(event: any): void {
    // if (this.moveObject.active) {
    event.stopPropagation();
    event.preventDefault();
    // if (this.moveObject.type === 'create') {
    let pageCoordinates = this.getEventPageCoordinates(event);

    this.moveObject.x2 = pageCoordinates.x;
    this.moveObject.y2 = pageCoordinates.y;
    this.moveObject.width = pageCoordinates.x - this.moveObject.x1;
    this.moveObject.height = pageCoordinates.y - this.moveObject.y1;
    // }
    // }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopMove(): void {
    if (this.moveObject.active) {
      if (this.moveObject.type === 'create') {
        this.createBlock();
      }
      this.moveObject.active = false;
    }
  }

  togglePopup(block) {
    event.stopPropagation();
    if (GridLayoutDesignerComponent.blockInfoPopup === block) {
      GridLayoutDesignerComponent.blockInfoPopup = null;
    } else {
      GridLayoutDesignerComponent.blockInfoPopup = block;
    }
  }

  get staticBlockInfoPopup() {
    return GridLayoutDesignerComponent.blockInfoPopup;
  }

  private createBlock() {
    console.log(this.layout);
    if (!this.layout.blocks) {
      this.layout.blocks = [];
    }

    let p1 = {
        x: Math.floor(this.moveObject.x1 / this.layout.blockWidth),
        y: Math.floor(this.moveObject.y1 / this.layout.blockHeight)
      },
      p2 = {
        x: Math.ceil(this.moveObject.x2 / this.layout.blockWidth),
        y: Math.ceil(this.moveObject.y2 / this.layout.blockHeight)
      };
    if (p2.x > this.layout.cols) {
      p2.x = this.layout.cols;
    }
    if (p2.y > this.layout.rows) {
      p2.y = this.layout.rows;
    }
    let block = {
      id: 'new',
      block_info: {
        left: p1.x,
        top: p1.y,
        cols: p2.x - p1.x,
        rows: p2.y - p1.y,
        type: this.moveObject.blockType,
        id: this.layout.blocks.length + 1,
        idkey:
          '' +
          this.moveObject.x1 +
          this.moveObject.x2 +
          this.moveObject.y1 +
          this.moveObject.y2
      }
    };
    if (this.blockType === 'layout') {
      block.block_info['header'] = 40;
      block.block_info['width'] =
        block.block_info.cols *
        (this.layout.blockWidth
          ? this.layout.blockWidth
          : this.layout.layout_info.blockWidth
          ? this.layout.layout_info.blockWidth
          : 1);
      block.block_info['height'] =
        block.block_info.rows *
          (this.layout.blockHeight
            ? this.layout.blockHeight
            : this.layout.layout_info.blockHeight
            ? this.layout.layout_info.blockHeight
            : 1) -
        block.block_info.rows * 40;
      block.block_info['header'] = 40;
      block['placeholderBlocks'] = Array(
        block.block_info.rows * block.block_info.cols
      );
      if (!block.block_info['blocks']) {
        block.block_info['blocks'] = [];
      }
    }
    if (
      Math.abs(this.moveObject.x1 - this.moveObject.x2) > 40 &&
      Math.abs(this.moveObject.y1 - this.moveObject.y2) > 40
    ) {
      this.layout.blocks.push(block);
      this.onCreate.emit({ layout: this.layout, block: block });
    }
  }

  deleteBlock(block) {
    let chkIndexArr = this.layout.blocks ? this.layout.blocks : [];

    let i = chkIndexArr.indexOf(block);
    if (i > -1) {
      chkIndexArr.splice(i, 1);
    }
    this.onDeleteBlock.emit({ layout: chkIndexArr, block: block });
    // });
    const param = {
      ad_id: this.appService.adId,
      page_id: block.page_id,
      mod_id: block.id
    };
    this.adsService.sendOuput('deleteMod', param).then(res => {});
  }

  selectColor(block, color) {
    block.block_info.txtColor = color;
  }

  selectBgColor(block, color) {
    block.block_info.tempBgColor = color;
  }
  onDragOver(e) {
    console.log(e, 'dragover');
  }
  saveBlockInfo(block, type) {
    this.submitted = true;
    if (!block.block_info.tempSequenceId && type == 'block') {
      // block.title = block.tempTitle;
      return;
    }

    event.stopPropagation();
    block.block_info['title'] = block.block_info.tempTitle;
    block.block_info['sequenceId'] = block.block_info.tempSequenceId;
    let seqId = parseInt(block.tempSequenceId);
    // let i = _.findIndex(<any>this.appService.currentBaseValues, {
    //   mod_order: seqId
    // });
    const param = {
      ad_id: this.appService.adId,
      page: this.layout.page_order
        ? this.layout.page_order
        : this.appService.currPageOrder,
      mod: block.block_info.tempSequenceId
        ? block.block_info.tempSequenceId
        : '',
      zone: this.appService.currZoneValue
    };
    if (type == 'block') {
      this.adsService.sendOuput('searchModPromo', param).then(res => {
        if (res.result.success) {
          if (res.result.data.length) {
            let currPromoData = res.result.data[0];
            block.promo_info = currPromoData;
            block.promotion_info = [];
            if (block.promotion_id && block.promotion_id.length) {
              block.promotion_id.push(currPromoData.id);
            } else {
              block.promotion_id = [currPromoData.id];
            }
            //  block.promo_info.price = currPromoData.net_retail;
            //  block.promo_info.price_fct = currPromoData.type;
            //  block.promo_info.headline = currPromoData.blowline;
            // block.promo_info.bodycopy = currPromoData.comb_overline;
            // block.promo_info.icons = currPromoData.image_01;

            this.onCreate.emit({ layout: this.layout, block: block });
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Promotion Details updated successfully.'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            // block.brand = currentMod.brand;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: 'Mod does not exists in Promotion.'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        }
      });
    } else {
      setTimeout(() => {
        this.onCreate.emit({ layout: this.layout, block: block });
      });
    }
    // block.price = currentMod.price;
    // block.price_fct = currentMod.price_fct;
    // block.headline = 'currentMod.headline';
    // block.bodycopy = 'currentMod.body_copy';
    // block.icons = 'currentMod.icon_path';

    //   // block.brand = currentMod.brand;

    // this.adsService
    //   .getAdModules([{ url: 'getPromotionView' }, param])
    //   .then(res => {
    //     const promoData = res.result.data.data;
    //     if (promoData.length && i > -1) {
    //       block.headline = promoData[0].headline;
    //       block.bodycopy = promoData[0].body_copy;
    //       block.brand = promoData[0].brand;
    //       this.appService.currentBaseValues[i].headline = promoData[0].headline;
    //       this.appService.currentBaseValues[i].body_copy =
    //         promoData[0].body_copy;
    //       this.appService.currentBaseValues[i].brand = promoData[0].brand;
    //     }
    //   });

    // let currentMod = i > -1 ? this.appService.currentBaseValues[i] : '';
    // if (i > -1) {
    //   block.price = currentMod.price;
    //   block.price_fct = currentMod.price_fct;
    //   // block.headline = currentMod.headline;
    //   // block.bodycopy = currentMod.body_copy;
    //   block.icons = currentMod.icon_path;
    //   // block.brand = currentMod.brand;
    // } else {
    //   block.price = '';
    //   block.price_fct = '';
    //   block.headline = '';
    //   block.bodycopy = '';
    //   block.icons = '';
    //   block.brand = '';
    // }
    block.block_info.bgColor =
      block.block_info.tempBgColor || this.backgroundColors[0];
    block.block_info.color =
      block.block_info.txtColor || this.backgroundColors[7];
    //     setTimeout(() => {
    // this.onCreate.emit({ layout: this.layout, block: block });
    //     })

    this.togglePopup(block);
  }

  onCreateBlock(data) {
    this.onCreate.emit({ layout: data.layout, block: data.layout });
  }

  deleteLayout(layout) {
    this.deleteBlock(layout.layout ? layout.layout : layout);
    this.onDeleteLayout.emit({ layout: this.layout });
  }
  openPromos(data) {
    return;
    let i = _.findIndex(<any>this.appService.currentBaseValues, {
      mod_order: parseInt(data.sequenceId, 10)
    });
    if (data.sequenceId) {
      this.dialogRef = this.dialog.open(PromtionsViewComponent, {
        panelClass: ['promotions-dialog', 'design-grid-dialog'],
        width: '900px',
        data: {
          title: 'promotions',
          params: {
            ad_id: this.appService.adId,
            filter: true,
            modNumber: data.sequenceId,
            pageNumber: this.appService.currentObj['pageNumber']
              ? this.appService.currentObj['pageNumber']
              : 1,
            promo_id:
              i > -1
                ? this.appService.currentBaseValues[i].promo_ids.split(',')
                : [],
            versions: this.appService.currentObj['versions']
          }
        }
      });
    }
  }
  private getEventPageCoordinates(event: any) {
    let pageCoordinates = this.layoutEl.getBoundingClientRect();

    return {
      x: this.getClientX(event) - pageCoordinates.x,
      y: this.getClientY(event) - pageCoordinates.y
    };
  }

  private getClientX(event: any): number {
    return (
      event.clientX ||
      (event.touches && event.touches[0] && event.touches[0].clientX)
    );
  }

  private getClientY(event: any): number {
    return (
      event.clientY ||
      (event.touches && event.touches[0] && event.touches[0].clientY)
    );
  }
}
