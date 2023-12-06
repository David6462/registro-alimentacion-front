import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular/common';
import { Platform, IonRouterOutlet, ModalController, AlertController, ToastController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { AuthenticateService } from 'src/app/services/login/authenticate.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { RegistrarUsuarioPage } from '../registrar-usuario/registrar-usuario.page';

@Component({
  selector: 'app-login-index',
  templateUrl: './login-index.page.html',
  styleUrls: ['./login-index.page.scss'],
})
export class LoginIndexPage implements OnInit {
  protected urlEndPoint: string = environment.baseUrl;
  protected httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });


  loginForm: FormGroup;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private formBuilder: FormBuilder,
    private loading: LoadingService,
    private authService: AuthenticateService,
    private navCtrl: NavController,
    public modalController: ModalController,
    public alertController: AlertController,
    public toastController: ToastController
  ) {
    //Salir de la app al pulsar botón atrás
    this.platform.backButton.subscribeWithPriority(-1, async () => {
      if (!this.routerOutlet.canGoBack()) {
        const alert = await this.alertController.create({
          header: '¿Desea salir de la aplicación?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Confirmar',
              handler: () => {
                App.exitApp();
              },
            },
          ],
        });

        await alert.present();
      }
    });

    //Formulario para inicio de sesión
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  async ngOnInit() {
    await this.storage.create();
    const isUserLoggedIn = await this.storage.get('isUserLoggedIn');
    if (isUserLoggedIn) {
      this.navCtrl.navigateForward('/home');
    }
  }

  async login(credenciales: any){
    let me = this;
    this.loading.showLoad();
    this.authService.login(credenciales).subscribe({
      next: async function (data) {
        await me.storage.set('token', JSON.stringify(data));
        (await me.getUser()).subscribe(async (res: any) => {
          me.authService.guardarUser(JSON.stringify(res));
        });

        await me.loading.hideLoad();
        await me.storage.set('isUserLoggedIn', true);
        me.navCtrl.navigateForward('/home/tabs/tab1');
      },
      error: async function (err) {
        const toastError = await me.toastController.create({
          header: 'Error de sistema',
          message: err.error.message,
          duration: 5000,
        });
        me.loading.hideLoad();
        toastError.present();
      },
    });
  }

  protected async agregarAuthorizationHeader() {
    let accesToken = await this.storage.get('token');
    let token = this.authService.obtenerDatosToken(accesToken);
    if (token != null) {
      return this.httpHeaders.append(
        'Authorization',
        'Bearer ' + token.access_token
      );
    }
    return this.httpHeaders;
  }

  public async getUser() {
    return this.http.get(this.urlEndPoint + '/getUser', {
      headers: await this.agregarAuthorizationHeader(),
    });
  }

  async goToRegistro() {
    const modal = await this.modalController.create({
      component: RegistrarUsuarioPage,
      componentProps: {},
    });
    await modal.present();
  }

}
