import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiMenuPage } from './api-menu.page';

describe('ApiMenuPage', () => {
  let component: ApiMenuPage;
  let fixture: ComponentFixture<ApiMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
