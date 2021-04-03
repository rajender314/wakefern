import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSettingsComponent } from './add-edit-settings.component';

describe('AddEditSettingsComponent', () => {
  let component: AddEditSettingsComponent;
  let fixture: ComponentFixture<AddEditSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditSettingsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
