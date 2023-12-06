import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(
    private storage: Storage,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
  ){
    this.storage.create();
    const isUserLoggedIn = await this.storage.get('isUserLoggedIn');
    if (isUserLoggedIn) {
      if (next.url[0].path == '/login') {
        await this.showAlert();
        await this.router.navigateByUrl('/home/tabs/tab1');
        return false;
      } else {
        return true;
      }
    } else {
      await this.showAlert();
      await this.router.navigateByUrl('/login');
      return false;
    }
  }

  async showAlert() {
    let alert = await this.alertCtrl.create({
      header: 'Unauthorized',
      message: 'No esta autorizado para este proceso!',
      buttons: ['OK']
    });
    alert.present();
  }
}
