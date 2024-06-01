import { Component, computed } from '@angular/core';
import { EventsMgmService, Event, EventType } from "../../internships-mgm/events-mgm.service";
import { NgForOf } from "@angular/common";
import { EventModalComponent } from "../../add-event-modal/event-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserMgmService } from "../../user-mgm/user-mgm.service";
import { RegisterEmpModalComponent } from "../../register-emp-modal/register-emp-modal.component";

@Component({
  selector: 'app-hse',
  templateUrl: './hse.component.html',
  standalone: true,
  imports: [
    NgForOf
  ],
  styleUrls: [ './hse.component.css' ]
})
export class HseComponent {
  constructor(protected eventsMgmService: EventsMgmService,
              protected userMgmService: UserMgmService,
              private modalService: NgbModal) {
  }

  addEvent() {
    let modal = this.modalService.open(EventModalComponent)
    let event: Event = {
      id: Date.now(),
      tags: [],
      endDate: new Date(),
      name: 'New event',
      type: EventType.internship,
      organizerName: '',
      responded: [],
      description: ''
    }
    modal.componentInstance.setEvent(event)
    modal.componentInstance.setSubmitCallback(() => {
      this.eventsMgmService.addEvent(event)
    })
  }

  editEvent(event: Event) {
    let modal = this.modalService.open(EventModalComponent)
    modal.componentInstance.setEvent(event)
    modal.componentInstance.setSubmitCallback(() => {
      this.eventsMgmService.updateEvent(event)
    })
  }

  deleteEvent(event: Event) {
    this.eventsMgmService.deleteEvent(event)
  }

  registerEmployer() {
    this.modalService.open(RegisterEmpModalComponent)
  }
}
