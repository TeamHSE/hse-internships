import { Component, effect, signal } from '@angular/core';
import { EventsMgmService } from "../../internships-mgm/events-mgm.service";
import { NgForOf } from "@angular/common";
import { EventModalComponent } from "../../add-event-modal/event-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserMgmService } from "../../user-mgm/user-mgm.service";
import { EventTypes, HseEvent } from "../../models";

@Component({
  selector: 'app-employer',
  templateUrl: './employer.component.html',
  standalone: true,
  imports: [
    NgForOf
  ],
  styleUrls: [ './employer.component.css' ]
})
export class EmployerComponent {
  companyEvents = signal<HseEvent[]>(this.eventsMgmService.events()
    .filter(value => value.organizerName === this.userMgmService.currentUser()?.email));

  constructor(protected eventsMgmService: EventsMgmService,
              protected userMgmService: UserMgmService,
              private modalService: NgbModal) {
    effect(() => {
      this.companyEvents.set(this.eventsMgmService.events()
        .filter(value => value.organizerName === this.userMgmService.currentUser()?.email))
    });
  }

  addEvent() {
    let modal = this.modalService.open(EventModalComponent)
    let event: HseEvent = {
      id: Date.now(),
      tags: [],
      endDate: new Date(),
      name: 'Новое событие',
      type: EventTypes[0],
      organizerName: this.userMgmService.currentUser()?.email!,
      responded: [],
      description: ''
    }
    modal.componentInstance.setEvent(event)
    modal.componentInstance.setSubmitCallback(() => {
      this.eventsMgmService.addEvent(event)
    })
  }

  editEvent(event: HseEvent) {
    let modal = this.modalService.open(EventModalComponent)
    modal.componentInstance.setEvent(event)
    modal.componentInstance.setSubmitCallback(() => {
      this.eventsMgmService.updateEvent(event)
    })
  }

  deleteEvent(event: HseEvent) {
    this.eventsMgmService.deleteEvent(event)
  }
}
