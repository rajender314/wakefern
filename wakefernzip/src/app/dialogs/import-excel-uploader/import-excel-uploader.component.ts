import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-import-excel-uploader',
  templateUrl: './import-excel-uploader.component.html',
  styleUrls: ['./import-excel-uploader.component.scss']
})
export class ImportExcelUploaderComponent implements OnInit {
  public impData = {
    samplePath: '',
    url: '',
    title: '',
    format: '',
    container: '',
    fromComp: ''
  };
  constructor() {}

  ngOnInit() {}
  fileUploadStart(event) {}
  fileUploadDone(event) {}
  importSuccess(event) {}
  importStarts(event) {}
}
