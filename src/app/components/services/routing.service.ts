import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  private osrmUrl = 'http://router.project-osrm.org/route/v1/driving';

  constructor(private http: HttpClient) {}

  getDistance(fromCoords: { lat: number; lng: number }, toCoords: { lat: number; lng: number }): Observable<any> {
    const url = `${this.osrmUrl}/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=false`;
    return this.http.get(url);
  }
}
