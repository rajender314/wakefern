import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CompService } from '../comp.service';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AppService } from '@app/app.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { CustomSelectComponent } from '@app/dialogs/custom-select/custom-select.component';
import { AdsService } from '@app/ads/ads.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-comparision',
  templateUrl: './comparision.component.html',
  styleUrls: ['./comparision.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ComparisionComponent implements OnInit {
  public impData = {
    samplePath: '',
    url: 'uploadCompareFile',
    title: 'Items',
    format: 'csv',
    container: 'compare_files',
    fromComp: 'comp-file'
  };
  public impData1 = {
    samplePath: '',
    url: 'uploadCompareFile',
    title: 'Items',
    format: 'csv',
    container: 'compare_files',
    fromComp: 'comp-files',
    id: 'edit-org-logo'
  };
  public impData2 = {
    samplePath: '',
    url: 'uploadCompareFile',
    title: 'Items',
    format: 'csv',
    container: 'compare_files',
    fromComp: 'comp-files',
    id: 'edit-org-logo1'
  };
  public selctedColumns = [];
  public radioOptions = [
    { id: 1, label: 'Select Default', checked: true },
    { id: 2, label: 'Select Columns before Crushing', checked: false }
  ];
  public importBtn = 'Import';
  public uploadDone = false;
  public impSucces = false;
  public impSucces1 = false;
  public checkUploadData: any;
  public proof1UploadData: any;
  public proof1UpldDone = false;
  public proof2UploadData: any;
  public proof2UpldDone = false;
  public checkError = '';
  public viewOptions = [];
  public crushDefault = 1;
  public crushPrms = {
    isCustomized: 0,
    crushed_columns: [],
    export_columns : []
  };
  public proof1ImpScs = false;
  public proof2ImpScs = false;
  public prog1 = false;
  public prog2 = false;
  public loader = true;
  public proof1SelectionDone = false;
  public proof2SelectionDone = false;
  public selectedTabIndex = 0;
  public CompExptBtn = 'Compare and Export';
  clearFiles = false;
  public savedViewValue = '';
  public viewGroup: FormGroup;
  constructor(
    public compService: CompService,
    private snackbar: MatSnackBar,
    public appService: AppService,
    public adsService: AdsService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.appService.configLabels.length) {
      let i = _.findIndex(<any>this.appService.configLabels, {
        key: 'COMPARE'
      });
      if (i < 0) {
        this.router.navigateByUrl('access-denied');
      }
    }

    this.getCustomViews();
  }
  getCustomViews() {
    this.adsService
      .getAdModules([{ url: 'getColumnViews' }, { filter: 1, status: [1] }])
      .then(res => {
        this.viewOptions = res.result.data.data;
        this.viewOptions.unshift({
          name: 'Default',
          id: '1#',
          column_keys: []
        });
        this.savedViewValue = '1#';
        this.createForm();
      });
  }
  viewChange(ev) {
    let idx = _.findIndex(this.viewOptions, {
      id: this.viewGroup.value.view_id
    });
    if (idx > -1) {
      this.crushPrms.isCustomized = this.viewOptions[idx].id == '1#' ? 0 : 1;
      this.crushPrms.crushed_columns = this.viewOptions[idx].column_keys;
      this.crushPrms.export_columns = this.viewOptions[idx].export_columns;
    } else {
      this.crushPrms.isCustomized = 0;
      this.crushPrms.crushed_columns = [];
      this.crushPrms.export_columns = [];
      this.setForm();
    }
    this.resetUploader();
  }
  createForm() {
    this.viewGroup = this.fb.group({
      view_id: ''
    });
    this.setForm();
  }
  setForm() {
    this.viewGroup.patchValue({
      view_id: this.viewOptions.length ? this.viewOptions[0].id : ''
    });
    this.crushPrms.isCustomized = 0;
    this.crushPrms.crushed_columns = [];
    this.crushPrms.export_columns = [];
    this.loader = false;
  }
  resetUploader() {
    this.uploadDone = false;
    // this.impSucces = false;
    // this.impSucces1 = false;
    // this.proof1UpldDone = false;
    // this.proof2UpldDone = false;
    this.proof1SelectionDone = false;
    this.proof2SelectionDone = false;
    this.proof1ImpScs = false;
    this.proof2ImpScs = false;
    this.clearFiles = !this.clearFiles;
    // this.crushDefault = 1;
  }
  importSuccess(event) {}
  importStarts(ev) {}
  fileUploadDone(ev) {
    this.uploadDone = true;
    this.checkUploadData = ev.data;
    this.checkUploadData.file = Object.assign(
      this.checkUploadData.file,
      this.crushPrms
    );
    // this.customSel('proof');
  }
  fileUploadStart(ev) {
    this.uploadDone = false;
    this.importBtn = 'Import';
  }
  optChanged(ev) {
    this.resetUploader();
    this.crushDefault = ev.id;
  }
  proof1UploadDone(ev) {
    this.proof1UpldDone = true;
    this.proof1UploadData = ev.data;
    this.proof1UploadData.file = Object.assign(
      this.proof1UploadData.file,
      this.crushPrms
    );
    // if (this.proof2SelectionDone) {
    //   this.crushPrms.crushed_columns = this.selctedColumns;
    //   this.proof1UploadData.file = Object.assign(
    //     this.proof1UploadData.file,
    //     this.crushPrms
    //   );
    //   this.snackbar.openFromComponent(SnackbarComponent, {
    //     data: {
    //       status: 'success',
    //       msg: 'Columns already selected for File B.'
    //     },
    //     verticalPosition: 'top',
    //     horizontalPosition: 'right'
    //   });
    // } else {
    //   this.customSel('proof1');
    // }
  }
  proof1UploadStart(ev) {
    this.proof1UpldDone = false;
    this.impSucces = false;
    this.proof1ImpScs = false;
    this.prog1 = false;
  }
  proof2UploadDone(ev) {
    this.proof2UpldDone = true;
    this.proof2UploadData = ev.data;
    this.proof2UploadData.file = Object.assign(
      this.proof2UploadData.file,
      this.crushPrms
    );
    // if (this.proof1SelectionDone) {
    //   this.crushPrms.crushed_columns = this.selctedColumns;
    //   this.proof2UploadData.file = Object.assign(
    //     this.proof2UploadData.file,
    //     this.crushPrms
    //   );
    //   this.snackbar.openFromComponent(SnackbarComponent, {
    //     data: {
    //       status: 'success',
    //       msg: 'Columns already selected for File A.'
    //     },
    //     verticalPosition: 'top',
    //     horizontalPosition: 'right'
    //   });
    // } else {
    //   this.customSel('proof2');
    // }
  }
  proof2UploadStart(ev) {
    this.proof2UpldDone = false;
    this.impSucces1 = false;
    this.proof2ImpScs = false;
    this.prog2 = false;
  }
  tabChange(ev) {
    this.selectedTabIndex = ev.index;
    this.crushDefault = 1;
    this.setForm();
    this.viewChange('');
    this.resetUploader();
  }
  importData() {
    if (
      this.importBtn === 'Importing ...' ||
      this.importBtn === 'Exporting ...'
    ) {
      return;
    }
    if (this.importBtn === 'Import') {
      this.importBtn = 'Importing ...';
      this.compService
        .sendOuput('importCheckFile', this.checkUploadData.file)
        .then(res => {
          if (res.result.success) {
            if (res.result.data.status) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: res.result.data.message
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });

              this.importBtn = 'Export';
            } else {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'fail',
                  msg: res.result.data.message
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              this.importBtn = 'Import';
              this.uploadDone = false;
            }
          } else {
            this.importBtn = 'Import';
            this.uploadDone = false;
            this.checkError = res.result.message;
          }
        });
    } else if (this.importBtn === 'Export') {
      this.importBtn = 'Exporting ...';
      this.compService
        .sendOuput('exportItemsData', this.checkUploadData.file)
        .then(res => {
          if (res.result.success) {
            if (res.result.data.status) {
              window.open(res.result.data.data, '_self');
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'success',
                  msg: 'Items Exported Successfully'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
              this.importBtn = 'Export';
              // this.uploadDone = false;
            } else {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: {
                  status: 'fail',
                  msg: 'Failed While Exporting Items'
                },
                verticalPosition: 'top',
                horizontalPosition: 'right'
              });
            }
          }
        });
    }
  }
  proof1Import(ev) {
    if (this.prog1 === true) {
      return;
    }
    this.prog1 = true;
    this.compService
      .sendOuput('importFileCompare', this.proof1UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.impSucces = true;
            this.proof1ImpScs = true;
            this.prog1 = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        } else {
          this.importBtn = 'Import';
          this.uploadDone = false;
          this.checkError = res.result.message;
        }
        this.prog1 = false;
      });
  }
  proof1Export(ev) {
    if (this.prog1 === true) {
      return;
    }
    this.prog1 = true;
    this.compService
      .sendOuput('exportItemsData', this.proof1UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            window.open(res.result.data.data, '_self');
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Items Exported Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.importBtn = 'Import';
            this.prog1 = false;
            // this.uploadDone = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: 'Failed While Exporting Items'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        }
        this.prog1 = false;
      });
  }
  proof2Import(ev) {
    if (this.prog2 === true) {
      return;
    }
    this.prog2 = true;
    this.compService
      .sendOuput('importFileCompare', this.proof2UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.impSucces1 = true;
            this.proof2ImpScs = true;
            this.prog2 = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: res.result.data.message
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        } else {
          this.importBtn = 'Import';
          this.uploadDone = false;
          this.checkError = res.result.message;
        }
        this.prog2 = false;
      });
  }
  proof2Export(ev) {
    if (this.prog2 === true) {
      return;
    }
    this.compService
      .sendOuput('exportItemsData', this.proof2UploadData.file)
      .then(res => {
        if (res.result.success) {
          if (res.result.data.status) {
            window.open(res.result.data.data, '_self');
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: 'Items Exported Successfully'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.importBtn = 'Import';
            // this.uploadDone = false;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: 'Failed While Exporting Items'
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        }
      });
  }
  cmpExport() {
    if (this.CompExptBtn === 'Comparing Please Wait') {
      return;
    }
    this.CompExptBtn = 'Comparing Please Wait';
    let compParams = {
      proof1: this.proof1UploadData.file.filename,
      proof1_original_name: this.proof1UploadData.file.original_name,
      proof2_original_name: this.proof2UploadData.file.original_name,
      proof2: this.proof2UploadData.file.filename,
      isCustomized: this.crushPrms.isCustomized,
      crushed_columns: this.crushPrms.crushed_columns,
      export_columns : this.crushPrms.export_columns
    };
    this.compService.sendOuput('compareAndExport', compParams).then(res => {
      this.CompExptBtn = 'Comparing Please Wait';
      if (res.result.success) {
        if (res.result.data.status) {
          window.open(res.result.data.data, '_self');
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'success',
              msg: 'Items Exported Successfully'
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.CompExptBtn = 'Compare and Export';
          // this.uploadDone = false;
        } else {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              status: 'fail',
              msg: res.result.data.message
            },
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
          this.CompExptBtn = 'Compare and Export';
        }
        // this.proof1ImpScs = false;
        // this.proof2ImpScs = false;
        //  this.resetUploader();
      }
    });
  }
  // customSel(fromFunc) {
  //   if (this.crushDefault == 1) {
  //     this.crushPrms.isCustomized = 0;
  //     this.crushPrms.crushed_columns = [];
  //     return;
  //   }
  //   let dialogRef = this.dialog.open(CustomSelectComponent, {
  //     panelClass: ['confirm-delete', 'overlay-dialog'],
  //     width: '650px',
  //     data: {
  //       title: '',
  //       url: '',
  //       from: ''
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result.from === 'apply') {
  //       this.selctedColumns = result.values;
  //       this.crushPrms.isCustomized = 1;
  //       this.crushPrms.crushed_columns = result.values;
  //       if (fromFunc === 'proof') {
  //         this.checkUploadData.file = Object.assign(
  //           this.checkUploadData.file,
  //           this.crushPrms
  //         );
  //         this.importData();
  //       } else if (fromFunc === 'proof1') {
  //         this.proof1UploadData.file = Object.assign(
  //           this.proof1UploadData.file,
  //           this.crushPrms
  //         );
  //         this.proof1SelectionDone = true;
  //         this.proof1Import('');
  //       } else if (fromFunc === 'proof2') {
  //         this.proof2UploadData.file = Object.assign(
  //           this.proof2UploadData.file,
  //           this.crushPrms
  //         );
  //         this.proof2SelectionDone = true;
  //         this.proof2Import('');
  //       }
  //       this.crushPrms.crushed_columns = [];
  //     } else if (result.from === 'close') {
  //       this.resetUploader();
  //       this.snackbar.openFromComponent(SnackbarComponent, {
  //         data: {
  //           status: 'fail',
  //           msg: 'Columns should be selected'
  //         },
  //         verticalPosition: 'top',
  //         horizontalPosition: 'right'
  //       });
  //     }
  //   });
  // }
}
