import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportExcelUploaderComponent } from './import-excel-uploader.component';

describe('ImportExcelUploaderComponent', () => {
  let component: ImportExcelUploaderComponent;
  let fixture: ComponentFixture<ImportExcelUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportExcelUploaderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportExcelUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
