import { Component } from '@angular/core';
import { AppService } from '@app/app.service';
const APP: any = window['APP'];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Omni Offer';
  isUserLogin = APP.loginDetails;
  constructor(private appService: AppService) {}
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.getLabels();
    this.getHeaderPermissions();
  }

  getLabels() {
    this.appService.getLabels({}).then(res => {
      this.appService.totalConfigData = res.result.data;
      this.appService.configData.next(res.result);
    });
  }
  getHeaderPermissions() {
    this.appService.getHeaderPermissions().then(res => {
      // console.log(res.result.data);
      this.appService.headerPermissions = res.result.data;
    });
  }
}
