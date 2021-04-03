import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoImageAssetsComponent } from './promo-image-assets.component';

describe('PromoImageAssetsComponent', () => {
  let component: PromoImageAssetsComponent;
  let fixture: ComponentFixture<PromoImageAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PromoImageAssetsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoImageAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
