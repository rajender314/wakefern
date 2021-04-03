import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  SimpleChange
} from '@angular/core';
import { AppService } from '@app/app.service';

@Component({
  selector: 'app-search',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    class: 'search'
  },
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  constructor(public appservice: AppService) {}
  @ViewChild('search') searchElement: ElementRef;

  @Input() search;
  @Input() type;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSearch = new EventEmitter<any>();

  public searchOpts = {
    placeHolder: 'Search...',
    value: ''
  };

  public searching = false;

  private timeout;

  ngOnInit() {
    this.searchOpts = Object.assign(this.searchOpts, this.search);
    this.searchOpts.value = this.search.placeHolder
      ? this.search.value
      : this.search;
    this.searchElement.nativeElement.value = this.searchOpts.value;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges() {
    this.searchOpts.placeHolder = this.search ? '' : 'Search...';
    if (this.search) {
      this.searchOpts = Object.assign({}, this.search);
      if (this.search.value) {
        this.searchElement.nativeElement.value = this.searchOpts.value;
      }
    }
  }

  triggerSearch(event: any): void {
    event.stopPropagation();
  }
  searchList(search) {
    if (this.type !== 'image-assests') {
      this.searching = true;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.searching = false;
      this.onSearch.emit(search);
    }, 1000);
  }

  onkeyDown(event) {
    if (this.appservice.switchPromoFlag) {
      setTimeout(() => {
        this.searchOpts.value = '';
      }, 500);
    } else {
      return;
    }
  }
}
