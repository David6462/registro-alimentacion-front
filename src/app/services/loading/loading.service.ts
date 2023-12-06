import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  loading: any;

  constructor(public loadingCtrl: LoadingController) {}

  //Cargando normal
  async showLoad() {
    if (!this.loading) {
      this.loading = await this.loadingCtrl.create({
        message: 'Cargando, por favor espere...',
        spinner: 'crescent',
      });
    }
    await this.loading.present();
  }

  //Cerrar cargando
  async hideLoad() {
    if (await this.loading) {
      await this.loading.dismiss();
    }
  }
}
