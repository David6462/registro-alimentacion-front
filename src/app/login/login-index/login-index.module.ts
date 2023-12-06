import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginIndexPageRoutingModule } from './login-index-routing.module';

import { LoginIndexPage } from './login-index.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginIndexPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [LoginIndexPage]
})
export class LoginIndexPageModule {}
