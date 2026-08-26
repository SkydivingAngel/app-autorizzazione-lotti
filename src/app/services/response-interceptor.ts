import { HttpInterceptorFn, HttpErrorResponse, HttpResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthenticationService } from './auth-service';

export const responseInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn) => 
{
  const router = inject(Router);
  const authService = inject(AuthenticationService);
  const token = authService.getToken();

  req = req.clone({
    setHeaders: {
      'X-API-Key': `gpvDrDyVbWZ36wngByvrfh0D45uqv5`,
      'Content-Type': 'application/json'
    }
  });

  if(token){
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
      }
    });
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        //alert('Request sent');
        if (event instanceof HttpResponse) {
          // Qui hai accesso allo status code anche per le risposte 2xx di successo
          //alert(`Risposta ricevuta con successo! Status: ${event.status}`); 
        }
    },
    error: (error) => {
        // Gestione degli errori (es. 401, 500) se vuoi centralizzare anche questi
        console.error(`Risposta in errore! Status: ${error.status}`);
      },
      //complete: () => alert('Request completed'),
    }),
    catchError((error: HttpErrorResponse) => {
      // Controlla se l'errore è un 401 Unauthorized
      if (error.status === 0 || error.status === 401) {
        //alert("catchError: " + error.status);
        // 1. Cancella i dati di autenticazione locali (token, localstorage, ecc.)
        authService.logout(); 

        // 2. Reindirizza l'utente alla pagina di login
        //router.navigate(['/login']);
      }

      // Propaga l'errore al componente o servizio che ha effettuato la chiamata
      return throwError(() => error);
    })
  );
};