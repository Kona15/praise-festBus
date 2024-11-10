  import { Component, OnInit } from '@angular/core'; 
  import { BusStopService } from '../services/bus-stop.service';
  import { Router, ActivatedRoute } from '@angular/router'; // Import Router and ActivatedRoute services

  @Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
  })
  export class SearchComponent implements OnInit {
    fromInput: string = '';
    toInput: string = '';
    fromResults: string[] = [];
    toResults: string[] = [];
    travelDetails: { arrivalTime: string; dropOffTime: string; duration: string } | null = null;
    fromHistory: string[] = [];
    toHistory: string[] = [];
    activeInput: 'from' | 'to' = 'from'; 
    showHistory: boolean = true; 
    loading: boolean = false;
    hoverHistoryItem: string | null = null; 
    errorMessage: string = '';


    constructor(
      private busStopService: BusStopService,
      private router: Router,
      private route: ActivatedRoute // Inject ActivatedRoute
    ) {}

    ngOnInit(): void {
      // Load search history from local storage
      if (typeof window !== 'undefined' && window.localStorage) {
        const fromHistory = JSON.parse(localStorage.getItem('fromHistory') || '[]');
        const toHistory = JSON.parse(localStorage.getItem('toHistory') || '[]');

        this.fromHistory = fromHistory; 
        this.toHistory = toHistory; 
      }

      // Retrieve 'q' query parameter and set it to 'fromInput'
      this.route.queryParams.subscribe(params => {
        if (params['q']) {
          this.fromInput = params['q'];
        }
      });

      // Ensure history is visible on load
      this.showHistory = this.fromHistory.length > 0 || this.toHistory.length > 0;
    }

    searchFrom(event: any) {
      const query = event.target.value;
      this.fromResults = this.busStopService.searchBusStops(query);
      this.submit();
    }

    searchTo(event: any) {
      const query = event.target.value;
      this.toResults = this.busStopService.searchBusStops(query);
      this.submit();
    }

    selectFrom(busStopName: string) {
      this.fromInput = busStopName;
      this.fromResults = [];
      this.submit();
    }

    selectTo(busStopName: string) {
      this.toInput = busStopName;
      this.toResults = [];
      this.submit();
    }

    submit() {

      this.errorMessage = '';

      if (!this.fromInput || !this.toInput) {
        this.errorMessage = 'Please enter both "From" and "To" bus stops.';
        return;
      }
      // Handle the submission of the form with 'from' and 'to' inputs
      if (this.fromInput && this.toInput) {
        if (this.fromInput === this.toInput) {
          console.error('Invalid journey: "From" and "To" inputs are the same.');
          this.errorMessage = 'invalid journey';
          return;
        }

          // Check if either input is not a valid bus stop
    const isFromValid = this.busStopService.isValidBusStop(this.fromInput);
    const isToValid = this.busStopService.isValidBusStop(this.toInput);

    if (!isFromValid || !isToValid) {
      this.errorMessage = 'Please input a valid bus stop for both "From" and "To".';
      return;
    }

        


        this.loading = true; // Start loading
        console.log(`From: ${this.fromInput}, To: ${this.toInput}`);
    
        // Calculate travel details
        this.calculateTravelDetails();
    
        // Save to history
        this.saveToHistory(this.fromInput, 'from');
        this.saveToHistory(this.toInput, 'to');
    
        // Hide history after search
        this.showHistory = false;
      } else {
        console.log('Please select both from and to bus stops.');
      }
    }
    

    calculateTravelDetails() {
      const fromCoords = this.busStopService.getBusStopCoordinates(this.fromInput);
      const toCoords = this.busStopService.getBusStopCoordinates(this.toInput);
    
      if (!fromCoords || !toCoords) {
        console.error('Invalid bus stop names or coordinates not found');
        return;
      }
    
      // Set the average bus speed (km/h)
      const averageSpeed = 40;
    
      const { distance, duration } = this.busStopService.getRandomDistanceAndDuration(fromCoords, toCoords, averageSpeed);
    
      // Simulate a delay of 1 seconds to show the loading animation
      setTimeout(() => {
        // Get current time and calculate the drop-off time
        const currentDate = new Date();
        const arrivalTime = new Date(currentDate.getTime() + 10 * 60000);
        const durationInMinutes = parseInt(duration.split(' ')[0], 10); // Extract the minutes
        const dropOffTime = new Date(arrivalTime.getTime() + durationInMinutes * 60 * 1000);
    
        // Format the times
        this.travelDetails = {
          arrivalTime: this.formatTime(arrivalTime),
          dropOffTime: this.formatTime(dropOffTime),
          duration, 
        };
        this.loading = false; 
      }, 1000); // Delay of 1 seconds (1000 milliseconds)
    }
    

    formatTime(date: Date): string {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    saveToHistory(input: string, type: 'from' | 'to') {
      // Save to the appropriate history based on input type
      if (type === 'from') {
        if (!this.fromHistory.includes(input)) {
          this.fromHistory.push(input);
          localStorage.setItem('fromHistory', JSON.stringify(this.fromHistory));
        }
      } else if (type === 'to') {
        if (!this.toHistory.includes(input)) {
          this.toHistory.push(input);
          localStorage.setItem('toHistory', JSON.stringify(this.toHistory));
        }
      }
    }

    useHistory(busStopName: string) {
      // Use history based on active input
      if (this.activeInput === 'from') {
        this.fromInput = busStopName;
        this.fromResults = []; 
      } else {
        this.toInput = busStopName;
        this.toResults = [];
      }

      this.submit();
      
      this.showHistory = false;
    }

    clearHistory() {
      this.fromHistory = [];
      this.toHistory = [];
      localStorage.removeItem('fromHistory');
      localStorage.removeItem('toHistory');
      this.showHistory = false;
    }
    
    deleteFromHistory(item: string) {
      this.fromHistory = this.fromHistory.filter(historyItem => historyItem !== item);
      localStorage.setItem('fromHistory', JSON.stringify(this.fromHistory));
    }
    
    deleteToHistory(item: string) {
      this.toHistory = this.toHistory.filter(historyItem => historyItem !== item);
      localStorage.setItem('toHistory', JSON.stringify(this.toHistory));
    }
    

    setActiveInput(input: 'from' | 'to') {
      this.activeInput = input;
      this.showHistory = true;
    }

    // New method to navigate to route page with query parameters
    navigateToRoute() {
      if (this.travelDetails) {
        this.router.navigate(['/route'], {
          queryParams: {
            from: this.fromInput,
            to: this.toInput,
            arrivalTime: this.travelDetails.arrivalTime,
            dropOffTime: this.travelDetails.dropOffTime,
            duration: this.travelDetails.duration,
          },
        });
      }
    }

  }
