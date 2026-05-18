import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorDetailPage } from './tutor-detail.page';

describe('TutorDetailPage', () => {
  let component: TutorDetailPage;
  let fixture: ComponentFixture<TutorDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
