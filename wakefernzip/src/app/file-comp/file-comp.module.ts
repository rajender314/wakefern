import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileCompRoutingModule } from './file-comp-routing.module';
import { ComparisionComponent } from './comparision/comparision.component';
import { SharedModule } from '@app/shared/shared.module';
import { DialogsModule } from '@app/dialogs/dialogs.module';
import { PixelKitModule } from 'pixel-kit';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [ComparisionComponent],
  imports: [CommonModule, FileCompRoutingModule, SharedModule,DialogsModule,PixelKitModule,FormsModule,ReactiveFormsModule]
})
export class FileCompModule {}
