import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdPromotionsComponent } from './ad-promotions.component';

describe('AdPromotionsComponent', () => {
  let component: AdPromotionsComponent;
  let fixture: ComponentFixture<AdPromotionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdPromotionsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
