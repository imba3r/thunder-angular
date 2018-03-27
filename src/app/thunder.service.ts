import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {WebSocketSubject} from 'rxjs/observable/dom/WebSocketSubject';
import {Observable} from 'rxjs/Observable';
import {distinctUntilChanged, filter, map, take} from 'rxjs/operators';

const URL = 'ws://localhost:3000/thunder';

export type Operation = 'SNAPSHOT' | 'SUBSCRIBE' | 'INSERT' | 'UPDATE' | 'DELETE' | 'VALUE_CHANGE';

export interface Message {
  key: string;
  operation: Operation;
  id?: number;
  payload?: any;
  payloadMetadata?: PayloadMetadata;
}

export interface PayloadMetadata {
  type: string;
  exists: boolean;
}

@Injectable()
export class ThunderService implements OnDestroy {

  private webSocketSubject$: WebSocketSubject<any>;
  private messageSubject$: Subject<Message> = new Subject<Message>();
  private messageID = 0;
  private subscription;

  constructor() {
    this.webSocketSubject$ = WebSocketSubject.create(URL);
    this.subscription = this.webSocketSubject$.subscribe(
      (message) => this.messageSubject$.next(message),
      (err) => console.error(err),
      () => console.warn('Completed!')
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  observe(key: string): Observable<any> {
    this.send({key: key, operation: 'SUBSCRIBE'});
    return this.messageSubject$.pipe(
      filter((msg: Message) => msg.key === key && msg.operation === 'VALUE_CHANGE'),
      distinctUntilChanged(),
      map((msg: Message) => msg.payload)
    );
  }

  insert(key: string, payload: any): void {
    this.send({key: key, operation: 'INSERT', payload: payload});
  }

  update(key: string, payload: any): void {
    this.send({key: key, operation: 'UPDATE', payload: payload});
  }

  delete(key: string, payload: any): void {
    this.send({key: key, operation: 'DELETE', payload: payload});
  }

  snapshot(key: string): Observable<Message> {
    const id = this.messageID++;

    const observable = this.messageSubject$.pipe(
      filter((msg: Message) => msg.key === key && msg.operation === 'SNAPSHOT' && msg.id === id),
      take(1),
      map((msg: Message) => msg.payload),
    );

    this.send({key: key, id: id, operation: 'SNAPSHOT'});
    return observable;
  }

  private send(message: Message): void {
    this.webSocketSubject$.next(JSON.stringify(message));
  }
}
