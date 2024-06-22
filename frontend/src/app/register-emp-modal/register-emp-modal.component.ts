import { Component } from '@angular/core';
import { NgForOf } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppUser, Status, UserMgmService } from "../user-mgm/user-mgm.service";

@Component({
  selector: 'app-register-emp-modal',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './register-emp-modal.component.html',
  styleUrl: './register-emp-modal.component.css'
})
export class RegisterEmpModalComponent {
  protected employer: AppUser = {
    email: '',
    subscribedTo: [],
    tags: [],
    status: Status.Employer,
    pass: ''
  }

  constructor(protected activeModal: NgbActiveModal,
              private userMgmService: UserMgmService) {
  }

  handleSubmit() {
    this.userMgmService.register(this.employer.email, this.employer.pass, this.employer.status)
    this.activeModal.close()
  }
}
