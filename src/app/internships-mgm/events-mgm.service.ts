import { Injectable } from '@angular/core';
import { Tag } from "../user-mgm/user-mgm.service";

@Injectable({
  providedIn: 'root'
})
export class EventsMgmService {

  constructor() {
  }

  fetchEvents(): Event[] {
    return [
      {
        name: 'Yandex Spring School',
        type: EventType.internship,
        organizerName: 'Yandex',
        tags: [ Tag.IT, Tag.DS, Tag.Internship ],
        endDate: new Date()
      }
    ]
  }
}

interface Event {
  name: string
  type: EventType,
  tags: Tag[],
  organizerName: string
  endDate: Date
}

enum EventType {
  internship = 'Internship',
  project = 'Project',
  event = 'Event',
}
