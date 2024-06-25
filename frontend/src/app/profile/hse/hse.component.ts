import { Component } from '@angular/core';
import { EventsMgmService } from "../../internships-mgm/events-mgm.service";
import { NgForOf } from "@angular/common";
import { EventModalComponent } from "../../add-event-modal/event-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserMgmService } from "../../user-mgm/user-mgm.service";
import { RegisterEmpModalComponent } from "../../register-emp-modal/register-emp-modal.component";
import { EventTypes, HseEvent } from "../../models";

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
    let event: HseEvent = {
      id: Date.now(),
      tags: [],
      endDate: new Date(),
      name: 'Новое событие',
      type: EventTypes[0],
      organizerName: '',
      responded: [],
      description: ''
    }
    modal.componentInstance.setEvent(event)
    modal.componentInstance.setSubmitCallback(() => {
      this.eventsMgmService.addEvent(event)
    })
  }

  editEvent(event: HseEvent) {
    const modal = this.modalService.open(EventModalComponent)
    modal.componentInstance.setEvent(event)
    modal.componentInstance.setSubmitCallback(() => {
      this.eventsMgmService.updateEvent(event)
    })
  }

  deleteEvent(event: HseEvent) {
    this.eventsMgmService.deleteEvent(event)
  }

  registerEmployer() {
    this.modalService.open(RegisterEmpModalComponent)
  }
}
