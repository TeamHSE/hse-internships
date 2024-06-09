import { Injectable, signal, WritableSignal } from '@angular/core';
import { AppUser } from "../user-mgm/user-mgm.service";

@Injectable({
  providedIn: 'root'
})
export class EventsMgmService {

  public events: WritableSignal<Event[]> = signal([])

  constructor() {
    this.fetchEvents()
  }

  private fetchEvents() {
    fetch('/api/events', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => this.events.set(data));
  }

  addEvent(event: Event) {
    fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
      .then(response => response.json())
      .then(data => this.events.update(value => {
        value.push(data);
        return value;
      }));

    this.sendNotification(event)
  }

  private sendNotification(event: Event) {
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
    fetch(`/api/events/${event.id}`, {
      method: 'DELETE',
    })
      .then(() => this.events.update(value => {
        value = value.filter(v => v != event);
        return value;
      }));
  }

  updateEvent(event: Event) {
    fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
      .then(response => response.json())
      .then(data => this.events.update(value => {
        value = value.filter(e => e.id !== data.id);
        value.push(data);
        return value;
      }));
  }
}

export interface Event {
  id: number
  name: string
  type: string
  tags: string[]
  organizerName: string
  endDate: Date
  responded: AppUser[]
  description: string
}
