import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Status, UserMgmService } from "../user-mgm/user-mgm.service";
import { EnumValue } from "@angular/compiler-cli/src/ngtsc/partial_evaluator";

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

  selectedStatus = 'Student'

  constructor(private userService: UserMgmService) {
  }

  onSelectedStatus(value: string) {
    this.selectedStatus = value
  }

  loginHandle() {
    this.userService.login(
      this.loginFormGroup.controls.emailField.value!,
      this.loginFormGroup.controls.passwordField.value!)
  }

  statuses: { [key: string]: Status } = {
    'Student': Status.Student,
    'Hse': Status.Hse,
    'Employer': Status.Employer,
  }
}
