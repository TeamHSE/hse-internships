import { Component, computed } from '@angular/core';
import { Status, UserMgmService } from "../user-mgm/user-mgm.service";
import { StudentComponent } from "./student/student.component";
import { NgIf } from "@angular/common";
import { HseComponent } from "./hse/hse.component";
import { EmployerComponent } from "./employer/employer.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    StudentComponent,
    NgIf,
    HseComponent,
    EmployerComponent
  ],
  styleUrls: [ './profile.component.css' ]
})
export class ProfileComponent {
  constructor(private userService: UserMgmService) {
  }

  currentUser = computed(() => this.userService.currentUser())
  protected readonly status = Status;
}
