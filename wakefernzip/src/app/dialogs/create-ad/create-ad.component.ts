import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDatepicker
} from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import { AppService } from '@app/app.service';
import { Router } from '@angular/router';
import { CampaignsService } from '@app/campaigns/campaigns.service';
import * as moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { UsersService } from '@app/users/users.service';
import { CustomValidation } from '@app/shared/utility/custom-validations';
const APP: any = window['APP'];

export interface User {
  name: string;
}
@Component({
  selector: 'app-create-ad',
  templateUrl: './create-ad.component.html',
  styleUrls: ['./create-ad.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateAdComponent implements OnInit {
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
        name: 'start_date',
        type: 'date',
        required: true,
        label: 'Ad Creation Date',
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
  public campaignData = [];
  public channelTypes = [];
  public divisionsList = [];
  public selectedDiv = [];
  public allDivIds = [];
  public errorMsg = '';
  public creatingAd = false;
  public formReady = false;
  public submitted: boolean;
  public selectedzones = [];

  public minDate = {
    start_date: new Date(),
    end_date: '',
    break_date: moment(new Date()).add(1, 'days')['_d'],
    first_proof_date: new Date(),
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
    end_date: true,
    break_date: true,
    first_proof_date: false,
    second_proof_date: true,
    final_proof_date: true
  };
  public chkSelectedCampaign = [];
  public isChecked = false;
  public loadingMsg = 'Creating Ad, please wait...';
  public creatingAdloader = true;
  filteredOptions: Observable<User[]>;
  options = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
  createAdForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<CreateAdComponent>,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private adsService: AdsService,
    private appService: AppService,
    private router: Router,
    private campaignService: CampaignsService,
    private userService: UsersService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    dialogRef.disableClose = true;
  }
  ngOnInit() {
    console.log(this.data);
    this.formReady = false;
    const formData = this.appService.getListData('Top-Headers', 'ADS');
    this.appService.getFormDeatils(formData._id).then(res => {
      this.state.section = res.result.data.specsInfo;

      this.createForm();
    });

    // this.getDivisions();
    // this.getChannels();
    // this.getCampaings();
  }

  displayFn(user?: User): string | undefined {
    const i = _.findIndex(<any>this.chkSelectedCampaign, { id: user });
    return i > -1 ? this.chkSelectedCampaign[i].name : undefined;
  }
  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.campaignData.filter(
      option => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }
  createForm(): void {
    this.createAdForm = this.fb.group({
      adDetailsFormValues: this.fb.array([])
      // vehicle: ['', Validators.required],
      // week_no: [
      //   moment(new Date()).week(),
      //   Validators.compose([
      //     Validators.required,
      //     Validators.min(1),
      //     Validators.max(52),
      //     Validators.pattern('^[0-9]*$')
      //   ])
      // ],
      // start_date: [new Date(), Validators.required],
      // break_date: ['', Validators.required],
      // end_date: [null, Validators.required],
      // first_proof_date: [null, Validators.required],
      // second_proof_date: ['', Validators.required],
      // final_proof_date: ['', Validators.required],
      // campaign_id: '',
      // theme: '',
      // notes: '',
      // channel_id: ['', Validators.required],
      // divisions: [, Validators.required],
      // ad_format: ['', Validators.required],
      // ad_creation_batch: ['', Validators.required]
    });
    this.createControls();
  }
  public get adDetailsFormValues() {
    return this.createAdForm.get('adDetailsFormValues') as FormArray;
  }
  createControls() {
    let i = 0;
    this.state.section.forEach(attr => {
      this.adDetailsFormValues.push(this.createFormGroup(attr, i));
      i++;
    });
    this.formReady = true;

    this.adDetailsFormValues.controls.map(row => {
      if (row['controls']['channel_id'] != undefined) {
        row.patchValue({ channel_id: '5a6eeb00b908ce7072f84e7e' });
      }
    });
  }
  public zoneOptions = [];
  createFormGroup(attr, idx) {
    if (attr.key === 'dropdown' || attr.key === 'multiple_choice') {
      if (attr.get_api) {
        this.appService
          .getDropdownOptions(attr.get_api, { status: [1] })
          .then(res => {
            attr.options = res.result.data.data;
            // console.log(attr)

            this.state.section[idx].options = res.result.data.data;

            if (attr.db_column_key === 'zone_id') {
              if (attr.options.length) {
                attr.options.unshift({ id: 'select_all', name: 'Select All' });
              }

              this.zoneOptions = attr.options;
            }
            if (attr.db_column_key == 'divisions') {
              res.result.data.data.map(div => {
                this.allDivIds.push(div.id);
                if (div.checked) {
                  this.selectedDiv.push(div.id);
                }
              });
              this.createAdForm.patchValue({
                divisions: this.selectedDiv
              });
            }

            if (attr.db_column_key == 'channel_id') {
              res.result.data.data.map(div => {
                if (div.name == 'Print') {
                  // console.log(attr.db_column_key);
                  // console.log(div.id);
                }
              });
            }
          });
      }
    }
    if (attr.form_save_value.settings.mandatory) {
      if (attr.db_column_key === 'week_no') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? [
                moment(new Date()).week(),
                Validators.compose([
                  Validators.required,
                  Validators.min(1),
                  Validators.max(53),
                  Validators.pattern('^[0-9]*$')
                ])
              ]
            : moment(new Date()).week()
        });
      } else if (attr.db_column_key === 'start_date') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? ['', Validators.compose([Validators.required])]
            : ''
        });
      } else if (attr.key === 'channel_id') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? ['', Validators.required]
            : ''
        });
      } else if (attr.key === 'date_range') {
        return this.fb.group({
          [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
            ? ['', Validators.required]
            : ''
        });
      } else {
        if (attr.key === 'single_line_text') {
          return this.fb.group({
            [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
              ? [
                  '',
                  Validators.compose([
                    Validators.required,
                    CustomValidation.noWhitespaceValidator
                  ])
                ]
              : ''
          });
        } else {
          return this.fb.group({
            [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
              ? ['', Validators.required]
              : ''
          });
        }
      }
    } else {
      return this.fb.group({
        [attr.db_column_key]: ''
      });
    }
  }

  onChekChange(event) {
    console.log(event.srcElement.checked);

    this.isChecked = event.srcElement.checked;
  }

  allowNumber(event: any) {
    // const pattern = /^[0-9-]*$/;
    const pattern = /^-?[0-9]+(\.[0-9]*){0,1}$/g;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  valChanged(key, event) {
    if (key == 'zone_id') {
      if (this.selectedzones.indexOf('select_all') > -1) {
        this.zoneOptions.shift();

        let arr = [];
        this.zoneOptions.forEach((ele, index) => {
          this.selectedzones.push(ele.id);
          arr.push(ele.id);
        });
        // this.zonesarr = arr;
      }

      if (!this.selectedzones.length) {
        if (this.zoneOptions[0].id != 'select_all') {
          this.zoneOptions.unshift({ id: 'select_all', name: 'Select All' });
        }
      } else {
      }
    }
    const formArray = this.createAdForm.get('adDetailsFormValues') as FormArray;
    let valArray = formArray.value;
  }

  dateValueChange(field, event, form) {
    const formArray = this.createAdForm.get('adDetailsFormValues') as FormArray;
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
  setRange(data) {}
  openCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  createAdd(form) {
    const dummyJson = {};
    this.errorMsg = '';
    form.value.adDetailsFormValues.map(attr => {
      Object.assign(dummyJson, attr);
    });
    if (this.data.from == 'duplicate_ad') {
      if (this.isChecked) {
        dummyJson['isLayout'] = 1;
      } else {
        dummyJson['isLayout'] = 0;
      }
      dummyJson['id'] = this.appService.adId;
    } else {
      dummyJson['isLayout'] = null;
    }

    // console.log(this.appService.adId);
    if (form.valid) {
      this.creatingAd = true;
      this.state.section.forEach(attr => {
        // console.log(attr);
        // if (attr.type === 'date') {
        //   form.value[attr.name] = moment(form.value[attr.name]).format(
        //     'YYYY-MM-DD'
        //   );
        // }
        if (attr['key'] === 'date' && dummyJson[attr['db_column_key']]) {
          dummyJson[attr['db_column_key']] = moment(
            dummyJson[attr['db_column_key']]
          ).format('YYYY-MM-DD');
        }
      });
      this.adsService
        .createAds(
          Object.assign(
            {},
            {
              id: ''
            },
            dummyJson
          )
        )
        .then(res => {
          // console.log(this.data.from, dummyJson['isLayout']);
          if (this.data.from != 'duplicate_ad' && res.result.success) {
            this.loadingMsg = 'Creating Ad, please wait...';
            this.appService.adId = res.result.data.id;
            this.appService.adName = res.result.data.vehicle;
            setTimeout(() => {
              this.loadingMsg = 'Ad Created Successfully';
              this.creatingAdloader = false;
            }, 1500);
            setTimeout(() => {
              this.creatingAd = false;
              this.dialogRef.close({
                data: res
              });
              this.router.navigateByUrl(
                'vehicles/' + this.appService.adId + '/ad-details'
              );
            }, 2000);
          } else if (this.data.from == 'duplicate_ad' && res.result.success) {
            // console.log(res)
            this.loadingMsg = 'Duplicating Ad, please wait...';
            this.appService.adId = res.result.data.id;
            // this.router.navigateByUrl(
            //   'vehicles/' + this.appService.adId + '/ad-details'
            // );
            this.appService.adName = res.result.data.vehicle;
            setTimeout(() => {
              this.loadingMsg = 'Ad Duplicated Successfully';
              this.creatingAdloader = false;
            }, 1500);
            setTimeout(() => {
              this.creatingAd = false;
              this.dialogRef.close({
                data: res
              });
              // this.router.navigateByUrl(
              //   'vehicles/' + this.appService.adId + '/ad-details'
              // );
            }, 2000);
          } else {
            this.creatingAd = false;
            this.errorMsg = res.result.data;
          }
        });
    } else {
      this.submitted = true;
    }
  }
  getChannels() {
    this.adsService
      .getChannels({
        status: [1]
      })
      .then(res => {
        this.channelTypes = res.result.data.data;
      });
  }

  getDivisions() {
    let app = JSON.parse(APP['loginDetails']);
    const userData = app.user_data;
    this.userService
      .getDivisions({ user_id: userData.id, status: 1 })
      .then(res => {
        // let selArr = [{ id: 1, divname: 'Select All' }];
        this.divisionsList = res.result.data.data;
        // this.divisionsList.push();

        this.divisionsList.map(div => {
          this.allDivIds.push(div.id);
          if (div.checked) {
            this.selectedDiv.push(div.id);
          }
        });
        if (this.divisionsList.length) {
          // this.divisionsList = selArr.concat(this.divisionsList);
        }
        this.createAdForm.patchValue({
          divisions: this.selectedDiv
        });
      });
  }
  getCampaings() {
    this.campaignService
      .getCampaigns({
        status: [1]
      })
      .then(res => {
        this.campaignData = res.result.data.data;
        this.campaignData.unshift({
          end_date: '2018-10-27',
          id: '',
          marketing_goal: '',
          name: 'Select',
          start_date: '2018-09-18',
          status: 1
        });
        this.chkSelectedCampaign = res.result.data.data;
      });
    this.filteredOptions = this.createAdForm
      .get('campaign_id')
      .valueChanges.pipe(
        startWith<string | User>(''),
        map(value => (typeof value === 'string' ? value : value.name)),
        map(name => (name ? this._filter(name) : this.campaignData.slice()))
      );
  }
  divChanged(event) {
    // console.log(event);
  }

  close = () => {
    this.dialogRef.close();
  };
}
