import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdsService } from '@app/ads/ads.service';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DummyControls } from '@app/shared/utility/dummy.json';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomSelectComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<CustomSelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private adsService: AdsService,
    private fb: FormBuilder
  ) {
    dialogRef.disableClose = true;
  }
  public settingsListForm: FormGroup;
  public columnsList = [];
  public btnDisable = true;
  public showError = true;
  public changeTriggr = false;
  public headersData = [];
  public listData: any;
  public statusList = [{ name: 'Active', id: 1 }, { name: 'Inactive', id: 2 }];
  public divisionsList = [];
  public currentValue = [];
  public disView = false;
  public error = '';
  public submitted = false;
  public isSelectAll = true;
  ngOnInit() {
    // this.getDivisons();
    this.divisionsList = this.data.divisionsList;
    this.getRecords();
    this.listData = this.data.listData;
    this.headersData = DummyControls.controlsData['CUSTOM_VIEWS'];
    this.statusList = this.data.statusList;
    this.settingsListForm = this.data.settingsListForm;
    this.settingsListForm.markAsPristine();
  }
  closeDialog = () => {
    this.dialogRef.close({ from: 'close' });
    this.settingsListForm.reset();
  };
  getRecords() {
    this.adsService
      .getAdModules([{ url: 'getCrushCompareColumns' }, {}])
      .then(res => {
        this.columnsList = _.cloneDeep(res.result.data.data);
        if (this.columnsList.length && this.data.type == 'edit') {
          this.columnsList.map((attr, index) => {
            let idx = this.data.selectedRow.column_keys.indexOf(attr['key']);
            if (idx > -1 || !attr.is_edit) {
              this.columnsList[index].status = 1;
            } else {
              this.columnsList[index].status = 0;
            }
            let idx01 = this.data.selectedRow.export_columns.indexOf(
              attr['key']
            );
            if (idx01 > -1) {
              this.columnsList[index].is_export = 1;
            } else {
              this.columnsList[index].is_export = 0;
            }
          });
          let filteredArrayCopy = this.columnsList.filter(function(itm) {
            if (itm.is_export) {
              return itm.key;
            }
          });
          if (filteredArrayCopy.length === this.columnsList.length) {
            this.isSelectAll = true;
          } else {
            this.isSelectAll = false;
          }
        }
      });
  }
  getDivisons() {
    let prms = {
      column: '',
      pageNumber: 1,
      pageSize: 21,
      search: '',
      sort: 'asc'
    };
    this.adsService.getAdModules([{ url: 'getDivisions' }, prms]).then(res => {
      this.divisionsList = res.result.data.data;
    });
  }
  sendSel(form) {
    this.submitted = true;
    this.showError = true;
    if (form.valid) {
      let filteredArray = this.columnsList.filter(function(itm) {
        if (itm.status && itm.is_edit) {
          return itm.key;
        }
      });
      let filteredArrayKeys = _.map(filteredArray, 'key');
      if (!filteredArrayKeys.length) {
        this.showError = false;
        return;
      }
      let filteredArrayCopy = this.columnsList.filter(function(itm) {
        if (itm.is_export) {
          return itm.key;
        }
      });
      let filteredArrayKeysCopy = _.map(filteredArrayCopy, 'key');
      if (!filteredArrayCopy.length) {
        this.showError = false;
        return;
      }
      let prms = {
        id:
          this.data.selectedRow && this.data.type == 'edit'
            ? this.data.selectedRow.id
            : '',
        column_keys: filteredArrayKeys,
        export_columns: filteredArrayKeysCopy
      };
      form.value.settingsFormValues.forEach(item => {
        prms = Object.assign(prms, item);
      });
      this.adsService
        .getAdModules([{ url: 'saveCustomViews' }, prms])
        .then(res => {
          if (res.result.success) {
            this.dialogRef.close({
              from: 'apply',
              values: filteredArrayKeys,
              res: res
            });
          } else {
            this.error = res.result.data;
            return;
          }
        });
    } else {
      return;
    }
    // let filteredArray = this.columnsList.filter(function(itm) {
    //   if (itm.status && itm.is_edit) {
    //     return itm.key;
    //   }
    // });
    // let filteredArrayKeys = _.map(filteredArray, 'key');
    // this.dialogRef.close({ from: 'apply', values: filteredArrayKeys });
  }
  check(opt) {
    this.btnDisable = false;
    this.showError = true;
    this.changeTriggr = true;
    let filteredArray = this.columnsList.filter(function(itm) {
      if (itm.status && itm.is_edit) {
        return itm.key;
      }
    });
    let filteredArrayKeys = _.map(filteredArray, 'key');
    if (filteredArrayKeys.length) {
      this.btnDisable = false;
    } else {
      // this.btnDisable = true;
    }
    let filteredArrayCopy = this.columnsList.filter(function(itm) {
      if (itm.is_export) {
        return itm.key;
      }
    });
    if (filteredArrayCopy.length == this.columnsList.length) {
      this.isSelectAll = true;
    } else {
      this.isSelectAll = false;
    }
  }
  selectAll() {
    this.btnDisable = false;
    if (this.isSelectAll) {
      this.columnsList.map((attr, index) => {
        this.columnsList[index].is_export = 1;
      });
    } else {
      this.columnsList.map((attr, index) => {
        this.columnsList[index].is_export = 0;
      });
    }
  }
}
