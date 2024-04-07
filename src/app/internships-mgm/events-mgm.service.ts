import { Injectable } from '@angular/core';
import { AppUser, Tag } from "../user-mgm/user-mgm.service";

@Injectable({
  providedIn: 'root'
})
export class EventsMgmService {

  constructor() {
    localStorage.setItem("events", JSON.stringify([ {
      name: 'Yandex Spring School',
      type: EventType.internship,
      organizerName: 'Yandex',
      tags: [ Tag.IT, Tag.DS, Tag.Internship ],
      endDate: new Date(),
      responded: []
    } ]))
  }

  fetchEvents(): Event[] {
    let events = localStorage.getItem("events")
    if (events === null) {
      return []
    }
    return JSON.parse(events)
  }
}

export interface Event {
  name: string
  type: EventType
  tags: Tag[]
  organizerName: string
  endDate: Date
  responded: AppUser[]
}

enum EventType {
  internship = 'Internship',
  project = 'Project',
  event = 'Event',
}
