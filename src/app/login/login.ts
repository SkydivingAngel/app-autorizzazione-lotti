import { Component, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl  } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/auth-service';
import { Title } from '@angular/platform-browser';
import { LoginRequest } from './login-request';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { Subject, takeUntil } from 'rxjs';
import { DxCheckBoxModule, DxLoadIndicatorModule } from "devextreme-angular";
import { ValueChangedEvent } from 'devextreme/ui/check_box';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [ReactiveFormsModule, DxButtonModule, DxCheckBoxModule, DxLoadIndicatorModule]
})
export class Login implements OnInit, AfterViewInit, OnDestroy{
  public loginForm?: any;
  private destroy$ = new Subject<void>();

  checkBox_show_password: boolean = false;
  login_message= signal('');
  isLoadIndicatorVisible: boolean = false;

  constructor(private fb: FormBuilder,
    private authService : AuthenticationService,
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
  }

  handleValueChange (e: ValueChangedEvent) {
      const previousValue = e.previousValue;
      const newValue = e.value;
      this.checkBox_show_password = newValue;
    }

  onSubmit(): void {
    if (this.loginForm.valid) {

      this.isLoadIndicatorVisible = true;

      //const username = this.loginForm.get('username').value;
      //const password = this.loginForm.get('password').value;
      
      let loginRequest = <LoginRequest>{};
      loginRequest.grant_type = "client_credentials";
      loginRequest.client_id = this.loginForm.controls['username'].value;
      loginRequest.client_secret = this.loginForm.controls['password'].value; 
      loginRequest.scope = ""; 

      this.authService.logout();
      this.login_message.set("Verifica Credenziali in corso...");

      //alert(JSON.stringify(loginRequest));

      this.authService.login(loginRequest, 0, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
          next: (result) => {
            if(result) {
              this.router.navigate(['/elenco']);
              return;
            }
            else{
              this.authService.logout();
              //alert('Errore di autenticazione. Controlla le credenziali e riprova.');
              this.isLoadIndicatorVisible = false;
              this.login_message.set("");
            }
          },
          error: (error) => {
            this.isLoadIndicatorVisible = false;

            //this.authService.logout();
            //console.log('Error Occurred', JSON.stringify(error));
            // alert(error.status + " - " + error.error.message);  
            if (error.status == 400) {
              this.login_message.set(error.error.message);
            }
            if (error.status == 401) {
              this.login_message.set(error.status + " - " + error.error);
              this.authService.logout();
              //this.router.navigate(['/login']);
              //return;
            }
          },
          complete: () => {
            //console.log('Stream Completed')
            //this.isLoadIndicatorVisible = false;
          }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
