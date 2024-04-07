import { Component, computed } from '@angular/core';
import { Status, UserMgmService } from "../user-mgm/user-mgm.service";
import { StudentComponent } from "./student/student.component";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    StudentComponent,
    NgIf
  ],
  styleUrls: [ './profile.component.css' ]
})
export class ProfileComponent {
  constructor(private userService: UserMgmService) {
  }

  currentUser = computed(() => this.userService.currentUser())
  protected readonly status = Status;
}
