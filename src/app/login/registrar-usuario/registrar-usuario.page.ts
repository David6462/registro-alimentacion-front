import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AlertController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AuthenticateService } from 'src/app/services/login/authenticate.service';
import { environment } from 'src/environments/environment';
import { CambiarClave } from '../../validators/cambiarClave.validator';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

declare var google: any;

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.page.html',
  styleUrls: ['./registrar-usuario.page.scss'],
})
export class RegistrarUsuarioPage implements OnInit {
  protected urlEndPoint: string = environment.baseUrl;
  protected httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  @ViewChild('map') mapRef?: ElementRef;
  newMap?: GoogleMap;
  currentMarker: any;

  form: FormGroup;

  public photosDoc: any[] = [];
  public photosRostro: any;

  constructor(
    private http: HttpClient,
    private authService: AuthenticateService,
    private storage: Storage,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private loading: LoadingService,
    public toastController: ToastController,
    public formBuilder: FormBuilder,
    public alertController: AlertController
  ) {
    this.form = this.formBuilder.group(
      {
        nombres: [null, Validators.required],
        apellidos: [null, Validators.required],
        email: [null, [Validators.required, Validators.email]],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(12),
            CambiarClave.patternValidatorNumber,
            CambiarClave.patternValidatorCapCase,
            CambiarClave.patternValidatorSmCase,
            CambiarClave.patternValidatorSpcCharacter,
          ],
        ],
        confirmPassword: [null, [Validators.required]],
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
      },
      {
        validator: CambiarClave.passwordMatchValidator,
      }
    );
  }

  async ngOnInit() {
    await this.storage.create();
    await this.createMap();
  }

  protected agregarAuthorizationHeader() {
    let accesToken = this.authService.token;
    let token = this.authService.obtenerDatosToken(accesToken);
    if (token != null) {
      return this.httpHeaders.append(
        'Authorization',
        'Bearer ' + token.access_token
      );
    }
    return this.httpHeaders;
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
          lng: result.lng()
        }
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

  // Llamada a la función para tomar una foto
  async tomarFotoDocumento() {
    const image = await Camera.getPhoto({
      quality: 70,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.photosDoc.push('data:image/jpeg;base64,'+image.base64String);
    this.form.controls['foto_cedula_frente'].setValue(this.photosDoc[0]);
    this.form.controls['foto_cedula_reverso'].setValue(this.photosDoc[1]);
    console.log(this.photosDoc);
  }

  async tomarFotoRostro() {
    const image = await Camera.getPhoto({
      quality: 70,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.photosRostro = 'data:image/jpeg;base64,'+image.base64String;
    this.form.controls['foto_rostro'].setValue(this.photosRostro);
    console.log(this.photosRostro);
  }

  crearUsuario(event: any) {
    event.preventDefault();
    let me = this;
    me.loading.showLoad();
    this.actCreateUser().subscribe(async (res)=>{
      if (res) {
        me.loading.hideLoad();
        const alert = await me.alertController.create({
          header: 'Peticion Exitosa',
          message: 'Sus datos se han guardado correctamente, puede iniciar sesion',
          buttons: [{
            text: 'Aceptar',
            role: 'confirm',
            handler: () => {
              me.salir();
            },
          }]
        });
    
        await alert.present();
      }
    });
  }

  public actCreateUser() {
    return this.http.post<any>(
      this.urlEndPoint + '/createUser',
      this.form.value ,
      { headers: this.httpHeaders }
    );
  }

  salir() {
    this.modalCtrl.dismiss();
  }
}
