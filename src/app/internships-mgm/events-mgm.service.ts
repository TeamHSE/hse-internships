import { Injectable, signal, WritableSignal } from '@angular/core';
import { AppUser, Tag } from "../user-mgm/user-mgm.service";

@Injectable({
  providedIn: 'root'
})
export class EventsMgmService {

  public events: WritableSignal<Event[]> = signal(this.fetchEvents())

  constructor() {
    this.events.set(this.fetchEvents())
  }

  private fetchEvents(): Event[] {
    let events = localStorage.getItem("events")
    if (events === null) {
      return []
    }
    return JSON.parse(events)
  }

  addEvent(event: Event) {
    this.events.update(value => {
      value.push(event)
      return value
    })
    localStorage.setItem("events", JSON.stringify(this.events()))
  }

  deleteEvent(event: Event) {
    this.events.update(value => {
      value = value.filter(v => v != event)
      return value
    })
    localStorage.setItem("events", JSON.stringify(this.events()))
  }
}

export interface Event {
  id: number
  name: string
  type: EventType
  tags: Tag[]
  organizerName: string
  endDate: Date
  responded: AppUser[]
  description: string
}

export enum EventType {
  internship = 'Internship',
  project = 'Project',
  event = 'Event',
}
