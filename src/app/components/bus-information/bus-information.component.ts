import { Component, OnInit } from '@angular/core';
import { BusStopService, BusStop } from '../services/bus-stop.service';

@Component({
  selector: 'app-bus-information',
  templateUrl: './bus-information.component.html',
  styleUrls: ['./bus-information.component.css']
})
export class BusInformationComponent implements OnInit {
  searchQuery: string = '';
  searchResults: BusStop[] = [];

  constructor(private busStopService: BusStopService) {}

  ngOnInit(): void {}

  onSearchChange(query: string): void {
    this.searchQuery = query;
    if (this.searchQuery.length >= 1) {
      this.searchResults = this.busStopService.searchBusNumbers(this.searchQuery);
    } else {
      this.searchResults = [];
    }
  }
}
