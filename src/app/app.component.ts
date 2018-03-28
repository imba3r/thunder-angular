import {Component} from '@angular/core';
import {WebSocketMessage, ThunderService} from './thunder.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private doc$: Observable<WebSocketMessage>;
  private count = 1;
  private documentKey = 'document-key';

  constructor(private thunderService: ThunderService) {
    this.doc$ = this.thunderService.observe(this.documentKey);
  }

  send(): void {
    this.thunderService.update(this.documentKey, {
      count: this.count++,
      timestamp: new Date(),
    });
  }
}
