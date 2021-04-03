import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AppService } from '@app/app.service';
import { CustomValidation } from '@app/shared/utility/custom-validations';
import * as moment from 'moment';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-add-page',
  templateUrl: './add-page.component.html',
  styleUrls: ['./add-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddPageComponent implements OnInit {
  public state = {
    section: [
      {
        id: '5d5f7cda96f23b90c41f2088',
        label: 'Name',
        ui_element_id: '5c2366b31982d075b6da088f',
        is_edit: false,
        status: true,
        options: [],
        settings: '',
        value: '',
        tooltip: '',
        preference: '',
        default_key: '',
        key: 'single_line_text',
        type: 'Single Line Text',
        db_column_key: 'name',
        form_save_value: {
          settings: {
            mandatory: true,
            disabled: true,
            size: null,
            decimal: null
          }
        },
        get_api: ''
      },
      {
        id: '5d5f7cda96f23b90c41f2088',
        label: 'Page Order',
        ui_element_id: '5c2366b31982d075b6da088f',
        is_edit: false,
        status: true,
        options: [],
        settings: '',
        value: '',
        tooltip: '',
        preference: '',
        default_key: '',
        key: 'number',
        type: 'Single Line Text',
        db_column_key: 'page_order',
        form_save_value: {
          settings: {
            mandatory: true,
            size: null,
            decimal: null,
            disabled: true
          }
        },
        get_api: ''
      },

      {
        id: '5d5f7cda96f23b90c41f2088',
        label: 'Rows',
        ui_element_id: '5c2366b31982d075b6da088f',
        is_edit: false,
        status: true,
        options: [],
        settings: '',
        value: '',
        tooltip: '',
        preference: '',
        default_key: '',
        key: 'number',
        type: 'Single Line Text',
        db_column_key: 'rows',
        form_save_value: {
          settings: {
            mandatory: true,
            size: null,
            decimal: null
          }
        },
        get_api: ''
      },

      {
        id: '5d5f7cda96f23b90c41f2088',
        label: 'Columns',
        ui_element_id: '5c2366b31982d075b6da088f',
        is_edit: false,
        status: true,
        options: [],
        settings: '',
        value: '',
        tooltip: '',
        preference: '',
        default_key: '',
        key: 'number',
        type: 'Single Line Text',
        db_column_key: 'cols',
        form_save_value: {
          settings: {
            mandatory: true,
            size: null,
            decimal: null
          }
        },
        get_api: ''
      },
      {
        id: '5d5f7cda96f23b90c41f2088',
        label: 'Width',
        ui_element_id: '5c2366b31982d075b6da088f',
        is_edit: false,
        status: true,
        options: [],
        settings: '',
        value: '',
        tooltip: '',
        preference: '',
        default_key: '',
        key: 'number',
        type: 'Single Line Text',
        db_column_key: 'width',
        form_save_value: {
          settings: {
            mandatory: true,
            size: null,
            decimal: null
          }
        },
        get_api: ''
      },
      {
        id: '5d5f7cda96f23b90c41f2088',
        label: 'Height',
        ui_element_id: '5c2366b31982d075b6da088f',
        is_edit: false,
        status: true,
        options: [],
        settings: '',
        value: '',
        tooltip: '',
        preference: '',
        default_key: '',
        key: 'number',
        type: 'Single Line Text',
        db_column_key: 'height',
        form_save_value: {
          settings: {
            mandatory: true,
            size: null,
            decimal: null
          }
        },
        get_api: ''
      },
      {
        id: '5ea6dd9a147c7188588102f7',
        label: 'Select Zones',
        ui_element_id: '5c23668c1982d075b6da088c',
        is_edit: false,
        status: true,
        options: [],
        settings: '',
        value: '',
        tooltip: '',
        preference: '',
        default_key: '',
        key: 'multiple_choice',
        type: 'Multiple Choice',
        db_column_key: 'zones',
        form_save_value: {
          settings: {
            mandatory: true,
            size: null,
            decimal: null
          }
        },
        get_api: 'getZones'
      }
    ]
  };
  createPageForm: FormGroup;
  public formReady = false;
  public submitted: boolean;
  constructor(
    public dialogRef: MatDialogRef<AddPageComponent>,
    private fb: FormBuilder,
    private appService: AppService,
    private adsService: AdsService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    // const formData = this.appService.getListData('Top-Headers', 'ADS');
    // this.appService.getFormDeatils(formData._id).then(res => {
    //   this.state.section = res.result.data.specsInfo.slice(0, 4);
    //   console.log(res.result.data.specsInfo);

    //   this.createForm();
    // });
    this.state.section[0].value = 'Page ' + (this.data.pagesData.length + 1);
    this.state.section[1].value = (this.data.pagesData.length + 1).toString();
    this.createForm();
  }
  allowNumber(event: any, type) {
    // const pattern = /^[0-9-]*$/;
    if (type == 'number') {
      const pattern = /^-?[0-9]+(\.[0-9]*){0,1}$/g;
      let inputChar = String.fromCharCode(event.charCode);
      if (event.keyCode != 8 && !pattern.test(inputChar)) {
        event.preventDefault();
      }
    }
  }
  createForm(): void {
    this.createPageForm = this.fb.group({
      adDetailsFormValues: this.fb.array([])
    });
    this.createControls();
  }
  public get adDetailsFormValues() {
    return this.createPageForm.get('adDetailsFormValues') as FormArray;
  }

  createControls() {
    let i = 0;
    this.state.section.forEach(attr => {
      console.log(attr);
      this.adDetailsFormValues.push(this.createFormGroup(attr, i));
      i++;
    });
    setTimeout(() => {
      this.formReady = true;
    }, 1000);
  }

  public zoneOptions = [];
  createFormGroup(attr, idx) {
    // console.log(attr, idx)
    if (attr.key === 'dropdown' || attr.key === 'multiple_choice') {
      if (attr.get_api) {
        console.log('1234');
        this.appService
          .getDropdownOptions(attr.get_api, { status: [1] })
          .then(res => {
            if (res.result.data && res.result.data.data.length) {
              const i = _.findIndex(res.result.data.data, { name: '0' });
              let opts = res.result.data.data;
              if (i > -1) {
                opts.splice(i, 1);
              }
              attr.options = opts;
              console.log(attr, res.result.data.data);

              this.state.section[idx].options = opts;
            }

            // if (attr.db_column_key === 'zone_id') {
            //   if (attr.options.length) {
            //     attr.options.unshift({ id: 'select_all', name: 'Select All' });

            //   }
            //   this.zoneOptions = attr.options;

            // }
          });
      }
    }
    if (attr.key === 'number') {
      return this.fb.group({
        [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
          ? [
              attr.value,
              Validators.compose([
                Validators.required,
                Validators.pattern('^[0-9]*$')
              ])
            ]
          : [attr.value, Validators.pattern('^[0-9]*$')]
      });
    } else if (attr.form_save_value.settings.mandatory) {
      return this.fb.group({
        [attr.db_column_key]: [attr.form_save_value.settings.mandatory]
          ? [attr.value, Validators.required]
          : [attr.value]
      });
    } else {
      return this.fb.group({
        [attr.db_column_key]: [attr.value]
      });
    }
  }
  createPage(form) {
    this.submitted = true;
    const dummyJson = {
      name: 'Page 1',
      ad_id: this.appService.adId
    };
    form.value.adDetailsFormValues.map(attr => {
      Object.assign(dummyJson, attr);
    });
    console.log(dummyJson);
    if (form.valid) {
      this.adsService.sendOuput('savePage', dummyJson).then(res => {
        console.log(res);
        if (res.result.success) {
          this.dialogRef.close({ res: res.result.data, from: 'save' });
        }
        // this.dialogRef.close({res : res});
      });
    }
  }

  close() {
    this.dialogRef.close({ from: 'cancel' });
  }

  valChanged(val) {}
}
