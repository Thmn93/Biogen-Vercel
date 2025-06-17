import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../app/models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api'; // Usando proxy para redirecionar ao backend

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    if (!this.storageService.isBrowser()) return;

    const token = this.storageService.getItem('token');
    const storedUser = this.storageService.getItem('currentUser');

    if (token && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap({
        next: (response: any) => {
          this.setAuthData(response.user, response.token);
        },
        error: (err) => {
          console.error('Erro no login:', err);
        }
      })
    );
  }

  private setAuthData(user: User, token: string): void {
    this.storageService.setItem('currentUser', JSON.stringify(user));
    this.storageService.setItem('token', token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    this.storageService.removeItem('currentUser');
    this.storageService.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/home']);
  }

  registerFornecedor(fornecedorData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/fornecedor`, fornecedorData).pipe(
      tap({
        next: () => console.log('Fornecedor cadastrado com sucesso'),
        error: (err) => console.error('Erro no cadastro de fornecedor:', err)
      })
    );
  }

  registerBeneficiario(beneficiarioData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/beneficiario`, beneficiarioData).pipe(
      tap({
        next: () => console.log('Beneficiário cadastrado com sucesso'),
        error: (err) => console.error('Erro no cadastro de beneficiário:', err)
      })
    );
  }

  isAuthenticated(): boolean {
    if (!this.storageService.isBrowser()) return false;
    const token = this.storageService.getItem('token');
    const storedUser = this.storageService.getItem('currentUser');
    return !!(token && storedUser);
  }

  getCurrentUser(): User | null {
    try {
      return this.currentUserSubject.value;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.storageService.getItem('token');
  }
}
