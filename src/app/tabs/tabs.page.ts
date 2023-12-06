import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticateService } from '../services/login/authenticate.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  protected urlEndPoint: string = environment.baseUrl;
  protected httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(
    private http: HttpClient,
    private authService: AuthenticateService,
    private storage: Storage,
  ) {}

  async ngOnInit(){
    await this.storage.create();
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await this.authService.getToken()),
    });
    
  }
}
