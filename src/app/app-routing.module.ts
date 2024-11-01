import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { RouteComponent } from './components/route/route.component';
import { BusInformationComponent } from './components/bus-information/bus-information.component';
import { ReportComponent } from './components/report/report.component';
import { ContactComponent } from './components/contact/contact.component';

const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent},
  { path: 'search', component: SearchComponent },
  { path: 'route', component: RouteComponent },
  { path: 'buses', component: BusInformationComponent },
  { path: 'report', component: ReportComponent },
  { path: 'contacts',component: ContactComponent }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
