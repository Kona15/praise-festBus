import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { BusStopService, RouteBusStop } from '../services/bus-stop.service';
import 'leaflet-routing-machine';


@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.css']
})
export class RouteComponent implements OnInit {
  map: any;
  stop: any;
  from: { lat: number; lng: number } | null = null;
  to: { lat: number; lng: number } | null = null;
  fromInput: string | null = null;
  toInput: string | null = null;
  duration: string | null = null;
  arrivalTime: string | null = null;
  dropOffTime: string | null = null;
  loading: boolean = false;
  stopsAlongRoute: RouteBusStop[] = [];
  currentLat: number | null = null;
  currentLng: number | null = null;
  stopLat: number | null = null;
  stopLng: number | null = null;
  stopName: string | null = null;
  locationName: string | null = null;
  totalDistance: string | null = null;
  totalDuration: string | null = null;
  instructions: { text: string; icon: string }[] = [];

  constructor(private route: ActivatedRoute, private busStopService: BusStopService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const fromInput = params['from'];
      const toInput = params['to'];
      const arrivalTime = params['arrivalTime'];
      const dropOffTime = params['dropOffTime'];
      const duration = params['duration'];

      this.currentLat = +params['currentLat'];
      this.currentLng = +params['currentLng'];
      this.locationName = params['locationName'];
      this.stopLat = +params['stopLat'];
      this.stopLng = +params['stopLng'];
      this.stopName = params['stopName'];

      this.duration = params['duration'];
      this.arrivalTime = params['arrivalTime'];
      this.dropOffTime = params['dropOffTime'];

      if( fromInput && toInput) {
        this.fromInput = fromInput;
        this.toInput = toInput;
        this.from = this.busStopService.getBusStopCoordinates(fromInput);
        this.to = this.busStopService.getBusStopCoordinates(toInput);
      } else if (this.currentLat && this.currentLng && this.stopLat && this.stopLng) {
        this.from = { lat: this.currentLat, lng: this.currentLng };
        this.to = { lat: this.stopLat, lng: this.stopLng };
        this.fromInput = this.locationName;
        this.toInput = this.stopName;
      } else{
        console.error('No valid coordinates found for routing.');
      }

      console.log('From coordinates:', this.from?.lat, this.from?.lng);
      console.log('To coordinates:', this.to?.lat, this.to?.lng);
      console.log('Arrival Time:', arrivalTime);
      console.log('Drop Off Time:', dropOffTime);
      console.log('Duration:', duration);
      console.log(fromInput, toInput);

      console.log(this.locationName, this.currentLat, this.currentLng);
      console.log(this.stopName, this.stopLat, this.stopLng);
      
      


      this.initMap();
    });
  }

  initMap() {
    this.map = L.map('map').setView([6.4667, 3.3250], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);


    if (this.from && this.to) {

        // Create markers for 'from' and 'to' locations
    const fromMarker = L.marker([this.from.lat, this.from.lng]).addTo(this.map);
    const toMarker = L.marker([this.to.lat, this.to.lng]).addTo(this.map);

    // Bind popups to the 'from' and 'to' markers with location names
    fromMarker.bindPopup(`<b>From:</b> ${this.fromInput}`).openPopup();
    toMarker.bindPopup(`<b>To:</b> ${this.toInput}`).openPopup();
    
      const plan = new L.Routing.Plan([
        L.latLng(this.from.lat, this.from.lng),
        L.latLng(this.to.lat, this.to.lng)
      ], {
        createMarker: (i, waypoint) => {
          return L.marker(waypoint.latLng);
        }
      });

      this.displayStopsAlongRoute();

      const routingControl = L.Routing.control({
        plan: plan,
        routeWhileDragging: true,
        show: false,
      }).addTo(this.map);


      routingControl.on('routesfound', (e) => {
        const routes = e.routes;
        const summary = routes[0].summary;

        this.totalDistance = (summary.totalDistance / 1000).toFixed(2) + ' km';
        this.totalDuration = (summary.totalTime / 60).toFixed(2) + ' mins';

        

        // Map icons based on keywords in the instructions
        this.instructions = routes[0].instructions.map((instruction: { text: string }) => {
          let iconClass = 'fa-arrow-right';

          if (instruction.text.toLowerCase().includes('left')) {
            iconClass = 'fa-arrow-left';
          } else if (instruction.text.toLowerCase().includes('right')) {
            iconClass = 'fa-arrow-right';
          } else if (instruction.text.toLowerCase().includes('continue') || instruction.text.toLowerCase().includes('straight')) {
            iconClass = 'fa-arrow-up';
          } else if (instruction.text.toLowerCase().includes('destination')) {
            iconClass = 'fa-flag-checkered';
          }

          return { text: instruction.text, icon: iconClass };
        });
      });


    } else {
      console.error('Coordinates for from or to are not available');
    }
  }

  displayStopsAlongRoute() {
    if (!this.from || !this.to) return;

    // Get stops along the route from BusStopService
    const stops = this.busStopService.getStopsAlongRoute(this.from, this.to);
    this.stopsAlongRoute = stops;

    stops.forEach((stop) => {
      // Add a marker for each stop on the map
      // const marker = L.marker([stop.lat, stop.lng]).addTo(this.map);
      // marker.bindPopup(`<b>${stop.name}</b><br>Bus Number: ${stop.busNumber}`).openPopup();
    });
  }
}
