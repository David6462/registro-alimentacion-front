import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CambiarClave } from '../validators/cambiarClave.validator';
import { AuthenticateService } from '../services/login/authenticate.service';
import { AlertController, ToastController } from '@ionic/angular';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { LoadingService } from '../services/loading/loading.service';

declare var google: any;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page {
  protected urlEndPoint: string = environment.baseUrl;
  protected httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  @ViewChild('map') mapRef?: ElementRef;
  newMap?: GoogleMap;
  currentMarker: any;

  form: FormGroup;

  state_nombres: boolean = true;
  state_apellidos: boolean = true;
  state_tID: boolean = true;
  state_doc: boolean = true;
  state_genero: boolean = true;
  state_telefono: boolean = true;
  state_direccion: boolean = true;

  constructor(
    private http: HttpClient,
    private authService: AuthenticateService,
    private storage: Storage,
    private loading: LoadingService,
    public formBuilder: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController
  ) {
    this.form = this.formBuilder.group({
      id: [null, Validators.required],
      nombres: [null, Validators.required],
      apellidos: [null, Validators.required],
      tipo_identificacion: [null, Validators.required],
      numero_identificacion: [
        null,
        [Validators.required, Validators.min(10000)],
      ],
      genero: [null, Validators.required],
      latitud: [null, Validators.required],
      longitud: [null, Validators.required],
      direccion: [null, Validators.required],
      telefono: [null, [Validators.required, Validators.min(1000000000)]],
      foto_cedula_frente: ['prueba 1', Validators.required],
      foto_cedula_reverso: ['prueba 2', Validators.required],
      foto_rostro: ['prueba 3', Validators.required],
      estado: [1],
    });
  }

  async ngOnInit() {
    await this.storage.create();
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await this.authService.getToken()),
    });

    await this.createMap();
    this.loading.showLoad();
    this.http
      .get(this.urlEndPoint + '/getUser', {
        headers: this.httpHeaders,
      })
      .subscribe((res: any) => {
        this.form.controls['id'].setValue(res.id);
        this.form.controls['nombres'].setValue(res.nombres);
        this.form.controls['apellidos'].setValue(res.apellidos);
        this.form.controls['tipo_identificacion'].setValue(
          res.tipo_identificacion
        );
        this.form.controls['numero_identificacion'].setValue(
          res.numero_identificacion
        );
        this.form.controls['genero'].setValue(res.genero);
        this.form.controls['latitud'].setValue(res.latitud);
        this.form.controls['longitud'].setValue(res.longitud);
        this.form.controls['direccion'].setValue(res.direccion);
        this.form.controls['telefono'].setValue(res.telefono);
        this.loading.hideLoad();
      });
  }

  async createMap() {
    if (this.mapRef) {
      const coordinates = await Geolocation.getCurrentPosition();

      this.newMap = await GoogleMap.create({
        id: 'map',
        element: this.mapRef.nativeElement,
        apiKey: environment.mapsKeyApi,
        config: {
          mapTypeControl: false,
          streetViewControl: false,
          center: {
            lat: coordinates.coords.latitude,
            lng: coordinates.coords.longitude,
          },
          zoom: 17,
        },
        region: 'CO',
      });

      await this.addMarker(
        coordinates.coords.latitude,
        coordinates.coords.longitude
      );

      try {
        const direccion = await this.getAddressFromLatLng(
          coordinates.coords.latitude,
          coordinates.coords.longitude
        );
        this.form.controls['direccion'].setValue(direccion);
      } catch (error) {
        console.error('Error al obtener la dirección:', error);
      }

      this.form.controls['latitud'].setValue(coordinates.coords.latitude);
      this.form.controls['longitud'].setValue(coordinates.coords.longitude);
    } else {
      console.error('No se encontró el elemento con el ID "map".');
    }
  }

  async addMarker(lat: any, lng: any) {
    this.currentMarker = await this.newMap?.addMarker({
      coordinate: {
        lat: lat,
        lng: lng,
      },
    });
  }

  async searchAddress(direccion: any) {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await this.geocodeAddress(geocoder, direccion);

      this.newMap?.setCamera({
        coordinate: {
          lat: result.lat(),
          lng: result.lng(),
        },
      });

      // Elimina el marcador anterior si existe
      if (this.currentMarker) {
        await this.newMap?.removeMarker(this.currentMarker);
      }

      // Añade el nuevo marcador
      await this.addMarker(result.lat(), result.lng());
      this.form.controls['latitud'].setValue(result.lat());
      this.form.controls['longitud'].setValue(result.lng());
    } catch (error) {
      console.error('Error al buscar la dirección:', error);
    }
  }

  geocodeAddress(geocoder: any, address: string): Promise<any> {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject('La dirección no pudo ser geocodificada. Estado: ' + status);
        }
      });
    });
  }

  getAddressFromLatLng(lat: number, lng: number): Promise<string> {
    const latLng = new google.maps.LatLng(lat, lng);
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('No se pudo obtener la dirección. Estado: ' + status);
        }
      });
    });
  }

  async actualizar() {
    let me = this;
    this.loading.showLoad();
    this.http
      .post(this.urlEndPoint + '/updateAlimentos', this.form.value, {
        headers: this.httpHeaders,
      })
      .subscribe(async (res: any) => {
        const alert = await me.alertController.create({
          header: 'Peticion Exitosa',
          message: 'Sus datos se han actualizado correctamente',
          buttons: ['Aceptar'],
        });
        me.state_nombres = true;
        me.state_apellidos = true;
        me.state_tID = true;
        me.state_doc = true;
        me.state_genero = true;
        me.state_telefono = true;
        me.state_direccion = true;

        await alert.present();
      });
    this.loading.hideLoad();
  }
}
