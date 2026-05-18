import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminViewPage } from './admin-view.page';

describe('AdminViewPage', () => {
  let component: AdminViewPage;
  let fixture: ComponentFixture<AdminViewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
