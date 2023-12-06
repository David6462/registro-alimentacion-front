import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginIndexPage } from './login-index.page';

describe('LoginIndexPage', () => {
  let component: LoginIndexPage;
  let fixture: ComponentFixture<LoginIndexPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LoginIndexPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
