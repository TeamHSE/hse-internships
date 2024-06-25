import { Component } from '@angular/core';
import { NgForOf } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UserMgmService } from "../user-mgm/user-mgm.service";
import { AppUser, Roles } from "../models";

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
    role: Roles[2],
    pass: ''
  }

  constructor(protected activeModal: NgbActiveModal,
              private userMgmService: UserMgmService) {
  }

  handleSubmit() {
    this.userMgmService.register(this.employer.email, this.employer.pass, this.employer.role)
    this.activeModal.close()
  }
}
