import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BusStopService, BusStop, RouteBusStop } from '../services/bus-stop.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.css']
})
export class RouteComponent implements OnInit {
  from: string = '';
  to: string = '';
  arrivalTime: string = '';
  dropOffTime: string = '';
  duration: string = '';
  stopsAlongRoute: RouteBusStop[] = [];

  private map: any;
  private leaflet: any;
  private Routing: any;
  private fromCoords: { lat: number; lng: number } | null = null;
  private toCoords: { lat: number; lng: number } | null = null;

  constructor(
    private route: ActivatedRoute,
    private busStopService: BusStopService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.from = params['from'] || '';
      this.to = params['to'] || '';
      this.arrivalTime = params['arrivalTime'] || '';
      this.dropOffTime = params['dropOffTime'] || '';
      this.duration = params['duration'] || '';

      this.loadMap();
    });
  }

  
async loadMap() {
  if (isPlatformBrowser(this.platformId)) {
    const L = await import('leaflet');
    const Routing = await import('leaflet-routing-machine');
    this.leaflet = L;
    this.Routing = Routing;

    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Festac coordinates to use as a default center when no 'from' and 'to'
    const festacCoords = { lat: 6.465422, lng: 3.406448 }; // Replace with actual Festac coordinates if needed

    // Set coordinates for map view based on 'from' and 'to' inputs
    this.fromCoords = this.from ? this.busStopService.getBusStopCoordinates(this.from) : null;
    this.toCoords = this.to ? this.busStopService.getBusStopCoordinates(this.to) : null;

    // Determine the center of the map based on provided or default coordinates
    const centerCoords = (this.fromCoords && this.toCoords) ? this.fromCoords : festacCoords;
    this.map = this.leaflet.map('map').setView([centerCoords.lat, centerCoords.lng], 13);

    // Add the OpenStreetMap layer
    this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 16,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Only add route if 'from' and 'to' coordinates are defined
    if (this.fromCoords && this.toCoords) {
      this.addMarkersAndRoute(this.fromCoords, this.toCoords);
      const defaultSpeedKmH = 30; // Default speed in km/h
      this.fetchStopsAlongRoute(this.fromCoords, this.toCoords, defaultSpeedKmH);
    }
  } else {
    console.error('Not running in a browser environment. Map cannot be loaded.');
  }
}

  fetchStopsAlongRoute(fromLatLng: { lat: number; lng: number }, toLatLng: { lat: number; lng: number }, speedKmH: number) {
    this.stopsAlongRoute = this.busStopService.getStopsAlongRoute(fromLatLng, toLatLng)
      .filter(stop => 
        !(stop.lat === fromLatLng.lat && stop.lng === fromLatLng.lng) &&
        !(stop.lat === toLatLng.lat && stop.lng === toLatLng.lng)
      )
      .map(stop => {
        const { distance, duration } = this.busStopService.getRandomDistanceAndDuration(fromLatLng, { lat: stop.lat, lng: stop.lng }, speedKmH);
        return { ...stop, distance, timeToReach: duration } as RouteBusStop;
      });
  
    console.log('Stops along route with distance and duration:', this.stopsAlongRoute);
  }
  

  calculateTimeToReach(distance: number): number {
    const averageSpeed = 30; // Example speed in km/h
    const timeInMinutes = (distance / averageSpeed) * 60;
    return Math.round(timeInMinutes);
  }

  addMarkersAndRoute(fromLatLng: { lat: number, lng: number }, toLatLng: { lat: number, lng: number }) {
    const { leaflet, map } = this;

    leaflet.marker([fromLatLng.lat, fromLatLng.lng])
      .addTo(map)
      .bindPopup(`From: ${this.from}`)
      .openPopup();

    leaflet.marker([toLatLng.lat, toLatLng.lng])
      .addTo(map)
      .bindPopup(`To: ${this.to}`)
      .openPopup();

    map.fitBounds([fromLatLng, toLatLng]);
    leaflet.polyline([fromLatLng, toLatLng], { color: 'blue' }).addTo(map);
  }
}
