import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthenticateService } from '../services/login/authenticate.service';
import { AlertController, ToastController } from '@ionic/angular';
import { LoadingService } from '../services/loading/loading.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  protected urlEndPoint: string = environment.baseUrl;
  protected httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  form: FormGroup;

  constructor(
    private http: HttpClient,
    private authService: AuthenticateService,
    private storage: Storage,
    private formBuilder: FormBuilder,
    private loading: LoadingService,
    public alertController: AlertController,
    public toastController: ToastController
  ) {
    this.form = this.formBuilder.group({
      alimento_consumido: [null, Validators.required],
      cantidad: [null, Validators.required],
      calorias_promedio: [null, Validators.required],
      fecha_hora: [null, Validators.required],
    });
  }

  async ngOnInit() {
    await this.storage.create();
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await this.authService.getToken()),
    });
  }

  crearAlimento(form: any) {
    let me = this;
    this.loading.showLoad();
    this.http
      .post(this.urlEndPoint + '/saveAlimentos', form, {
        headers: this.httpHeaders,
      })
      .subscribe({
        next: async (res: any) => {
          const alert = await me.alertController.create({
            header: 'Peticion Exitosa',
            message: 'Alimento guardado',
            buttons: ['Aceptar']
          });
      
          me.form.reset();
          me.loading.hideLoad();
          await alert.present();
        },
        error: async (error: any) => {
          const toastError = await me.toastController.create({
            header: 'Error de sistema',
            message: error.error.message,
            duration: 5000,
          });
          me.loading.hideLoad();
          toastError.present();
        },
      });
  }
}
