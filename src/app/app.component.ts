import {Component} from '@angular/core';
import {ThunderService, WebSocketMessage} from './thunder.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private doc$: Observable<WebSocketMessage>;
  private count = 1;
  private documentKey = 'documents/first';

  constructor(private thunderService: ThunderService) {
    this.doc$ = this.thunderService.observe(this.documentKey);
  }

  create(): void {
    this.thunderService.set(this.documentKey, {
      count: this.count++,
      timestamp: new Date(),
    });
  }

  update(): void {
    this.thunderService.update(this.documentKey, {
      count: this.count++,
      timestamp: new Date(),
    });
  }

  delete(): void {
    this.thunderService.delete(this.documentKey, {
      count: this.count++,
      timestamp: new Date(),
    });
  }
}
