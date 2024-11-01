import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusInformationComponent } from './bus-information.component';

describe('BusInformationComponent', () => {
  let component: BusInformationComponent;
  let fixture: ComponentFixture<BusInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
