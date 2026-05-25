import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchTutorPage } from './search-tutor.page';

describe('SearchTutorPage', () => {
  let component: SearchTutorPage;
  let fixture: ComponentFixture<SearchTutorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTutorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
