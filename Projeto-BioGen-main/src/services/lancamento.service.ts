import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LancamentosService {
  private apiUrl = 'https://biogen-vercel.onrender.com/api/lancamentos';
  lancamentosCache: any[] = [];

  constructor(private http: HttpClient) {}

  // Cabeçalho com token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getLancamentos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(lancamentos => this.lancamentosCache = lancamentos)
    );
  }

  criarLancamento(lancamento: any): Observable<any> {
    return this.http.post(this.apiUrl, {
      ano: lancamento.ano,
      mes: lancamento.mes,
      toneladasProcessadas: lancamento.toneladas,
      energiaGerada: lancamento.energia,
      impostoAbatido: lancamento.imposto
    }, {
      headers: this.getAuthHeaders()
    });
  }

  deletarLancamento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  atualizarLancamento(id: number, lancamento: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, lancamento, {
      headers: this.getAuthHeaders()
    });
  }

  getLancamentosPorUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  removerLancamento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
