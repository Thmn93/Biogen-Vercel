import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LancamentosService {
  private apiUrl = '/api/lancamentos';
  lancamentosCache: any[] = [];

  constructor(private http: HttpClient) {}

  getLancamentos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
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
    });
  }

  deletarLancamento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  atualizarLancamento(id: number, lancamento: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, lancamento);
  }

  getLancamentosPorUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }

  removerLancamento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
