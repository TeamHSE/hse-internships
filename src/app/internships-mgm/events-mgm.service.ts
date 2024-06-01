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

    this.callApi(event)
  }

  private callApi(event: Event) {
    const myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "users": [
        {
          "target_id": "289448982",
          "target": "telegram"
        },
      ],
      "event_name": event.name,
      "event_link": event.organizerName.length > 0 ? event.organizerName.length : "none"
    });
    fetch("https://hack-bot.cleverapps.io/send_message", {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    })
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));


  }

  deleteEvent(event: Event) {
    this.events.update(value => {
      value = value.filter(v => v != event)
      return value
    })
    localStorage.setItem("events", JSON.stringify(this.events()))
  }

  updateEvent(event: Event) {
    this.events.update(value => {
      value = value.filter(e => e.id !== event.id)
      value.push(event)
      return value
    })
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
