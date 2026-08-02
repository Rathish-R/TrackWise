import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { Category } from './model/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl + '/api/Category');
  }

  get(id: string): Observable<Category> {
    return this.http.get<Category>(this.baseUrl + '/api/Category/' + encodeURIComponent(id));
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl + '/api/Category', category);
  }

  update(id: string, category: Category): Observable<void> {
    return this.http.put<void>(this.baseUrl + '/api/Category/' + encodeURIComponent(id), category);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/api/Category/' + encodeURIComponent(id));
  }
}
