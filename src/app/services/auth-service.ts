import { inject, Service } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { LoginRequest } from '../login/login-request';
import { catchError, delay, map, Observable, of, retry, tap } from 'rxjs';
import { LoginResult } from '../login/login-result';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";

@Service()
export class AuthenticationService {
    private readonly http = inject(HttpClient);
    public tokenKey: string = "BearerToken";
    public router = inject(Router);

    public login(loginRequest: LoginRequest, retries: number = 3, searchDelayMilliSeconds: number = 0): Observable<boolean> {
        
        const httpHeaders: HttpHeaders = new HttpHeaders({
            //'Authorization': 'Bearer ' + localStorage.getItem('tokenKey'),
            'Content-Type': 'application/json',
            //'X-API-Key': 'gpvDrDyVbWZ36wngByvrfh0D45uqv5'
        });

        const httpOptions = {
            headers: httpHeaders
        };

		var url = environment.baseUrl + "oauth2/token";

        // alert(url + JSON.stringify(loginRequest));

        return this.http.post<LoginResult>(url, loginRequest) // , httpOptions
        .pipe(
        retry(retries),
        delay(searchDelayMilliSeconds),
        //tap(x => alert("tap: " + JSON.stringify(x))),		
        map((value) => {
                //alert("RESULT: " + JSON.stringify(value));
                if(value.access_token.trim() !== "") {
                    localStorage.setItem(this.tokenKey, value.access_token);
                    return true;
                }

                return false;
            }
         )
        //,
        // catchError((error) => {
        //     console.error('Error Occurred', error);
        //     return of('Error Occurred trapped in Service: ' + error.error.message);
        // })
        );   
    }

    public getTest(retries: number = 3, searchDelayMilliSeconds: number = 0): Observable<string> {
        
		var url = environment.baseUrl + "api/versioning/v1";
                alert(url);
        return this.http.get<string>(url)
        .pipe(
        retry(retries),
        delay(searchDelayMilliSeconds));
    }

    public logout(): void {
        localStorage.removeItem(this.tokenKey);
        //this.router.navigate(['/login']);
    }

    public isLoggedIn(): boolean {
        return !!this.getToken();
    }

    public getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    public isTokenExpired(): boolean {
        return this.isJwtExpired(this.getToken()!);
    }

    private isJwtExpired(token: string, skewSeconds = 300) {
        const exp = jwtDecode(token).exp!;
        const now = Math.floor(Date.now() / 1000);
        return now >= exp - skewSeconds;
    }
}