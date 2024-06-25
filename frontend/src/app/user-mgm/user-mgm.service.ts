import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { AppUser, HseEvent } from "../models";
import { environment } from "../../environments/environment";

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

  register(email: string, pass: string, role: string) {
    fetch(`${ environment.BASE_API_URL }/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, pass, role }),
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  login(email: string, pass: string) {
    fetch(`${ environment.BASE_API_URL }/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, pass }),
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        this.currentUser.set(data);
        localStorage.setItem('currentUser', JSON.stringify(data));
      });
  }


  logout() {
    fetch(`${ environment.BASE_API_URL }/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        this.currentUser.set(null);
        localStorage.removeItem('currentUser');
      });
  }

  addTagToCurrent(tag: string) {
    const userId = this.currentUser()?.email;
    fetch(`${ environment.BASE_API_URL }/users/${ userId }/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ tag }),
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  removeTagFromCurrent(tag: string) {
    const userId = this.currentUser()?.email;
    fetch(`${ environment.BASE_API_URL }/users/${ userId }/tags/${ tag }`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  subscribeCurrentToEvent(event: HseEvent) {
    const userId = this.currentUser()?.email;
    fetch(`${ environment.BASE_API_URL }/users/${ userId }/events/${ event.id }`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => this.currentUser.set(data));
  }

  eventsForCurrent = computed(() => this.currentUser()?.subscribedTo)
}
