import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-employer',
  templateUrl: './employer.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: [ './employer.component.css' ]
})
export class EmployerComponent {
  showAddEventForm: any;

}
