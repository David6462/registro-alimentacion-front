import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginIndexPage } from './login-index.page';

const routes: Routes = [
  {
    path: '',
    component: LoginIndexPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginIndexPageRoutingModule {}
