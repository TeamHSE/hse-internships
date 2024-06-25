import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserMgmService } from "../user-mgm/user-mgm.service";
import { Roles } from "../models";

// The main responsibility of this component is to handle the user's login process.
// This is the starting point for the login process. Any component that needs to authenticate
// a user can simply perform a redirect to this component with a returnUrl query parameter and
// let the component perform the login and return back to the return url.
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: [ './login.component.css' ]
})
export class LoginComponent {
  loginFormGroup = new FormGroup({
    emailField: new FormControl('', [ Validators.required, Validators.email ]),
    passwordField: new FormControl('', [ Validators.required ]),
  })

  selectedRole = Roles[0]

  constructor(private userService: UserMgmService) {
  }

  onSelectedStatus(value: string) {
    this.selectedRole = value
  }

  loginHandle() {
    this.userService.login(
      this.loginFormGroup.controls.emailField.value!,
      this.loginFormGroup.controls.passwordField.value!
    )
  }

  protected readonly Roles = Roles;
}
