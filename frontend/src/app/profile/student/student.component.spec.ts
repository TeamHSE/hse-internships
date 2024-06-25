import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { StudentComponent } from './student.component';
import { UserMgmService, Role } from '../../user-mgm/user-mgm.service';
import { EventsMgmService, Event } from '../../internships-mgm/events-mgm.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';

describe('StudentComponent', () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let mockUserMgmService: jasmine.SpyObj<UserMgmService>;
  let mockEventsMgmService: jasmine.SpyObj<EventsMgmService>;

  beforeEach(async () => {
    mockUserMgmService = jasmine.createSpyObj('UserMgmService',
      [ 'currentUser', 'addTagToCurrent', 'removeTagFromCurrent', 'eventsForCurrent', 'subscribeCurrentToEvent' ]);
    mockEventsMgmService = jasmine.createSpyObj('EventsMgmService', [ 'events' ]);

    await TestBed.configureTestingModule({
      imports: [ FormsModule, DatePipe ],
      declarations: [ StudentComponent ],
      providers: [
        { provide: UserMgmService, useValue: mockUserMgmService },
        { provide: EventsMgmService, useValue: mockEventsMgmService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default values', () => {
    expect(component.educationalProgram).toBe('Программная инженерия');
    expect(component.courseNumber).toBe(1);
    expect(component.experience).toBe('Нет опыта');
    expect(component.currentJob).toBe('Студент');
    expect(component.skills).toBe('');
    expect(component.summary).toBe('');
    expect(component.fullName).toBe('');
    expect(component.allTags).toEqual([ 'ПИ', 'БИ', 'Программирование', 'Архитектура ПО' ]);
    expect(component.selectedMethod).toBe('none');
  });

  it('should call userService.currentUser() in currentUser computed property', () => {
    mockUserMgmService.currentUser.and.returnValue(of({ name: 'Test User' }));
    component.currentUser();
    expect(mockUserMgmService.currentUser).toHaveBeenCalled();
  });

  it('should call eventsMgmService.events() in events computed property', () => {
    const mockEvents: Event[] = [];
    mockEventsMgmService.events.and.returnValue(of(mockEvents));
    component.events();
    expect(mockEventsMgmService.events).toHaveBeenCalled();
  });

  it('should call userService.eventsForCurrent() in subscribedEvents computed property', () => {
    const mockEvents: Event[] = [];
    mockUserMgmService.eventsForCurrent.and.returnValue(of(mockEvents));
    component.subscribedEvents();
    expect(mockUserMgmService.eventsForCurrent).toHaveBeenCalled();
  });

  it('should call userService.addTagToCurrent() in addTagHandle()', () => {
    const tag = 'New Tag';
    component.addTagHandle(tag);
    expect(mockUserMgmService.addTagToCurrent).toHaveBeenCalledWith(tag);
  });

  it('should call userService.removeTagFromCurrent() in removeTagHandle()', () => {
    const tag = 'Old Tag';
    component.removeTagHandle(tag);
    expect(mockUserMgmService.removeTagFromCurrent).toHaveBeenCalledWith(tag);
  });

  it('should call userService.subscribeCurrentToEvent() in subscribeToEvent()', () => {
    const mockEvent: Event = { id: 1, name: 'Test Event', tags: [] };
    component.subscribeToEvent(mockEvent);
    expect(mockUserMgmService.subscribeCurrentToEvent).toHaveBeenCalledWith(mockEvent);
  });

  it('should return concatenated tags in getTags()', () => {
    const mockEvent: Event = { id: 1, name: 'Test Event', tags: [ 'tag1', 'tag2' ] };
    const tags = component.getTags(mockEvent);
    expect(tags).toBe('tag1; tag2');
  });
});
