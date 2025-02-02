import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumOverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: ForumOverviewComponent;
  let fixture: ComponentFixture<ForumOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForumOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
