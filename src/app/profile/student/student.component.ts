import { Component, computed } from '@angular/core';
import { Status, Tag, UserMgmService } from "../../user-mgm/user-mgm.service";
import { FormsModule } from "@angular/forms";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { EventsMgmService, Event } from "../../internships-mgm/events-mgm.service";

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe
  ],
  styleUrls: [ './student.component.css' ]
})
export class StudentComponent {

  constructor(private userService: UserMgmService,
              private eventsMgmService: EventsMgmService) {
    this.allTags = []
    for (const tagKey in Tag) {
      if (Number(tagKey) >= 0) {
        this.allTags.push(Tag[tagKey])
      }
    }
  }

  currentUser = computed(() => this.userService.currentUser())

  protected readonly status = Status;
  protected readonly allTags: string[] = []
  educationalProgram = "Software Engineering"
  courseNumber = 1
  experience = "No experience"
  currentJob = 'Unemployed'
  skills = ''
  summary = ''
  fullName = ''

  events = computed(() => this.eventsMgmService.fetchEvents())
  selectedMethod = 'none';
  subscribedEvents = computed(() => this.userService.eventsForCurrent())

  addTagHandle(tag: string) {
    this.userService.addTagToCurrent(tag)
  }

  parseEnums(tags: Tag[]) {
    let tagsParsed = []
    for (const tagKey in tags) {
      if (Number(tagKey) >= 0) {
        tagsParsed.push(Tag[tagKey])
      }
    }

    return tagsParsed
  }

  removeTagHandle(tag: string) {
    this.userService.removeTagFromCurrent(tag)
  }

  subscribeToEvent(event: Event) {
    this.userService.subscribeCurrentToEvent(event)
  }

  getTags(event: Event) {
    return this.parseEnums(event.tags).join('; ')
  }
}
