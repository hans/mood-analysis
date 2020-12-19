import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { StatsComponent } from './stats/stats.component';
import { StatsDetailsComponent } from './stats-details/stats-details.component';


const routes: Routes = [
  { path: "form", component: FormComponent },
  { path: "list", component: ListComponent },
  { path: "stats", component: StatsComponent },
  { path: "stats/:id", component: StatsDetailsComponent },

  { path: "", redirectTo: "list", pathMatch: "full" },
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
