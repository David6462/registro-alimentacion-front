import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthenticateService } from '../services/login/authenticate.service';
import { LoadingService } from '../services/loading/loading.service';
import { AlertController, ToastController } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  protected urlEndPoint: string = environment.baseUrl;
  protected httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  form: FormGroup;

  alimentos: any[] = [];
  current_page: number = 0;
  cantidad: number = 0;

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
      fecha_ini: [null, Validators.required],
      fecha_fin: [null, Validators.required],
    });
  }

  async ngOnInit() {
    await this.storage.create();
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await this.authService.getToken()),
    });

    await this.index('');
  }

  async index(event: any){
    this.loading.showLoad();
    let me = this;
    setTimeout(() => {
      me.current_page++;
      me.http.get(me.urlEndPoint + '/getAlimentos', {
        headers: me.httpHeaders,
        params: this.form.value,
      }).subscribe((res: any)=>{
        me.cantidad = res.total;
        if (me.current_page > res.last_page) {
          (event as InfiniteScrollCustomEvent).target.complete();
          event.target.disabled = true;
          me.loading.hideLoad();
          return;
        } else {
          if (me.current_page > 1) {
            let array_viajes = me.alimentos.concat(res.data);
            me.alimentos = array_viajes;
            (event as InfiniteScrollCustomEvent).target.complete();
            me.loading.hideLoad();
          } else {
            me.alimentos = res.data;
            me.loading.hideLoad();
          }
        }
      }, async (error: any)=>{
        const toastError = await me.toastController.create({
          header: 'Error de sistema',
          message: error.error.message,
          duration: 5000,
        });
        me.loading.hideLoad();
        toastError.present();
      });
    }, 700);
  }

  async filtrar(){
    this.current_page = 0;
    this.cantidad = 0;
    this.index('');
  }

}
