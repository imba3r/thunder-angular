import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {WebSocketSubject} from 'rxjs/observable/dom/WebSocketSubject';
import {Observable} from 'rxjs/Observable';
import {distinctUntilChanged, filter} from 'rxjs/operators';

const URL = 'ws://localhost:3000/thunder';

export type WebSocketOperation = 'SUBSCRIBE' | 'ADD' | 'SET' | 'UPDATE' | 'DELETE' | 'VALUE_CHANGE' | 'SNAPSHOT';

export interface WebSocketMessage {
  key: string;
  operation: WebSocketOperation;
  requestId?: number;
  transactionId?: number;
  error?: Error;
  payload?: any;
  payloadMetadata?: PayloadMetadata;
}

export interface Error {
  message: string;
}

export interface PayloadMetadata {
  exists: boolean;
}

@Injectable()
export class ThunderService implements OnDestroy {

  private webSocketSubject$: WebSocketSubject<any>;
  private messageSubject$: Subject<WebSocketMessage> = new Subject<WebSocketMessage>();
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
    const observable = this.messageSubject$.pipe(
      filter((msg: WebSocketMessage) => msg.key === key && msg.operation === 'VALUE_CHANGE'),
      distinctUntilChanged(),
    );
    this.send({key: key, operation: 'SUBSCRIBE'});
    return observable;
  }

  add(key: string, payload: any): void {
    this.send({key: key, operation: 'ADD', payload: payload});
  }

  set(key: string, payload: any): void {
    this.send({key: key, operation: 'SET', payload: payload});
  }

  update(key: string, payload: any): void {
    this.send({key: key, operation: 'UPDATE', payload: payload});
  }

  delete(key: string, payload: any): void {
    this.send({key: key, operation: 'DELETE', payload: payload});
  }

  private send(message: WebSocketMessage): void {
    this.webSocketSubject$.next(JSON.stringify(message));
  }
}
