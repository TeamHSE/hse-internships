import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { Event } from "../internships-mgm/events-mgm.service";

@Injectable({
  providedIn: 'root'
})
export class UserMgmService {
  tags: { [key: string]: Tag } = {
    'IT': Tag.IT,
    'DS': Tag.DS,
    'Backend': Tag.Backend,
    'Frontend': Tag.Frontend,
    'Management': Tag.Management,
    'Internship': Tag.Internship,
    'Project': Tag.Project,
    'Event': Tag.Event,
  };

  constructor() {
  }

  currentUser: WritableSignal<AppUser | null> = signal(JSON.parse(localStorage.getItem("user")!))

  register(user: AppUser) {
    this.currentUser.set(user)
    localStorage.setItem("user", JSON.stringify(user))
  }

  logout() {
    this.currentUser.set(null)
    localStorage.removeItem("user")
  }

  addTagToCurrent(tag: string) {
    if (this.currentUser()?.tags.indexOf(this.tags[tag]) ?? -1 < 0) {
      this.currentUser.update(value => {
        value?.tags.push(this.tags[tag])
        return value
      })
    }
  }

  removeTagFromCurrent(tag: string) {
    if (this.currentUser() !== null) {
      this.currentUser.update(value => {
        value!.tags = value!.tags.filter((t) => t != this.tags[tag])
        return value
      })
    }
  }

  subscribeCurrentToEvent(event: Event) {
    this.currentUser.update(value => {
      if (value === null || (value.subscribedTo.indexOf(event) ?? -1) >= 0) {
        return value
      }
      value.subscribedTo.push(event)
      localStorage.setItem("user", JSON.stringify(value))
      event.responded.push(value)
      return value
    })
  }

  eventsForCurrent = computed(() => this.currentUser()?.subscribedTo)

  login(user: AppUser) {
    this.currentUser.set(user)
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export interface AppUser {
  email: string
  pass: string
  tags: Tag[]
  status: Status
  subscribedTo: Event[]
}

export enum Tag {
  IT,
  DS,
  Backend,
  Frontend,
  Management,
  Internship,
  Project,
  Event,
}

export enum Status {
  Student,
  Hse,
  Employer
}
