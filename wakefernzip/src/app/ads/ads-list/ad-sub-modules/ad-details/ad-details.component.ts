import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { AppService } from '@app/app.service';
import { Router } from '@angular/router';
import { AdsService } from '@app/ads/ads.service';
import { MatDatepicker, MatSnackBar, MatDialog } from '@angular/material';
import * as moment from 'moment';
import { CampaignsService } from '@app/campaigns/campaigns.service';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { ConfirmDeleteComponent } from '@app/dialogs/confirm-delete/confirm-delete.component';
import { ErrorMessages } from '@app/shared/utility/error-messages';

import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from '@angular/animations';
import { AdPreviewComponent } from '@app/dialogs/ad-preview/ad-preview.component';
import { UsersService } from '@app/users/users.service';
import { CustomAttributesComponent } from '@app/dialogs/custom-attributes/custom-attributes.component';
import { Title } from '@angular/platform-browser';
import { AdSubModulesComponent } from '../ad-sub-modules.component';
import { CreateAdComponent } from '@app/dialogs/create-ad/create-ad.component';

const APP: any = window['APP'];

@Component({
  selector: 'app-ad-details',
  templateUrl: './ad-details.component.html',
  styleUrls: ['./ad-details.component.scss'],
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
export class AdDetailsComponent implements OnInit {
  public adDetailsForm: FormGroup;
  public subheadersList: any;
  public dialogRef: any;
  public fetchingData = true;
  public campaignData = [];
  public ErrorMessages: any;
  public channelTypes = [];
  public divisionsList = [];
  public updateDone = true;
  public formReady = false;
  public configData = {
    label: '',
    icon: ''
  };
  public errorMsg = '';
  public state = {
    section: [
      {
        name: 'vehicle',
        type: 'text',
        required: true,
        label: 'Ad Name',
        value: ''
      },
      {
        name: 'week_no',
        type: 'text',
        required: true,
        label: 'Week Number',
        value: ''
      },
      {
        name: 'campaign_id',
        type: 'select',
        required: '',
        label: 'Select Campaign',
        value: ''
      },
      {
        name: 'start_date',
        type: 'date',
        required: true,
        label: 'Ad Creation Date',
        value: ''
      },
      {
        name: 'first_proof_date',
        type: 'date',
        required: true,
        label: 'First Proof Date',
        value: ''
      },
      {
        name: 'second_proof_date',
        type: 'date',
        required: true,
        label: 'Second Proof Date',
        value: ''
      },
      {
        name: 'final_proof_date',
        type: 'date',
        required: true,
        label: 'Final Proof Date',
        value: ''
      },
      {
        name: 'break_date',
        type: 'date',
        required: true,
        label: 'Ad Break Date',
        value: ''
      },
      {
        name: 'end_date',
        type: 'date',
        required: true,
        label: 'Ad End Date',
        value: ''
      },
      {
        name: 'channel_id',
        type: 'select',
        required: true,
        label: 'Channel Type',
        value: ''
      },
      {
        name: 'ad_format',
        type: 'select',
        required: true,
        label: 'Ad Format',
        value: ''
      },
      {
        name: 'ad_creation_batch',
        type: 'select',
        required: true,
        label: 'Ad Creation Batch',
        value: ''
      },
      {
        name: 'divisions',
        type: 'select',
        required: true,
        label: 'Divisions',
        value: '',
        options: []
      },
      {
        name: 'theme',
        type: 'textarea',
        required: '',
        label: 'Theme',
        value: ''
      },
      {
        name: 'notes',
        type: 'textarea',
        required: '',
        label: 'Notes',
        value: ''
      }
    ]
  };
  public params = {
    search: '',
    pageSize: 20,
    id: '',
    pageNumber: 1
  };
  public minDate = {
    start_date: new Date(),
    end_date: '',
    break_date: moment(new Date()).add(1, 'days')['_d'],
    first_proof_date: moment(new Date()).subtract(1, 'days')['_d'],
    second_proof_date: moment(new Date()).subtract(1, 'days')['_d'],
    final_proof_date: moment(new Date()).subtract(1, 'days')['_d']
  };
  public maxDate = {
    start_date: '',
    end_date: '',
    break_date: '',
    first_proof_date: '',
    second_proof_date: '',
    final_proof_date: ''
  };
  public disableStatus = {
    start_date: false,
    end_date: false,
    break_date: false,
    first_proof_date: false,
    second_proof_date: true,
    final_proof_date: true,
    third_proof_date: false
  };
  public submitted = false;
  public formData;
  public marketsList;
  public footerView = false;
  public editAddPer;
  public delAddPer;
  public exportAddPer;
  public cancelAddPer;
  public lockAdPer;
  public duplicateAdPer;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    public adsService: AdsService,
    private campaignService: CampaignsService,
    private router: Router,
    private snackbar: MatSnackBar,
    private dailog: MatDialog,
    private userService: UsersService,
    private titleService: Title,
    public adsubmodule: AdSubModulesComponent
  ) {
    this.ErrorMessages = ErrorMessages;
  }
  public fieldslength: boolean;
  public lockname = 'Lock Ad';

  ngOnInit() {
    this.titleService.setTitle('Ad Details');

    if (this.adsService.editPermission) {
      this.lockname = 'Lock Ad';
    } else {
      this.lockname = 'UnLock Ad';
    }
    // console.log(this.adDetailsForm);
    this.adsService.hideHeader = false;
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'ADS'
      });

      if (i < 0) {
        // if users module not- allowed for user based on permissions
        this.router.navigateByUrl('access-denied');
      } else {
        if (!this.appService.headerPermissions['VIEW_AD_DETAILS']) {
          this.router.navigateByUrl('access-denied');
        } else {
          if (this.adsService.isImportProgess) {
            this.adsService.editPermission = false;
          } else {
            this.adsService.editPermission = this.appService.headerPermissions
              ? this.appService.headerPermissions['EDIT_ADS']
              : true;
          }

          this.delAddPer = this.appService.headerPermissions
            ? this.appService.headerPermissions['DELETE_ADS']
            : true;
          this.exportAddPer = this.appService.headerPermissions
            ? this.appService.headerPermissions['EXPORT_AD_DATA']
            : true;

          this.cancelAddPer = this.appService.headerPermissions
            ? this.appService.headerPermissions['CANCEL_ADS']
            : true;

          this.lockAdPer = this.appService.headerPermissions
            ? this.appService.headerPermissions['LOCK_OR_UNLOCK_ADS']
            : true;

          this.duplicateAdPer = this.appService.headerPermissions
            ? this.appService.headerPermissions['DUPLICATE_ADS']
            : true;

          // this.getChannels();
          // this.getCampaings();
          // this.getDivisons();
          // const currentTabData = this.appService.getListData(
          //   'Others',
          //   'AD_DETAILS'
          // );
          // this.getAdDetails(currentTabData);
          const currentTabData = this.appService.getListData(
            'Others',
            'AD_DETAILS'
          );
          const formData = this.appService.getListData('Top-Headers', 'ADS');
          this.appService.getFormDeatils(formData._id).then(res => {
            // console.log(res)
            this.state.section = res.result.data.specsInfo;
            this.createForm();
            this.getAdDetails(currentTabData);
          });
          this.router.navigateByUrl(
            'vehicles/' + this.appService.adId + '/' + currentTabData.url
          );
        }
      }
    } else {
      this.router.navigateByUrl('access-denied');
    }
  }
  getDivisons() {
    let app = JSON.parse(APP['loginDetails']);
    const userData = app.user_data;
    this.userService
      .getDivisions({ user_id: userData.id, status: 1 })
      .then(res => {
        this.divisionsList = res.result.data.data;
      });
  }
  createForm(): void {
    this.adDetailsForm = this.fb.group({
      adDetailsFormValues: this.fb.array([])
    });
    this.createControls();
    // console.log(this.adDetailsForm.value.adDetailsFormValues.length);
    this.fieldslength = this.adDetailsForm.value.adDetailsFormValues.length;
  }

  public get adDetailsFormValues() {
    return this.adDetailsForm.get('adDetailsFormValues') as FormArray;
  }
  createControls() {
    let i = 0;
    this.state.section.forEach(attr => {
      this.adDetailsFormValues.push(this.createFormGroup(attr, i));
      i++;
    });
    this.formReady = true;
  }
  // createFormGroup(attr) {
  //   if (attr.required) {
  //     if (attr.name === 'week_no') {
  //       return this.fb.group({
  //         [attr.name]: [attr.required]
  //           ? [
  //               '',
  //               Validators.compose([
  //                 Validators.required,
  //                 Validators.min(1),
  //                 Validators.max(52),
  //                 Validators.pattern('^[0-9]*$')
  //               ])
  //             ]
  //           : ''
  //       });
  //     } else {
  //       return this.fb.group({
  //         [attr.name]: [attr.required] ? ['', Validators.required] : ''
  //       });
  //     }
  //   } else {
  //     return this.fb.group({
  //       [attr.name]: ''
  //     });
  //   }
  // }
  createFormGroup(attr, idx) {
    if (attr.key === 'dropdown' || attr.key === 'multiple_choice') {
      if (attr.get_api) {
        this.appService
          .getDropdownOptions(attr.get_api, { status: [1, 2] })
          .then(res => {
            attr.options = res.result.data.data;
            this.state.section[idx].options = res.result.data.data;
          });
      }
    }

    if (attr.form_save_value.settings.mandatory) {
      if (attr.db_column_key === 'week_no') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? [
                '',
                Validators.compose([
                  Validators.required,
                  Validators.min(1),
                  Validators.max(53),
                  Validators.pattern('^[0-9]*$')
                ])
              ]
            : ''
        });
      } else {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? ['', Validators.required]
            : ['', Validators.required]
        });
      }
    } else {
      return this.fb.group({
        [attr.db_column_key]: ''
      });
    }
  }
  getAdDetails(list) {
    this.configData['label'] = list.value;
    this.configData['icon'] = list.iconClass;
    const levels = [];
    this.params.id = this.appService.adId;
    this.adsService
      .getAdModules([{ url: list.get_api }, this.params])
      .then(res => {
        // console.log(1111)
        this.formData = res.result.data;
        this.adsService.adStatus = this.formData.status.code;
        this.adsService.adlock = this.formData.lock;

        if (
          this.formData.status.code === 'Closed' ||
          this.formData.status.code === 'Published' ||
          this.formData.status.code === 'Archived' ||
          this.formData.status.code === 'Cancel' ||
          this.formData.lock == 1
        ) {
          this.adsService.editPermission = false;
        }
        this.appService.divisionIds = this.formData['zone_id'];
        this.marketsList = res.result.data.markets;
        // this.formData['start_date'] = moment(this.formData['start_date']);
        // this.formData['first_proof_date'] = moment(this.formData['first_proof_date']);
        // this.formData['second_proof_date'] = moment(this.formData['second_proof_date']);
        // this.formData['final_proof_date'] = moment(this.formData['final_proof_date']);
        // this.formData['break_date'] = moment(this.formData['break_date']);
        // this.formData['end_date'] = moment(this.formData['end_date']);

        this.formData['start_date'] = moment(
          this.formData['start_date']
        ).toISOString();

        // this.formData['first_proof_date'] = new Date(
        //   this.formData['first_proof_date']
        // );
        // this.formData['second_proof_date'] = new Date(
        //   this.formData['second_proof_date']
        // );
        // this.formData['final_proof_date'] = new Date(
        //   this.formData['final_proof_date']
        // );

        this.formData['first_proof_date'] = this.formData['first_proof_date']
          ? moment(this.formData['first_proof_date']).toISOString()
          : '';

        // console.log(this.formData);

        this.formData['second_proof_date'] = this.formData['second_proof_date']
          ? moment(this.formData['second_proof_date']).toISOString()
          : '';
        this.formData['final_proof_date'] = this.formData['final_proof_date']
          ? moment(this.formData['final_proof_date']).toISOString()
          : '';

        this.maxDate['first_proof_date'] = moment(
          this.formData['start_date']
        ).subtract(1, 'days')['_d'];
        this.maxDate['second_proof_date'] = moment(
          this.formData['start_date']
        ).subtract(1, 'days')['_d'];
        this.maxDate['final_proof_date'] = moment(
          this.formData['start_date']
        ).subtract(1, 'days')['_d'];

        if (this.formData['first_proof_date']) {
          this.disableStatus['second_proof_date'] = false;
          this.minDate['start_date'] = moment(
            this.formData['first_proof_date']
          ).add(1, 'days')['_d'];
          this.minDate['second_proof_date'] = moment(
            this.formData['first_proof_date']
          ).add(1, 'days')['_d'];
        }
        if (this.formData['second_proof_date']) {
          this.disableStatus['final_proof_date'] = false;
          this.minDate['start_date'] = moment(
            this.formData['second_proof_date']
          ).add(1, 'days')['_d'];
          this.minDate['final_proof_date'] = moment(
            this.formData['second_proof_date']
          ).add(1, 'days')['_d'];
          this.maxDate['first_proof_date'] = moment(
            this.formData['second_proof_date']
          ).subtract(1, 'days')['_d'];
        }
        if (this.formData['final_proof_date']) {
          this.minDate['start_date'] = moment(
            this.formData['final_proof_date']
          ).add(1, 'days')['_d'];
          this.maxDate['second_proof_date'] = moment(
            this.formData['final_proof_date']
          ).subtract(1, 'days')['_d'];
        }
        // this.formData['third_proof_date'] = this.formData['third_proof_date']
        //   ? moment(this.formData['third_proof_date']).toISOString()
        //   : '';
        // this.formData['break_date'] = new Date(this.formData['break_date']);
        this.formData['end_date'] = moment(
          this.formData['end_date']
        ).toISOString();

        // console.log(this.formData);
        for (let i = 0; i < 20; i++) {
          levels.push(this.formData);
        }
        this.adDetailsForm.patchValue({
          adDetailsFormValues: levels
        });
        this.footerView = false;

        // this.minDate['start_date'] = moment(this.formData['start_date']).add(
        //   0,
        //   'days'
        // )['_d'];
        // this.minDate['second_proof_date'] = moment(this.formData['first_proof_date']).add(
        //   1,
        //   'days'
        // )['_d'];
        //  this.minDate['final_proof_date'] = moment(this.formData['second_proof_date']).add(
        //   1,
        //   'days'
        // )['_d'];

        // this.minDate['break_date'] = moment(
        //   this.formData['final_proof_date']
        // ).add(1, 'days')['_d'];

        // this.maxDate['first_proof_date'] = moment(
        //   this.formData['second_proof_date']
        // ).subtract(1, 'days')['_d'];

        // this.maxDate['second_proof_date'] = moment(
        //   this.formData['final_proof_date']
        // ).subtract(1, 'days')['_d'];

        // this.maxDate['final_proof_date'] = moment(
        //   this.formData['start_date']
        // ).subtract(1, 'days')['_d'];

        // console.log(this.formData['first_proof_date'])
        if (
          this.formData['first_proof_date'] != '' &&
          this.formData['second_proof_date'] == ''
        ) {
          this.minDate['start_date'] = moment(
            this.formData['first_proof_date']
          ).add(1, 'days')['_d'];
        } else if (
          this.formData['second_proof_date'] != '' &&
          this.formData['final_proof_date'] == ''
        ) {
          this.minDate['start_date'] = moment(
            this.formData['second_proof_date']
          ).add(1, 'days')['_d'];
        } else if (this.formData['final_proof_date'] != '') {
          this.minDate['start_date'] = moment(
            this.formData['final_proof_date']
          ).add(1, 'days')['_d'];
        } else {
          this.minDate['start_date'] = new Date();
        }

        this.minDate['end_date'] = moment(this.formData['start_date']).add(
          1,
          'days'
        )['_d'];

        // this.minDate['final_proof_date'] = moment(
        //   this.formData['start_date']
        // ).add(1, 'days')['_d'];
        // this.minDate['second_proof_date'] = moment(
        //   this.formData['first_proof_date']
        // ).add(1, 'days')['_d'];
        // this.minDate['final_proof_date'] = moment(
        //   this.formData['second_proof_date']
        // ).add(1, 'days')['_d'];

        this.maxDate['start_date'] = moment(this.formData['end_date']).subtract(
          1,
          'days'
        )['_d'];
        // this.maxDate['break_date'] = moment(this.formData['end_date']).subtract(
        //   1,
        //   'days'
        // )['_d'];
        // this.maxDate['first_proof_date'] = moment(
        //   this.formData['first_proof_date']
        // ).subtract(1, 'days')['_d'];

        // this.maxDate['second_proof_date'] = moment(
        //   this.formData['first_proof_date']
        // ).subtract(1, 'days')['_d'];
        // this.maxDate['final_proof_date'] = moment(
        //   this.formData['second_proof_date']
        // ).subtract(1, 'days')['_d'];
        // this.minDate['end_date'] = moment(this.formData['break_date']).add(
        //   1,
        //   'days'
        // )['_d'];
        // this.fetchingData = false;
      });
    this.checkIsCurrDates();
    // this.fetchingData = false;
  }
  checkIsCurrDates() {
    // debugger;
    if (
      moment(this.minDate['first_proof_date']).diff(
        moment(new Date()),
        'days'
      ) <= 0
    ) {
      this.minDate['first_proof_date'] = moment(new Date()).add(0, 'days')[
        '_d'
      ];
    }
    if (
      moment(this.minDate['second_proof_date']).diff(
        moment(new Date()),
        'days'
      ) <= 0
    ) {
      this.minDate['second_proof_date'] = moment(new Date()).add(1, 'days')[
        '_d'
      ];
    }
    if (
      moment(this.minDate['final_proof_date']).diff(
        moment(new Date()),
        'days'
      ) <= 0
    ) {
      this.minDate['final_proof_date'] = moment(new Date()).add(0, 'days')[
        '_d'
      ];
    }
    if (
      moment(this.minDate['start_date']).diff(moment(new Date()), 'days') <= 0
    ) {
      this.minDate['start_date'] = moment(new Date()).add(0, 'days')['_d'];
    }
    if (
      moment(this.minDate['end_date']).diff(moment(new Date()), 'days') <= 0
    ) {
      this.minDate['end_date'] = moment(new Date()).add(0, 'days')['_d'];
    }

    this.fetchingData = false;
  }
  getChannels() {
    this.adsService.getChannels({ status: [1] }).then(res => {
      this.channelTypes = res.result.data.data;
    });
  }
  getCampaings() {
    this.campaignService.getCampaigns({ status: [1] }).then(res => {
      this.campaignData = res.result.data.data;
      this.campaignData.unshift({
        end_date: '2018-10-27',
        id: '',
        marketing_goal: '',
        name: 'Select',
        start_date: '2018-09-18',
        status: 1
      });
    });
  }
  dateValueChange(field, event) {
    // console.log(event);
    this.footerView = true;
    const formArray = this.adDetailsForm.get(
      'adDetailsFormValues'
    ) as FormArray;
    let valJson = {};
    formArray.value.map(attr => {
      Object.assign(valJson, attr);
    });
    // console.log(valJson);
    if (field.db_column_key === 'start_date') {
      this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
      this.disableStatus['end_date'] = false;
      if (!valJson['second_proof_date']) {
        this.maxDate['first_proof_date'] = moment(event.value).subtract(
          1,
          'days'
        )['_d'];
      }
      if (!valJson['final_proof_date']) {
        this.maxDate['second_proof_date'] = moment(event.value).subtract(
          1,
          'days'
        )['_d'];
      }
      this.maxDate['final_proof_date'] = moment(event.value).subtract(
        1,
        'days'
      )['_d'];
    } else if (field.db_column_key === 'end_date') {
      this.maxDate['break_date'] = moment(event.value).subtract(1, 'days')[
        '_d'
      ];
      this.maxDate['start_date'] = moment(event.value).subtract(1, 'days')[
        '_d'
      ];
    } else if (field.db_column_key === 'break_date') {
      // this.maxDate['start_date'] = moment(event.value).subtract(1, 'days')['_d'];
      // this.minDate['first_proof'] = moment(event.value).add(1, 'days')['_d'];
      // this.minDate['second_proof'] = moment(event.value).add(1, 'days')['_d'];
      this.minDate['end_date'] = moment(event.value).add(1, 'days')['_d'];
      this.maxDate['final_proof_date'] = moment(event.value).subtract(
        1,
        'days'
      )['_d'];
      // this.disableStatus['first_proof'] = false;
      this.disableStatus['second_proof_date'] = false;
    } else if (field.db_column_key === 'first_proof_date') {
      if (!valJson['second_proof_date'] && !valJson['final_proof_date']) {
        this.minDate['start_date'] = moment(event.value).add(1, 'days')['_d'];
      }
      this.minDate['second_proof_date'] = moment(event.value).add(1, 'days')[
        '_d'
      ];
      this.disableStatus['second_proof_date'] = false;
    } else if (field.db_column_key === 'second_proof_date') {
      if (!valJson['final_proof_date']) {
        this.minDate['start_date'] = moment(event.value).add(1, 'days')['_d'];
      }
      this.minDate['final_proof_date'] = moment(event.value).add(1, 'days')[
        '_d'
      ];
      this.maxDate['first_proof_date'] = moment(event.value).subtract(
        1,
        'days'
      )['_d'];
      this.disableStatus['final_proof_date'] = false;
    } else if (field.db_column_key === 'final_proof_date') {
      this.minDate['start_date'] = moment(event.value).add(1, 'days')['_d'];
      this.minDate['break_date'] = moment(event.value).add(1, 'days')['_d'];
      this.maxDate['second_proof_date'] = moment(event.value).subtract(
        1,
        'days'
      )['_d'];

      this.minDate['start_date'] = moment(event.value).add(1, 'days')['_d'];
    }
  }
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  onUpdate(event) {
    this.marketsList = event;
  }
  cancel() {
    const levels = [];

    this.appService.divisionIds = this.formData['zone_id'];

    // this.formData['start_date'] = moment(this.formData['start_date']);
    // this.formData['first_proof_date'] = moment(this.formData['first_proof_date']);
    // this.formData['second_proof_date'] = moment(this.formData['second_proof_date']);
    // this.formData['final_proof_date'] = moment(this.formData['final_proof_date']);
    // this.formData['break_date'] = moment(this.formData['break_date']);
    // this.formData['end_date'] = moment(this.formData['end_date']);
    this.formData['start_date'] = moment(
      this.formData['start_date']
    ).toISOString();

    // this.formData['first_proof_date'] = new Date(
    //   this.formData['first_proof_date']
    // );
    // this.formData['second_proof_date'] = new Date(
    //   this.formData['second_proof_date']
    // );
    // this.formData['final_proof_date'] = new Date(
    //   this.formData['final_proof_date']
    // );

    this.formData['first_proof_date'] = this.formData['first_proof_date']
      ? moment(this.formData['first_proof_date']).toISOString()
      : '';

    this.formData['second_proof_date'] = this.formData['second_proof_date']
      ? moment(this.formData['second_proof_date']).toISOString()
      : '';
    this.formData['final_proof_date'] = this.formData['final_proof_date']
      ? moment(this.formData['final_proof_date']).toISOString()
      : '';

    this.maxDate['first_proof_date'] = moment(
      this.formData['start_date']
    ).subtract(1, 'days')['_d'];
    this.maxDate['second_proof_date'] = moment(
      this.formData['start_date']
    ).subtract(1, 'days')['_d'];
    this.maxDate['final_proof_date'] = moment(
      this.formData['start_date']
    ).subtract(1, 'days')['_d'];

    if (this.formData['first_proof_date']) {
      this.disableStatus['second_proof_date'] = false;
      this.minDate['start_date'] = moment(
        this.formData['first_proof_date']
      ).add(0, 'days')['_d'];
      this.minDate['second_proof_date'] = moment(
        this.formData['first_proof_date']
      ).add(1, 'days')['_d'];
    }
    if (this.formData['second_proof_date']) {
      this.disableStatus['final_proof_date'] = false;
      this.minDate['start_date'] = moment(
        this.formData['second_proof_date']
      ).add(0, 'days')['_d'];
      this.minDate['final_proof_date'] = moment(
        this.formData['second_proof_date']
      ).add(0, 'days')['_d'];
      this.maxDate['first_proof_date'] = moment(
        this.formData['second_proof_date']
      ).subtract(1, 'days')['_d'];
    }
    if (this.formData['final_proof_date']) {
      this.minDate['start_date'] = moment(
        this.formData['final_proof_date']
      ).add(0, 'days')['_d'];
      this.maxDate['second_proof_date'] = moment(
        this.formData['final_proof_date']
      ).subtract(1, 'days')['_d'];
    }
    // this.formData['third_proof_date'] = this.formData['third_proof_date']
    //   ? moment(this.formData['third_proof_date']).toISOString()
    //   : '';
    // this.formData['break_date'] = new Date(this.formData['break_date']);
    this.formData['end_date'] = moment(this.formData['end_date']).toISOString();

    for (let i = 0; i < 20; i++) {
      levels.push(this.formData);
    }
    this.adDetailsForm.patchValue({
      adDetailsFormValues: levels
    });
    this.checkIsCurrDates();
    this.footerView = false;
    this.errorMsg = '';
  }
  allowNumber(event: any) {
    const pattern = /^-?[0-9]+(\.[0-9]*){0,1}$/g;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  valChanged() {
    let dummyJson = {};
    this.adDetailsForm.value.adDetailsFormValues.map(attr => {
      Object.assign(dummyJson, attr);
    });
    this.appService.divisionIds = dummyJson['zone_id'];
    this.footerView = true;
  }

  public allowUpdate = false;
  update(form) {
    // console.log(form)
    this.submitted = true;
    const dummyJson = {};
    form.value.adDetailsFormValues.map(attr => {
      // if( attr.hasOwnProperty('start_date')) {
      //   attr.start_date = moment(attr.start_date).format('MM-DD-YYYY')
      // }
      // if( attr.hasOwnProperty('end_date')) {
      //   attr.end_date = moment(attr.end_date).format('MM-DD-YYYY')

      // }
      // if( attr.hasOwnProperty('first_proof_date')) {
      //   attr.first_proof_date = moment(attr.first_proof_date).format('MM-DD-YYYY')

      // }
      // if( attr.hasOwnProperty('second_proof_date')) {
      //   attr.second_proof_date = moment(attr.second_proof_date).format('MM-DD-YYYY')

      // }
      // if( attr.hasOwnProperty('final_proof_date')) {
      //   attr.final_proof_date = moment(attr.final_proof_date).format('MM-DD-YYYY')
      // }

      Object.assign(dummyJson, attr);
    });

    // console.log(dummyJson)
    // console.log(form.value.adDetailsFormValues)

    if (dummyJson['start_date'] != '') {
      dummyJson['start_date'] = moment(dummyJson['start_date']).format(
        'YYYY-MM-DD'
      );
    }
    if (dummyJson['end_date'] != '') {
      dummyJson['end_date'] = moment(dummyJson['end_date']).format(
        'YYYY-MM-DD'
      );
    }

    // console.log(dummyJson['first_proof_date'])

    if (dummyJson['first_proof_date'] != '') {
      dummyJson['first_proof_date'] = moment(
        dummyJson['first_proof_date']
      ).format('YYYY-MM-DD');
    }
    if (dummyJson['second_proof_date'] != '') {
      dummyJson['second_proof_date'] = moment(
        dummyJson['second_proof_date']
      ).format('YYYY-MM-DD');
    }
    if (dummyJson['final_proof_date']) {
      dummyJson['final_proof_date'] = moment(
        dummyJson['final_proof_date']
      ).format('YYYY-MM-DD');
    }

    // console.log(  dummyJson["final_proof_date"])
    // console.log(form.value.adDetailsFormValues);
    let a, b, c, d, e, f;

    a = form.value.adDetailsFormValues[0].vehicle;
    b = form.value.adDetailsFormValues[1].week_no;
    c = form.value.adDetailsFormValues[5].zone_id;

    d = form.value.adDetailsFormValues[2].channel_id;
    e = form.value.adDetailsFormValues[3].vehicle_type;
    f = form.value.adDetailsFormValues[4].ad_format;

    if (
      a == '' ||
      b == '' ||
      c.length == 0 ||
      d == null ||
      e == null ||
      f == null
    ) {
      this.allowUpdate = false;
    } else {
      this.allowUpdate = true;
    }

    if (this.allowUpdate) {
      this.state.section.forEach(attr => {
        if (attr.type === 'Date') {
          // dummyJson[attr.name] = moment(dummyJson[attr.name]).format(
          //   'YYYY-MM-DD'
          // );
        }
      });
      if (dummyJson['zone_id'] != this.formData['zone_id']) {
        let dialogRef = this.dailog.open(ConfirmDeleteComponent, {
          panelClass: ['confirm-delete', 'overlay-dialog'],
          width: '500px',
          data: {
            rowData: {},
            selectedRow: { ad_id: this.appService.adId },
            mode: 'Update-Zones'
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result.from == 'confirm') {
            this.adsService
              .createAds(
                Object.assign(
                  {},
                  { id: this.appService.adId, is_divisions_changed: true },
                  dummyJson
                )
              )
              .then(res => {
                if (res.result.success) {
                  this.appService.adDetails = res.result.data;
                  // console.log(3333)
                  if (
                    this.appService.adDetails['status'].code === 'Closed' ||
                    this.appService.adDetails['status'].code === 'Published' ||
                    this.appService.adDetails['status'].code === 'Archived' ||
                    this.appService.adDetails['status'].code === 'Cancel' ||
                    this.appService.adDetails['lock'] == 1
                  ) {
                    this.adsService.editPermission = false;
                  }

                  this.formData = dummyJson;
                  this.updateDone = false;
                  setTimeout(() => {
                    this.updateDone = true;
                  });
                  this.snackbar.openFromComponent(SnackbarComponent, {
                    data: {
                      status: 'success',
                      msg: ' Ad Details Updated Successfully!'
                    },
                    verticalPosition: 'top',
                    horizontalPosition: 'right'
                  });
                  this.errorMsg = '';
                  this.footerView = false;
                  let prm = {
                    get_api: 'adsDetails'
                  };

                  this.adsubmodule.selectedList(prm);
                } else {
                  this.errorMsg = res.result.data;
                }
              });
          } else {
            dummyJson['zone_id'] = this.formData['zone_id'];
            let levels = [];
            for (let i = 0; i < 20; i++) {
              levels.push(dummyJson);
            }
            this.adDetailsForm.patchValue({
              adDetailsFormValues: levels
            });
            this.adDetailsForm.patchValue({
              adDetailsFormValues: levels
            });
          }
        });

        return;
      } else {
        this.adsService
          .createAds(
            Object.assign(
              {},
              { id: this.appService.adId, is_divisions_changed: false },
              dummyJson
            )
          )
          .then(res => {
            // console.log(22222)
            if (res.result.success) {
              this.appService.adDetails = res.result.data;

              // this.adsService.adStatus = this.formData.status.code;

              if (
                this.appService.adDetails['status'].code === 'Closed' ||
                this.appService.adDetails['status'].code === 'Published' ||
                this.appService.adDetails['status'].code === 'Archived' ||
                this.appService.adDetails['status'].code === 'Cancel' ||
                this.appService.adDetails['lock'] == 1
              ) {
                this.adsService.editPermission = false;
              }
              this.formData = dummyJson;
              this.updateDone = false;
              setTimeout(() => {
                this.updateDone = true;
              });
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: ' Ad Details Updated Successfully!'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              this.errorMsg = '';
              this.footerView = false;
              let prm = {
                get_api: 'adsDetails'
              };

              this.adsubmodule.selectedList(prm);
            } else {
              this.errorMsg = res.result.data;
            }
          });
      }

      let prm = {
        get_api: 'adsDetails'
      };

      this.adsubmodule.selectedList(prm);

      // const currentTabData = this.appService.getListData(
      //   'Others',
      //   'AD_DETAILS'
      // );
      // this.getAdDetails(currentTabData);

      // this.params.id = this.appService.adId;
      // this.adsService
      // .getAdModules([{ url: 'adsDetails' }, this.params])
      // .then(res => {

      //   this.formData = res.result.data;
      //   this.adsService.adStatus = this.formData.status.code;
      //   if (
      //     this.formData.status.code === 'Closed' ||
      //     this.formData.status.code === 'Published'
      //   ) {
      //     this.adsService.editPermission = false;
      //   }
      // })
      // this.params.id = this.appService.adId;
      // this.adsService
      //   .getAdModules([{ url: 'adsDetails' }, this.params])
      //   .then(res => {
      //     console.log(res)
      //   })
    }
  }
  showPopup(param) {
    // console.log(param);
    if (param == 'duplicate_ad') {
      this.dialogRef = this.dailog.open(CreateAdComponent, {
        panelClass: ['ads-dialog', 'overlay-dialog'],
        width: '800px',
        data: {
          from: 'duplicate_ad',
          label: 'Duplicate Ad'
        }
      });
      this.dialogRef.afterClosed().subscribe(result => {
        // console.log(result)
        if (result && result.data.result.success) {
          const currentTabData = this.appService.getListData(
            'Others',
            'AD_DETAILS'
          );

          this.adsService.editPermission = true;

          this.getAdDetails(currentTabData);

          let prm = {
            get_api: 'adsDetails'
          };

          this.adsubmodule.selectedList(prm);

          this.router.navigateByUrl(
            'vehicles/' + this.appService.adId + '/' + currentTabData.url
          );
        }
      });
      return;
    }
    let mode = param;
    const rowData = {
      delete_api:
        mode === 'exported'
          ? 'exportAd'
          : mode === 'versionexport'
          ? 'exportAdVersion'
          : mode === 'cancel'
          ? 'cancelAds'
          : mode === 'lockad'
          ? 'lockAd'
          : 'deleteAds',
      label: 'Ad'
    };
    mode = mode === 'versionexport' ? 'exported' : mode;
    const dialogRef = this.dailog.open(ConfirmDeleteComponent, {
      panelClass: ['confirm-delete', 'overlay-dialog'],
      width: '500px',
      data: {
        rowData: rowData,
        selectedRow: {
          ad_id: this.appService.adId,
          lockStatus: this.adsService.adlock
        },

        mode:
          mode === 'exported'
            ? 'export'
            : mode === 'cancel'
            ? 'cancel'
            : mode === 'lockad'
            ? 'lockad'
            : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
      if (result && result.success) {
        if (mode == 'cancel') {
          // console.log(result)
          this.adsService.editPermission = false;

          let prm = {
            get_api: 'adsDetails'
          };

          this.adsubmodule.selectedList(prm);

          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Ad Cancelled Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          return;
        }

        if (result.data.status) {
          // console.log(2525)
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg:
                'Ad ' +
                (mode === 'exported' ? 'Exported' : 'Deleted') +
                ' Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          mode === 'exported'
            ? window.open(result.data.data, '_self')
            : this.router.navigateByUrl('/vehicles');
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: result.data.data
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      } else if (mode == 'lockad') {
        // console.log(result)
        if (result == 2) {
          this.adsService.editPermission = true;
          this.lockname = 'Lock Ad';

          let prm = {
            get_api: 'adsDetails'
          };

          this.adsubmodule.selectedList(prm);

          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Ad UnLocked Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          return;
        } else if (result == 1) {
          this.adsService.editPermission = false;
          this.lockname = 'UnLock Ad';

          let prm = {
            get_api: 'adsDetails'
          };

          this.adsubmodule.selectedList(prm);

          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Ad Locked Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          return;
        }
      } else {
        if (result.from !== 'close') {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: 'Problem occured while Exporting'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      }
    });
  }
  adPreview() {
    this.dialogRef = this.dailog.open(AdPreviewComponent, {
      panelClass: 'editform-dialog',
      width: '600px',
      data: {
        ad_id: this.appService.adId,
        url: 'exportPreview',
        from: 'adDetails'
      }
    });
  }

  customAttributes() {
    this.dialogRef = this.dailog.open(CustomAttributesComponent, {
      panelClass: 'custom-attributes-dialog',
      width: '800px',
      data: {
        from: 'adDetails'
      }
    });
  }
}
