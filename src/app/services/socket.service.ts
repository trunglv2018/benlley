import { Injectable } from '@angular/core';
import { Subject, EMPTY, Observable, timer } from 'rxjs';
import { switchAll, catchError, tap, delayWhen, retryWhen } from 'rxjs/operators';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket$: WebSocketSubject<any>;
    private messagesSubject$ = new Subject();
    public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));

    public connect(endpoint: string, cfg: { reconnect: boolean } = { reconnect: false }): void {

        if (!this.socket$ || this.socket$.closed) {
            this.socket$ = this.getNewWebSocket(endpoint);
            const messages = this.socket$.pipe(cfg.reconnect ? this.reconnect : o => o,
                tap({
                    error: error => console.log(error),
                }), catchError(_ => EMPTY))
            this.messagesSubject$.next(messages);
        }
    }

    private reconnect(observable: Observable<any>): Observable<any> {
        return observable.pipe(
            retryWhen(
                errors => errors.pipe(
                    tap(val => console.log('[Data Service] Try to reconnect', val)),
                    delayWhen(_ => timer(3000))
                )
            )
        );
    }


    sendMessage(msg: any) {
        this.socket$.next(msg);
    }

    close() {
        this.socket$.complete();
    }

    private getNewWebSocket(endpoint: string) {
        return webSocket({
            url: endpoint,
            closeObserver: {
                next: () => {
                    console.log('[DataService]: connection closed');
                }
            },
            // serializer: msg => JSON.stringify({ roles: "admin,user", msg: { ...msg } }),

        });
    }
}