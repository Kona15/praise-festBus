import { Injectable } from '@angular/core';
// import { log } from 'console';

export interface BusStop {
  name: string;
  lat: number;
  lng: number;
  distance?: number; 
  busNumber?: number;
}

export interface RouteBusStop {
  name: string;
  lat: number;
  lng: number;
  distance: number;
  timeToReach: string;
}


export interface RouteBusStop extends BusStop {
  timeToReach: string; // New property for time to reach the bus stop
}

@Injectable({
  providedIn: 'root',
})
export class BusStopService {
  private busStops: BusStop[] = [
    { name: '1st Avenue', lat: 6.4667, lng: 3.3250, busNumber: 1 },
    { name: '2nd Avenue', lat: 6.4680, lng: 3.3275, busNumber: 2 },
    { name: '3rd Avenue', lat: 6.4672, lng: 3.3281, busNumber: 3  },
    { name: '4th Avenue', lat: 6.4660, lng: 3.3295, busNumber: 4  },
    { name: '5th Avenue', lat: 6.4695, lng: 3.3292, busNumber: 5  },
    { name: '6th Avenue', lat: 6.4702, lng: 3.3269, busNumber: 6  },
    { name: '7th Avenue', lat: 6.4700, lng: 3.3300, busNumber: 7  },
    { name: '8th Avenue', lat: 6.4708, lng: 3.3304, busNumber: 8  },
    { name: '10th Avenue', lat: 6.4688, lng: 3.3288, busNumber: 9  },
    { name: 'Alakija Bus Stop', lat: 6.4600, lng: 3.3256, busNumber: 10  },

    // Closures under Avenues in Festac Town
    { name: '1st Close, 1st Avenue', lat: 6.4669, lng: 3.3245, busNumber: 11  },
    { name: '2nd Close, 1st Avenue', lat: 6.4671, lng: 3.3247, busNumber: 12  },
    { name: '3rd Close, 1st Avenue', lat: 6.4673, lng: 3.3251, busNumber: 13  },
    { name: '23rd Close, 1st Avenue', lat: 6.4690, lng: 3.3310, busNumber: 14  },
    { name: '41st Road, 1st Avenue', lat: 6.4715, lng: 3.3340, busNumber: 15  },

    { name: '1st Close, 2nd Avenue', lat: 6.4681, lng: 3.3261, busNumber: 16  },
    { name: '2nd Close, 2nd Avenue', lat: 6.4683, lng: 3.3263, busNumber: 17  },
    { name: '3rd Close, 2nd Avenue', lat: 6.4685, lng: 3.3266, busNumber: 18  },

    { name: '1st Close, 7th Avenue', lat: 6.4705, lng: 3.3296, busNumber: 19  },
    { name: '2nd Close, 7th Avenue', lat: 6.4707, lng: 3.3299, busNumber: 20  },
    { name: '3rd Close, 7th Avenue', lat: 6.4710, lng: 3.3303, busNumber: 21  },

    // More roads and closes in Festac
    { name: '12th Road, 6th Avenue', lat: 6.4665, lng: 3.3321, busNumber: 22  },
    { name: '15th Road, 6th Avenue', lat: 6.4661, lng: 3.3325, busNumber: 23  },
    { name: '11th Road, 6th Avenue', lat: 6.4670, lng: 3.3332, busNumber: 24  },
    { name: '24th Close, 7th Avenue', lat: 6.4701, lng: 3.3277, busNumber: 25  },

    // Adding Alakija area (major bus stop outside Festac Town)
    { name: 'Alakija Bus Stop', lat: 6.4600, lng: 3.3256, busNumber: 40  },
    { name: 'Alakija Close', lat: 6.4598, lng: 3.3254, busNumber: 43  },
    { name: 'Alakija Market', lat: 6.4595, lng: 3.3251, busNumber: 44  },
  ];

  constructor() {}

  searchBusNumbers(query: string): BusStop[] {
    if (query.length === 0) return [];
    const lowercaseQuery = query.toLowerCase();

    // Filter by bus number if the query matches a number
    return this.busStops.filter((busStop) =>
      busStop.busNumber?.toString().includes(lowercaseQuery)
    );
  }


  searchBusStops(query: string): string[] {
    if (query.length === 0) {
      return [];
    }

    const lowercaseQuery = query.toLowerCase();

    return this.busStops
      .filter(busStop => {
        const busStopName = busStop.name.toLowerCase();

        // Match bus stop names or related closes
        if (busStopName.includes(lowercaseQuery)) {
          return true;
        }

        // Handle avenue queries and suggest related closes
        const avenueMatch = lowercaseQuery.match(/(\d+)(st|nd|rd|th)\s*avenue/);
        if (avenueMatch) {
          const avenueNumber = avenueMatch[1];
          return busStopName.includes(`${avenueNumber}st`) ||
                 busStopName.includes(`${avenueNumber}nd`) ||
                 busStopName.includes(`${avenueNumber}rd`) ||
                 busStopName.includes(`${avenueNumber}th`) ||
                 busStopName.includes('close');
        }

        return false;
      })
      .map(busStop => busStop.name);
  }

  getBusStops(): BusStop[] {
    return this.busStops;
  }

  getBusStopCoordinates(busStopName: string): { lat: number; lng: number } | null {
    const busStop = this.busStops.find(stop => stop.name === busStopName);
    return busStop ? { lat: busStop.lat, lng: busStop.lng } : null;
  }

  getStopsAlongRoute(fromCoords: { lat: number; lng: number }, toCoords: { lat: number; lng: number }): BusStop[] {
    const radius = 0.001; // Adjust this value as needed to determine proximity
    return this.busStops.filter(stop => 
      stop.lat >= Math.min(fromCoords.lat, toCoords.lat) - radius &&
      stop.lat <= Math.max(fromCoords.lat, toCoords.lat) + radius &&
      stop.lng >= Math.min(fromCoords.lng, toCoords.lng) - radius &&
      stop.lng <= Math.max(fromCoords.lng, toCoords.lng) + radius
    );
  }

  // Calculate distance between two coordinates using the Haversine formula
  getDistance(fromCoords: { lat: number; lng: number }, toCoords: { lat: number; lng: number }): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(toCoords.lat - fromCoords.lat);
    const dLng = this.deg2rad(toCoords.lng - fromCoords.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(fromCoords.lat)) * Math.cos(this.deg2rad(toCoords.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c; // Distance in kilometers

    return distanceInKm; // Keep in kilometers for travel time calculation
  }

  // Convert degrees to radians
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Calculate journey duration based on distance and bus speed
  calculateDuration(distanceInKm: number, speedKmH: number): string {
    const durationInHours = distanceInKm / speedKmH;
    const durationInMinutes = Math.round(durationInHours * 60);
    console.log(`Distance: ${distanceInKm} km, Speed: ${speedKmH} km/h, Duration: ${durationInMinutes} min`); // Log the values
    return `${durationInMinutes} min`;
  }

  // Method to generate a random distance based on visual observations
  generateRandomDistance(min: number, max: number): number {
    return Math.random() * (max - min) + min; // Generates a random distance between min and max
  }

    // New method to get a random distance and its corresponding duration
    getRandomDistanceAndDuration(userCoords: { lat: number; lng: number }, busStopCoords: { lat: number; lng: number }, speedKmH: number): { distance: number; duration: string } {
    const actualDistance = this.getDistance(userCoords, busStopCoords);
    const minDistance = Math.max(10.00005, actualDistance - 1);
    const maxDistance = Math.min(30.00005, actualDistance + 1);

    const randomDistance = this.generateRandomDistance(minDistance, maxDistance);
    const duration = this.calculateDuration(randomDistance, speedKmH);

    return { distance: randomDistance, duration };
}

  // Return both distance and duration together (helper method)
  getDistanceAndDuration(fromCoords: { lat: number; lng: number }, toCoords: { lat: number; lng: number }, speedKmH: number) {
    const distance = this.getDistance(fromCoords, toCoords);
    
    let adjustedSpeed = speedKmH;
    if (distance < 1) {
        adjustedSpeed = 20;
    } else if (distance < 2) {
        adjustedSpeed = 30;
    } else if (distance < 3) {
        adjustedSpeed = 40;
    } else {
        adjustedSpeed = 50; // Assuming faster speeds for longer distances
    }
    
    const duration = this.calculateDuration(distance, adjustedSpeed);
    
    return {
      distance,
      duration
    };
  }

  isValidBusStop(busStopName: string): boolean {
    return this.busStops.some(busStop => busStop.name.toLowerCase() === busStopName.toLowerCase());
  }
  

  
}
