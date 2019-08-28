import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaysAndResultComponent } from './plays-and-result.component';

describe('PlaysAndResultComponent', () => {
  let component: PlaysAndResultComponent;
  let fixture: ComponentFixture<PlaysAndResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaysAndResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaysAndResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
