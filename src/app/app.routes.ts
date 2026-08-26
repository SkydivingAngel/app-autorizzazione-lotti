import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AutorizzazioneLotti } from './autorizzazione-lotti/autorizzazione-lotti';
import { AuthenticationGuard } from './guards/authGuard';
import { App } from './app';

export const routes: Routes = [
    { 
        path: '',
        component: App
    },
    { 
        path: 'login',
        component: Login
    },
    { 
        path: 'elenco',
        component: AutorizzazioneLotti,
        //canActivate: [AuthenticationGuard]
    },
    { path: '**',
        redirectTo: '/'
    }
];