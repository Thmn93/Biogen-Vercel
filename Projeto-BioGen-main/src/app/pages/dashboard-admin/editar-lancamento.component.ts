import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-lancamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Lançamento</h2>
          <button class="close-button" (click)="fechar()">&times;</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-group">
            <label>Ano:</label>
            <input type="number" formControlName="ano" required />
          </div>

          <div class="form-group">
            <label>Mês:</label>
            <input type="text" formControlName="mes" required />
          </div>

          <div class="form-group">
            <label>Toneladas Processadas:</label>
            <input type="number" formControlName="toneladasProcessadas" required />
          </div>

          <div class="form-group">
            <label>Energia Gerada:</label>
            <input type="number" formControlName="energiaGerada" required />
          </div>

          <div class="form-group">
            <label>Imposto Abatido:</label>
            <input type="number" formControlName="impostoAbatido" required />
          </div>

          <div class="modal-actions">
            <button type="submit" [disabled]="form.invalid" class="btn-save">Salvar</button>
            <button type="button" (click)="fechar()" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-save {
      background-color: #01b658;
      color: white;
    }

    .btn-cancel {
      background-color: #f44336;
      color: white;
    }

    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `]
})
export class EditarLancamentoComponent {
  @Input() isOpen = false;
  @Input() lancamento: any;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      ano: ['', Validators.required],
      mes: ['', Validators.required],
      toneladasProcessadas: ['', Validators.required],
      energiaGerada: ['', Validators.required],
      impostoAbatido: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (this.lancamento) {
      this.form.patchValue({
        ano: this.lancamento.ano,
        mes: this.lancamento.mes,
        toneladasProcessadas: this.lancamento.toneladasProcessadas,
        energiaGerada: this.lancamento.energiaGerada,
        impostoAbatido: this.lancamento.impostoAbatido
      });
    }
  }

  salvar() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
      this.fechar();
    }
  }

  fechar() {
    this.close.emit();
  }
}
