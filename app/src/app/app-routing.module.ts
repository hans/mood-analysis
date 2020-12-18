import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';


const routes: Routes = [
  { path: "form", component: FormComponent },
  { path: "list", component: ListComponent },

  { path: "", redirectTo: "list", pathMatch: "full" },
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
