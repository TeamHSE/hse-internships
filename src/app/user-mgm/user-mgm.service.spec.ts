import { TestBed } from '@angular/core/testing';

import { UserMgmService } from './user-mgm.service';

describe('UserMgmService', () => {
  let service: UserMgmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserMgmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
