import { Routes } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent, pathMatch: "full" },
  { path: 'auth/register', component: RegisterComponent, pathMatch: "full" },
  { path: 'profile', component: ProfileComponent, pathMatch: "full" },
];
