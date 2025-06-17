import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { USERS_MOCK } from '../../mocks/users.mock';
import { User } from '../../models/user.model';
import { UserService } from '../../../services/user.service';
import { LancamentosService } from '../../../services/lancamento.service';
import { EditarLancamentoComponent } from '../dashboard-admin/editar-lancamento.component';
import { EditarUsuarioComponent } from '../dashboard-admin/editar-usuario.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditarLancamentoComponent, EditarUsuarioComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  buscaForm: FormGroup;
  fornecedores: User[] = [];
  beneficiarios: User[] = [];
  fornecedoresFiltrados: User[] = [];
  beneficiariosFiltrados: User[] = [];
  mensagemFornecedor: string = '';
  mensagemBeneficiario: string = '';
  filtro: string = '';
  lancamentosFornecedor: any[] = [];
  modalLancamentosAberto: boolean = false;
  fornecedorSelecionado: User | null = null;
  mensagemLancamentos: string = '';
  modalEditarLancamentoAberto: boolean = false;
  lancamentoSelecionado: any = null;
  modalEditarUsuarioAberto: boolean = false;
  usuarioSelecionado: User | null = null;
  // Gráficos e dados gerenciais podem ser adicionados aqui

  constructor(private fb: FormBuilder, private userService: UserService, private lancamentosService: LancamentosService) {
    this.buscaForm = this.fb.group({
      termo: ['']
    });
    Chart.register(ChartDataLabels);
  }

  ngOnInit(): void {
    this.carregarFornecedores();
    this.carregarBeneficiarios();
  }

  carregarFornecedores() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.fornecedores = users.filter(u => u.role === 'fornecedor');
        this.fornecedoresFiltrados = [...this.fornecedores];
      },
      error: () => {
        this.mensagemFornecedor = 'Erro ao buscar fornecedores.';
        this.fornecedores = [];
        this.fornecedoresFiltrados = [];
      }
    });
  }

  carregarBeneficiarios() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.beneficiarios = users.filter(u => u.role === 'beneficiario');
        this.beneficiariosFiltrados = [...this.beneficiarios];
      },
      error: () => {
        this.mensagemBeneficiario = 'Erro ao buscar beneficiários.';
        this.beneficiarios = [];
        this.beneficiariosFiltrados = [];
      }
    });
  }

  buscar() {
    const termo = this.buscaForm.value.termo?.toLowerCase().trim();
    if (!termo) {
      this.fornecedoresFiltrados = [...this.fornecedores];
      this.beneficiariosFiltrados = [...this.beneficiarios];
      this.mensagemFornecedor = '';
      this.mensagemBeneficiario = '';
      return;
    }
    // Filtrar fornecedores
    this.fornecedoresFiltrados = this.fornecedores.filter(f =>
      (f.razaoSocial && f.razaoSocial.toLowerCase().includes(termo)) ||
      (f.cnpj && f.cnpj.includes(termo)) ||
      (f.email && f.email.toLowerCase().includes(termo))
    );
    // Filtrar beneficiários
    this.beneficiariosFiltrados = this.beneficiarios.filter(b =>
      (b.email && b.email.toLowerCase().includes(termo)) ||
      (b.nis && b.nis.includes(termo))
    );
    this.mensagemFornecedor = this.fornecedoresFiltrados.length === 0 ? 'Nenhum fornecedor encontrado.' : '';
    this.mensagemBeneficiario = this.beneficiariosFiltrados.length === 0 ? 'Nenhum beneficiário encontrado.' : '';
  }

  visualizarLancamentos(fornecedor: User) {
    this.fornecedorSelecionado = fornecedor;
    this.modalLancamentosAberto = true;
    this.mensagemLancamentos = '';
    this.carregarLancamentos();
  }

  fecharModalLancamentos() {
    this.modalLancamentosAberto = false;
    this.lancamentosFornecedor = [];
    this.fornecedorSelecionado = null;
    this.mensagemLancamentos = '';
  }

  editarLancamento(lancamento: any) {
    // Lógica para editar lançamento
  }

  excluirLancamento(lancamento: any) {
    // Lógica para excluir lançamento
  }

  abrirModalEditarLancamento(lancamento: any) {
    this.lancamentoSelecionado = lancamento;
    this.modalEditarLancamentoAberto = true;
  }

  fecharModalEditarLancamento() {
    this.modalEditarLancamentoAberto = false;
    this.lancamentoSelecionado = null;
  }

  salvarLancamento(lancamentoEditado: any) {
    this.lancamentosService.atualizarLancamento(this.lancamentoSelecionado.id, lancamentoEditado).subscribe({
      next: () => {
        alert('Lançamento atualizado com sucesso!');
        this.carregarLancamentos();
        this.fecharModalEditarLancamento();
      },
      error: (error: any) => {
        console.error('Erro ao atualizar lançamento:', error);
        alert('Erro ao atualizar lançamento.');
      }
    });
  }

  removerLancamento(lancamento: any) {
    // Lógica para excluir lançamento
  }

  abrirModalEditarUsuario(usuario: User) {
    this.usuarioSelecionado = usuario;
    this.modalEditarUsuarioAberto = true;
  }

  fecharModalEditarUsuario() {
    this.modalEditarUsuarioAberto = false;
    this.usuarioSelecionado = null;
  }

  salvarUsuario(usuarioEditado: any) {
    this.userService.updateUser(usuarioEditado.id, usuarioEditado).subscribe({
      next: () => {
        alert('Usuário atualizado com sucesso!');
        this.carregarFornecedores();
        this.carregarBeneficiarios();
        this.fecharModalEditarUsuario();
      },
      error: (error: any) => {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário.');
      }
    });
  }

  removerUsuario(usuario: User) {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      this.userService.removerUsuario(usuario.id).subscribe({
        next: () => {
          alert('Usuário removido com sucesso!');
          this.carregarFornecedores();
          this.carregarBeneficiarios();
        },
        error: (error: any) => {
          console.error('Erro ao remover usuário:', error);
          alert('Erro ao remover usuário.');
        }
      });
    }
  }

  carregarLancamentos() {
    if (this.fornecedorSelecionado) {
      this.lancamentosService.getLancamentosPorUserId(this.fornecedorSelecionado.id).subscribe({
        next: (lancs) => {
          this.lancamentosFornecedor = lancs;
          if (!lancs || lancs.length === 0) {
            this.mensagemLancamentos = 'Nenhum lançamento encontrado para este fornecedor.';
          }
        },
        error: () => {
          this.lancamentosFornecedor = [];
          this.mensagemLancamentos = 'Erro ao buscar lançamentos.';
        }
      });
    }
  }
}
