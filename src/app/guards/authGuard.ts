import { inject, Injectable, Service } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, CanLoad, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth-service';

@Service()
export class AuthenticationGuard implements CanActivate {

    private readonly authService = inject(AuthenticationService);
    private readonly router = inject(Router);

    canActivate(): boolean {
        return this.checkAuth();
    }

    private checkAuth(): boolean {
        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            // Redirect to the login page if the user is not authenticated
            this.router.navigate(['/login']);
            return false;
        }
    }
}