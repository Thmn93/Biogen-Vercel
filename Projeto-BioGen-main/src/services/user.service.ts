import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../app/models/user.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient, private storage: StorageService) {}

  getAllUsers(): Observable<User[]> {
    const token = this.storage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<User[]>(this.apiUrl, { headers });
  }

  updateUser(id: number, data: Partial<User>): Observable<any> {
    const token = this.storage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers });
  }

  deleteUser(id: number): Observable<any> {
    const token = this.storage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  removerUsuario(id: number): Observable<any> {
    return this.deleteUser(id);
  }
}
