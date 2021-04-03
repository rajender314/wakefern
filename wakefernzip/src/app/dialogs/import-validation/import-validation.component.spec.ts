import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportValidationComponent } from './import-validation.component';

describe('ImportValidationComponent', () => {
  let component: ImportValidationComponent;
  let fixture: ComponentFixture<ImportValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportValidationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
