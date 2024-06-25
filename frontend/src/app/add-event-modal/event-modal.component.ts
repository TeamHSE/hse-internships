import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { EventTypes, HseEvent, Tags } from "../models";
import { ListItem } from "ng-multiselect-dropdown/multiselect.model";

@Component({
  selector: 'app-add-event-modal',
  standalone: true,
  imports: [
    FormsModule,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.css'
})
export class EventModalComponent implements OnInit {
  @Input() protected projEvent!: HseEvent;

  tagOptions: { item_id: number, item_text: string }[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Выбрать все',
    unSelectAllText: 'Убрать все',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  private callback: () => void = () => console.log('No submit set');

  constructor(protected activeModal: NgbActiveModal, private cdr: ChangeDetectorRef) {
  }

  public setEvent(event: HseEvent) {
    this.projEvent = event;
    this.selectedTags = event.tags;
    this.cdr.detectChanges();
  }

  handleSubmit() {
    this.projEvent.tags = this.selectedTags
    this.callback();
    this.activeModal.close();
  }

  public setSubmitCallback(callback: () => void) {
    this.callback = callback;
  }

  ngOnInit() {
    this.tagOptions = Tags.map((key, index) => ({
      item_id: index,
      item_text: key
    }));
  }

  protected readonly EventTypes = EventTypes;
  protected readonly Tags = Tags;

  protected selectedTags: string[] = [];

  onItemSelect($event: ListItem) {
    this.selectedTags.push($event.text.toString());
  }
}
