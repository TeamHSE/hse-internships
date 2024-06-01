import { Component, computed, OnInit } from '@angular/core';
import { UserMgmService } from "../user-mgm/user-mgm.service";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-login-menu',
  templateUrl: './login-menu.component.html',
  standalone: true,
  imports: [
    RouterLink
  ],
  styleUrls: [ './login-menu.component.css' ]
})
export class LoginMenuComponent implements OnInit {
  public isAuthenticated = computed(() => this.userService.currentUser() !== null)
  public userName = computed(() => this.userService.currentUser()?.email)

  constructor(private userService: UserMgmService) {
  }

  ngOnInit() {
  }

  handleLogout() {
    this.userService.logout()
  }
}
