import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthenticationService } from './services/auth-service';
import itMessages from 'devextreme/localization/messages/it.json';
import { loadMessages, locale } from 'devextreme/localization';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(public readonly authService: AuthenticationService, private readonly router: Router,
    private title: Title) {
    
    loadMessages(itMessages);
    locale('it');

    if(this.authService.isLoggedIn()) {
      if(this.authService.isTokenExpired())
      {
            this.authService.logout();
            this.router.navigate(['/login']); 
            return;
      }
      else{
        this.router.navigate(['/elenco']);  
      }
    }
    else{
      this.router.navigate(['/login']);
    }

  }

  ngOnInit(): void {
    this.title.setTitle('Autorizzazione Lotti');
  }

  logout(){
    this.authService.logout();

    this.title.setTitle('Autorizzazione Lotti');

    history.pushState(null, '', location.href);
    window.onpopstate = function () {
      history.go(1);
    };

    this.router.navigate(['/login']);

    return;
  }
}
