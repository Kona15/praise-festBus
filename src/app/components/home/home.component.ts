import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BusStopService, BusStop } from '../services/bus-stop.service';
import { Router } from '@angular/router';

interface BusStopWithDistance extends BusStop {
  distance: number;
  time: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  map: any;
  userLocation: { lat: number; lng: number } | null = null;
  nearestBusStops: BusStopWithDistance[] = [];
  currentBusStop: BusStopWithDistance | null = null;
  searchQuery: string = '';
  loading: boolean = false;
  locationName: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private busStopService: BusStopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMap();
    }
  }

  // Function to get location name using reverse geocoding
  getLocationName(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;


    fetch(url)
      .then(response => response.json())
      .then(data => {
        const locationName = data.display_name;
        this.locationName = locationName;
        console.log("User location name:", locationName, ' ', lat, ' ', lng );
      })
      .catch(error => {
        console.error('Error fetching location name:', error);
      });
      console.log(this.locationName)
  }

  loadMap() {
    this.loading = true; // Start loading

    import('leaflet').then(L => {
      this.map = L.map('map').setView([6.4667, 3.3250], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      // Attempt to locate user and handle success and error scenarios
      this.map.locate({ setView: true, maxZoom: 16 })
        .on('locationfound', (e: any) => {
          this.userLocation = { lat: e.latitude, lng: e.longitude };

          // Call the reverse geocoding function to get the location name
          this.getLocationName(e.latitude, e.longitude);

          this.setCurrentBusStop(); // Set current bus stop when location is found
          this.findNearestBusStops(); // Find nearest bus stops after setting current stop
          
          // Add a marker for user location
          L.marker([e.latitude, e.longitude])
            .addTo(this.map)
            .bindPopup('You are here')
            .openPopup();

          //add green highlight
          L.circleMarker([e.latitude, e.longitude], {
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.5,
            radius: 10
          }).addTo(this.map);

        })
        .on('locationerror', (e: any) => {
          console.error("Location error:", e.message);
          alert("Unable to retrieve your location. Please ensure location services are enabled.");
          // Fallback zoom to a default location if location not found
          this.map.setView([6.4667, 3.3250], 14);
          this.loading = false; // End loading on error
        });
    });
  }

  // Find nearest bus stops and calculate distance and time using the BusStopService
  findNearestBusStops() {
    if (!this.userLocation || !this.currentBusStop) {
      this.nearestBusStops = [];
      return;
    }
  
    this.nearestBusStops = this.busStopService.getBusStops()
      .filter(busStop => busStop.lat !== this.currentBusStop!.lat || busStop.lng !== this.currentBusStop!.lng)
      .map((busStop: BusStop) => {
        const { distance, duration } = this.busStopService.getRandomDistanceAndDuration(
          this.userLocation!,
          { lat: busStop.lat, lng: busStop.lng },
          40 // Fixed speed
        );
        // console.log(`Bus Stop: ${busStop.name}, Distance: ${distance}, Duration: ${duration}`);
  
        return { ...busStop, distance, time: duration };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

      this.loading = false; // End loading when location found
  }

  // To navigate to report page
  navigateToReport() {
    this.router.navigate(['/report']);
  }

  //Navigate to contact

  navigateToContact() {
    this.router.navigate(['/contacts']);
  }
  
  // Set the current bus stop based on user location
  setCurrentBusStop() {
    if (this.userLocation) {
      const closestStop = this.busStopService.getBusStops().reduce((prev: BusStopWithDistance | null, curr: BusStop) => {
        const { distance, duration } = this.busStopService.getRandomDistanceAndDuration(
          this.userLocation!,
          { lat: curr.lat, lng: curr.lng },
          40
        );

        const currentStopWithDistance: BusStopWithDistance = { ...curr, distance, time: duration };

        if (!prev || distance < prev.distance) {
          return currentStopWithDistance; // Return the stop with distance for comparison
        }
        return prev;
      }, null);

      this.currentBusStop = closestStop; // Set the current bus stop
    }
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    this.searchQuery = query;

    if (query.length >= 3) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  // Function to navigate to route page with selected bus stop details
  navigateToRoutePage(busStop: BusStopWithDistance) {
    if (this.locationName) {
      // Log location name if available
      console.log("Location name found:", this.locationName);
  
      this.router.navigate(['/route'], {
        queryParams: {
          currentLat: this.userLocation?.lat,
          currentLng: this.userLocation?.lng,
          stopLat: busStop.lat,
          stopLng: busStop.lng,
          stopName: busStop.name,
          locationName: this.locationName 
        }
      });
    } else {
      console.log("Location name unavailable");
  
      setTimeout(() => this.navigateToRoutePage(busStop), 500);
    }
  }
  
}
