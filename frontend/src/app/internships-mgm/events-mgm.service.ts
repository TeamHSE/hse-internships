import { Injectable, signal, WritableSignal } from '@angular/core';
import { HseEvent } from "../models";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EventsMgmService {

  public events: WritableSignal<HseEvent[]> = signal([])

  constructor() {
    this.fetchEvents()
  }

  private fetchEvents() {
    fetch(`${ environment.BASE_API_URL }/api/events`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => this.events.set(data));
  }

  addEvent(event: HseEvent) {
    fetch(`${ environment.BASE_API_URL }/api/events`, {
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

  private sendNotification(event: HseEvent) {
    const myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "users": [
        {
          "target_id": "926188677", // todo
          "target": "telegram"
        },
      ],
      "event_name": event.name,
      "event_link": event.organizerName.length > 0 ? event.organizerName.length : "none"
    });
    fetch(`${environment.SENDER_API_BASE_URL}/send_message`, {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    })
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }

  deleteEvent(event: HseEvent) {
    fetch(`${ environment.BASE_API_URL }/events/${ event.id }`, {
      method: 'DELETE',
    })
      .then(() => this.events.update(value => {
        value = value.filter(v => v != event);
        return value;
      }));
  }

  updateEvent(event: HseEvent) {
    fetch(`${ environment.BASE_API_URL }/events/${ event.id }`, {
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
