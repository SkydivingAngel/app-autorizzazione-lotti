import { inject, Service } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { LoginRequest } from '../login/login-request';
import { catchError, delay, map, Observable, of, retry, tap, throwError } from 'rxjs';
import { LoginResult } from '../login/login-result';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../api-response';
import { Lotto } from '../autorizzazione-lotti/lotto';
import { Articolo } from '../autorizzazione-lotti/articolo';
import { AuthenticationService } from './auth-service';
import { Router } from '@angular/router';

@Service()
export class LottiService {
    private readonly http = inject(HttpClient);
    public tokenKey: string = "BearerToken";

    public authService = inject(AuthenticationService);
    public router = inject(Router); 

    public elencoLotti(retries: number = 3, searchDelayMilliSeconds: number = 0): Observable<Lotto[]> {
        
        if(!this.authService.getToken()){
            this.authService.logout();
            this.router.navigate(['/login']);
        }

        const httpHeaders: HttpHeaders = new HttpHeaders({
            //'Authorization': 'Bearer ' + this.authService.getToken(),
            'Content-Type': 'application/json',
            //'X-API-Key': 'gpvDrDyVbWZ36wngByvrfh0D45uqv5'
        });

        const httpOptions = {
            headers: httpHeaders
        };

		var url = environment.baseUrl + "api/elenco-lotti/v1";

        //alert(JSON.stringify(httpOptions));

        return this.http.get<ApiResponse>(url) // , httpOptions
        .pipe(
        //retry(retries),
        //delay(searchDelayMilliSeconds),
        //tap(x => alert("tap: " + JSON.stringify(x))),		
        map((value) => {
                    //alert("RESULT: " + JSON.stringify(value));
                    if(value.data) {
                        return value.data;
                    }

                    return [];
                }
            ),
        catchError((error: HttpErrorResponse) => {
            //alert("Ciao: " + JSON.stringify(error));
            return throwError(() => error);
        })
        )   
    }

    public dettaglioLotto(codiceLotto: string, retries: number = 3, searchDelayMilliSeconds: number = 0): Observable<Articolo[]> {
        
        if(!this.authService.getToken()){
            this.authService.logout();
            this.router.navigate(['/login']);
        }

        const httpHeaders: HttpHeaders = new HttpHeaders({
            //'Authorization': 'Bearer ' + localStorage.getItem(this.tokenKey),
            'Content-Type': 'application/json',
            'X-API-Key': 'gpvDrDyVbWZ36wngByvrfh0D45uqv5'
        });

        const httpOptions = {
            headers: httpHeaders
        };

		var url = environment.baseUrl + "api/dettaglio-lotto/" + codiceLotto + "/v1";

        //alert(JSON.stringify(httpOptions));
        //alert(url);

        return this.http.get<ApiResponse>(url, httpOptions) 
        .pipe(
        //retry(retries),
        //delay(searchDelayMilliSeconds),
        //tap(x => alert("tap: " + JSON.stringify(x))),		
        map((value) => {
                //alert("RESULT: " + JSON.stringify(value));
                if(value.data) {
                    return value.data;
                }

                return [];
            }
         )
        )   
    }

    public autorizzaLotto(codiceLotto: string, retries: number = 3, searchDelayMilliSeconds: number = 0): Observable<boolean> {
        
        if(!this.authService.getToken()){
            this.authService.logout();
            this.router.navigate(['/login']);
        }

        const httpHeaders: HttpHeaders = new HttpHeaders({
            //'Authorization': 'Bearer ' + localStorage.getItem(this.tokenKey),
            'Content-Type': 'application/json',
            'X-API-Key': 'gpvDrDyVbWZ36wngByvrfh0D45uqv5'
        });

        const httpOptions = {
            headers: httpHeaders
        };

        let lottoDaAutorizzare = <Lotto>{};
        lottoDaAutorizzare.codiceLotto = codiceLotto;

        //alert(`Autorizzo: ${JSON.stringify(lottoDaAutorizzare)}`);

		var url = environment.baseUrl + "api/autorizza-lotto/v1";

        return this.http.post<ApiResponse>(url, lottoDaAutorizzare, httpOptions) 
        .pipe(
        //retry(retries),
        //delay(searchDelayMilliSeconds),
        //tap(x => alert("tap: " + JSON.stringify(x))),		
        map((value) => {
                //alert("RESULT: " + JSON.stringify(value));
                if(value.success) {
                    return true;
                }

                return false;
            }
         )
        )   
    }

    public warmUp(retries: number = 3, searchDelayMilliSeconds: number = 0): Observable<string> {
        
		var url = environment.baseUrl + "api/versioning/v1";
        return this.http.get<string>(url)
        .pipe(
        retry(retries),
        delay(searchDelayMilliSeconds))
    }
}