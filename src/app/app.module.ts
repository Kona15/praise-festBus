import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from './components/search/search.component';
import { RouteComponent } from './components/route/route.component';
import { BusStopService } from './components/services/bus-stop.service';
import { BusInformationComponent } from './components/bus-information/bus-information.component';
import { ReportComponent } from './components/report/report.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContactComponent } from './components/contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    RouteComponent,
    BusInformationComponent,
    ReportComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule
  ],
  providers: [
    BusStopService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
