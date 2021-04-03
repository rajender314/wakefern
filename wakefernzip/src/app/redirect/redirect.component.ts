import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

const APP: any = window['APP'];

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RedirectComponent implements OnInit {
  constructor(private activeRoute: ActivatedRoute, private router: Router) {}
  public url = APP.api_url;
  public logoPath = APP.img_url + 'omini-offer.png';
  ngOnInit() {
    console.log(this.activeRoute, this.router);
  }
  killSess() {
    console.log('killsess');
    window.location.href = this.url.slice(0, -1) + this.router.url;
  }
  gotohome() {
    window.location.href = this.url + '#/vehicles';
  }
}
