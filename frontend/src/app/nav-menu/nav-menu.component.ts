import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NgClass } from "@angular/common";
import { LoginMenuComponent } from "../login-menu/login-menu.component";

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    RouterLinkActive,
    LoginMenuComponent
  ],
  styleUrls: [ './nav-menu.component.css' ]
})
export class NavMenuComponent {
  isExpanded = false;

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
