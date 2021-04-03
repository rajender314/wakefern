import { Component, OnInit } from '@angular/core';
import { AppService } from '@app/app.service';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { AdsService } from '@app/ads/ads.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-ad-promotions',
  templateUrl: './ad-promotions.component.html',
  styleUrls: ['./ad-promotions.component.scss']
})
export class AdPromotionsComponent implements OnInit {
  public editModInputData: any;
  public currentTabData: any;
  public promoSearchkey: any;
  public promoIdkey: any;
  public varietyStatemntsOptions = [];

  constructor(
    private appService: AppService,
    private adsService: AdsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Promotions');

    this.adsService.hideHeader = false;

    this.activatedRoute.queryParamMap.subscribe(params => {
      if (params['params'].search) {
        this.promoSearchkey = params['params'].search;
        this.promoIdkey = params['params'].id;
      }
    });
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'ADS'
      });
      if (i < 0) {
        // if users module not- allowed for user based on permissions
        this.router.navigateByUrl('access-denied');
        return;
      }

      if (this.appService.headerPermissions['VIEW_PROMOTIONS']) {
        this.currentTabData = this.appService.getListData(
          'Others',
          'PROMOTIONS'
        );
        this.router.navigateByUrl(
          'vehicles/' + this.appService.adId + '/' + this.currentTabData.url
        );

        this.editModInputData = {
          modData: 'detail',
          currMod: 'mod',
          pagesInfo: [],
          selectedPage: '',
          fromComp: 'promotions',
          search: this.promoSearchkey,
          promoId: this.promoIdkey
        };
      } else {
        this.router.navigateByUrl('access-denied');
      }
    } else {
      this.router.navigateByUrl('access-denied');
    }
  }
}
