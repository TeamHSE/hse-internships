import { Component, computed } from '@angular/core';
import { Status, UserMgmService } from "../../user-mgm/user-mgm.service";
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
    this.allTags = [ 'ПИ', "БИ", "Программирование", "Архитектура ПО" ]
  }

  currentUser = computed(() => this.userService.currentUser())

  protected readonly status = Status;
  protected readonly allTags: string[] = []
  educationalProgram = "Программная инженерия"
  courseNumber = 1
  experience = "Нет опыта"
  currentJob = 'Студент'
  skills = ''
  summary = ''
  fullName = ''

  events = computed(() => this.eventsMgmService.events())
  selectedMethod = 'none';
  subscribedEvents = computed(() => this.userService.eventsForCurrent())

  addTagHandle(tag: string) {
    this.userService.addTagToCurrent(tag)
  }

  removeTagHandle(tag: string) {
    this.userService.removeTagFromCurrent(tag)
  }

  subscribeToEvent(event: Event) {
    this.userService.subscribeCurrentToEvent(event)
  }

  getTags(event: Event) {
    return event.tags.join('; ')
  }
}
