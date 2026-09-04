import { Component, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl  } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/auth-service';
import { Title } from '@angular/platform-browser';
import { LoginRequest } from './login-request';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { finalize, Subject, takeUntil } from 'rxjs';
import { DxCheckBoxModule, DxLoadIndicatorModule,  DxLoadPanelModule } from "devextreme-angular";
import { ValueChangedEvent } from 'devextreme/ui/check_box';
import { LottiService } from '../services/lotti-service';
import { Properties as LoadIndicatorProperties } from 'devextreme/ui/load_indicator';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [ReactiveFormsModule, DxButtonModule, DxCheckBoxModule, DxLoadIndicatorModule, DxLoadPanelModule]
})

export class Login implements OnInit, AfterViewInit, OnDestroy{
  public loginForm?: any;
  private destroy$ = new Subject<void>();

  checkBox_show_password: boolean = false;
  loginMessage = signal<string>('');

  isLoadingPanelEnabled = false; 
  loadPanelMessage = signal<string>('');

  loadIndicatorOptions: LoadIndicatorProperties = {
    animationType: 'circle',
    width: 40,
    height: 40
  };

  constructor(private fb: FormBuilder,
    private authService : AuthenticationService,
    private lottiService : LottiService,
    private router: Router,
    private title: Title) {

      if(this.authService.isLoggedIn()) {
        this.router.navigate(['/elenco']);
        return;
      }

    }

  public appLogo: string = './assets/images/logo.png';

	ngAfterViewInit(): void {
		this.appLogo = "../assets/images/logo.png";
	}

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.title.setTitle('Autorizzazione Lotti - Login');
    history.pushState(null, '', location.href);
    window.onpopstate = function () {
      history.go(1);
    };

    this.warmup();
  }

  handleValueChange (e: ValueChangedEvent) {
      const previousValue = e.previousValue;
      const newValue = e.value;
      this.checkBox_show_password = newValue;
    }

  onSubmit(): void {
    if (this.loginForm.valid) {

      //const username = this.loginForm.get('username').value;
      //const password = this.loginForm.get('password').value;
      
      let loginRequest = <LoginRequest>{};
      loginRequest.grant_type = "client_credentials";
      loginRequest.client_id = this.loginForm.controls['username'].value;
      loginRequest.client_secret = this.loginForm.controls['password'].value; 
      loginRequest.scope = ""; 

      this.authService.logout();

      this.loadPanelMessage.set("Verifica Credenziali in corso...");
      this.isLoadingPanelEnabled = true;

      //alert(JSON.stringify(loginRequest));

      this.authService.login(loginRequest, 0, 0)
      .pipe(
        finalize(() => {
              this.loadPanelMessage.set("");
              this.isLoadingPanelEnabled = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
          next: (result) => {
            if(result) {
              this.router.navigate(['/elenco']);
              return;
            }
            else{
              this.authService.logout();
              this.loginMessage.set("Errore di autenticazione. Controlla le credenziali e riprova.");
            }
          },
          error: (error) => {
            
            //alert(error.status + " - " + error.error.message);  

            if (error.status == 400) {
              this.loginMessage.set(error.status + " - " + error.error.message);
              this.authService.logout();
            }
            if (error.status == 401) {
              this.loginMessage.set(error.status + " - " + error.error);
              this.authService.logout();
            }
          },
          complete: () => {
            //console.log('Stream Completed')
          }
      });
    }
  }

  warmup(){
      this.lottiService.warmUp(0, 0)
      .subscribe({
          next: (result) => {
          },
          error: (error) => {
          },
          complete: () => {
          }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}