import { Component } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Event, EventType } from "../internships-mgm/events-mgm.service"
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-add-event-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.css'
})
export class EventModalComponent {
  protected event!: Event
  private callback: () => void = () => console.log('No submit set')

  constructor(protected activeModal: NgbActiveModal,) {
  }

  public setEvent(event: Event) {
    this.event = event
  }

  handleSubmit() {
    this.callback()
    this.activeModal.close()
  }

  public setSubmitCallback(callback: () => void) {
    this.callback = callback
  }
}
