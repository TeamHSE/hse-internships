import { ChangeDetectorRef, Component, computed, OnInit, Signal } from '@angular/core';
import { UserMgmService } from "../user-mgm/user-mgm.service";
import { StudentComponent } from "./student/student.component";
import { NgIf } from "@angular/common";
import { HseComponent } from "./hse/hse.component";
import { EmployerComponent } from "./employer/employer.component";
import { AppUser, Roles } from "../models";

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
export class ProfileComponent implements OnInit {
  protected currentUser!: Signal<AppUser | null>;

  constructor(private userService: UserMgmService,) {
  }

  ngOnInit(): void {
    this.currentUser = computed(() => this.userService.currentUser())
  }

  protected readonly Roles = Roles;
}
