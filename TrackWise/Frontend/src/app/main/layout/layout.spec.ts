import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';

import { Layout } from './layout';
import { API_BASE_URL } from '../../shared/api-base-url';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout, RouterTestingModule],
      providers: [provideHttpClient(), { provide: API_BASE_URL, useValue: 'http://localhost:5204' }],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render sidebar navigation links', () => {
    const links = fixture.nativeElement.querySelectorAll('a.sidebar-link');
    expect(links.length).toBeGreaterThan(0);
  });
});
