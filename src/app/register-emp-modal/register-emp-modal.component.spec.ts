import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEmpModalComponent } from './register-emp-modal.component';

describe('RegisterEmpModalComponent', () => {
  let component: RegisterEmpModalComponent;
  let fixture: ComponentFixture<RegisterEmpModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterEmpModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterEmpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
