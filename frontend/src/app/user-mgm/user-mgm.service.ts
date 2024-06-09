import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { Event } from "../internships-mgm/events-mgm.service";

@Injectable({
  providedIn: 'root'
})
export class UserMgmService {
  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  currentUser: WritableSignal<AppUser | null> = signal(null)

  register(email: string, pass: string, status: Status) {
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, pass, status }),
      credentials: 'include', // This will include the cookie in the request
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  login(email: string, pass: string) {
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, pass }),
      credentials: 'include', // This will include the cookie in the request
    })
      .then(response => response.json())
      .then(data => {
        this.currentUser.set(data);
        localStorage.setItem('currentUser', JSON.stringify(data));
      });
  }


  logout() {
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include', // This will include the cookie in the request
      headers: {
        'Authorization': 'Basic ' + btoa(this.currentUser()?.email + ':' + this.currentUser()?.pass),
      },
    })
      .then(() => {
        this.currentUser.set(null);
        localStorage.removeItem('currentUser');
      });
  }

  addTagToCurrent(tag: string) {
    const userId = this.currentUser()?.email;
    fetch(`/api/users/${ userId }/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(this.currentUser()?.email + ':' + this.currentUser()?.pass),
      },
      body: JSON.stringify({ tag }),
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  removeTagFromCurrent(tag: string) {
    const userId = this.currentUser()?.email;
    fetch(`/api/users/${ userId }/tags/${ tag }`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(this.currentUser()?.email + ':' + this.currentUser()?.pass),
      },
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  subscribeCurrentToEvent(event: Event) {
    const userId = this.currentUser()?.email;
    fetch(`/api/users/${ userId }/events/${ event.id }`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(this.currentUser()?.email + ':' + this.currentUser()?.pass),
      }
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  eventsForCurrent = computed(() => this.currentUser()?.subscribedTo)
}

export interface AppUser {
  email: string
  pass: string
  tags: string[]
  status: Status
  subscribedTo: Event[]
}

export enum Status {
  Student,
  Hse,
  Employer
}
