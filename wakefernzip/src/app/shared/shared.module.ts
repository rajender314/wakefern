import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentModule } from './component/component.module';
import { MaterialModule } from './material/material.module';

import { HttpClientModule } from '@angular/common/http';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { EditModComponent } from '@app/dialogs/edit-mod/edit-mod.component';
import { SearchComponent } from './component/search/search.component';

@NgModule({
  imports: [
    CommonModule,
    ComponentModule,
    MaterialModule,
    HttpClientModule,
    CarouselModule
  ],
  declarations: [],

  providers: [EditModComponent, SearchComponent],

  exports: [ComponentModule, MaterialModule, CarouselModule]
})
export class SharedModule {}
