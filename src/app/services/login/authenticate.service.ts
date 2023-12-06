import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  protected urlEndPoint: string = environment.baseUrl;
  protected httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  public token: string = '';

  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) { }

  login(credenciales: any) {
    return this.http.post(this.urlEndPoint + '/auth', credenciales);
  }

  obtenerDatosToken(accessToken: string): any {
    if (accessToken != null) {
      return JSON.parse(accessToken);
    }
    return null;
  }

  guardarUser(user: string): void {
    this.storage.set('user', user);
  }

  guardarToken(accessToken: string): void {
    this.token = accessToken;
    this.storage.set('token', accessToken);
  }

  async getToken() {
    const token = await this.storage.get('token');
    const t = JSON.parse(token);
    return t.access_token;
  }

  async getDataUser() {
    let userString = await this.storage.get('user');
    return JSON.parse(userString);
  }
}
