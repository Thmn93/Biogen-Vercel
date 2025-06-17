import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LancamentosService } from '../../../services/lancamento.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DashboardComponent implements OnInit, AfterViewInit {

  meses: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  anoAtual: number = 2024;

  dadosPorAno: any = {
    2022: this.inicializarDados(),
    2023: this.inicializarDados(),
    2024: this.inicializarDados(),
    2025: this.inicializarDados(),
    2026: this.inicializarDados(),
    2027: this.inicializarDados(),
  };

  formularios: FormGroup[] = [];
  formularioGeral!: FormGroup;

  modalAbertoIndex: number | null = null;
  modalGeralAberto: boolean = false;
  modalExportarAberto: boolean = false;
  modoExportacao: 'ano' | 'mes' | '' = '';
  mesEscolhido: string = '';

  lineChart: any;
  pieChart: any;
  barChart: any;

  dadosTabela: any[] = [];

  mesFiltro: string = '';

  anoExportacao: number = 2024;

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private lancamentosService: LancamentosService
  ) {
    this.meses.forEach(() => {
      this.formularios.push(this.fb.group({
        toneladas: [null, [Validators.required, Validators.min(0)]],
        energia: [null, [Validators.required, Validators.min(0)]],
        imposto: [null, [Validators.required, Validators.min(0)]]
      }));
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarLancamentos();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.criarGraficos();
    }
  }

  inicializarDados() {
    return {
      toneladas: Array(12).fill(null),
      energia: Array(12).fill(null),
      imposto: Array(12).fill(null),
    };
  }

  carregarLancamentos() {
    this.lancamentosService.getLancamentos().subscribe({
      next: (lancamentos) => {
        this.dadosPorAno = {
          2022: this.inicializarDados(),
          2023: this.inicializarDados(),
          2024: this.inicializarDados(),
          2025: this.inicializarDados(),
          2026: this.inicializarDados(),
          2027: this.inicializarDados(),
        };

        lancamentos.forEach(lancamento => {
          if (this.dadosPorAno[lancamento.ano]) {
            const mesIndex = this.meses.indexOf(lancamento.mes);
            if (mesIndex !== -1) {
              this.dadosPorAno[lancamento.ano].toneladas[mesIndex] = lancamento.toneladasProcessadas;
              this.dadosPorAno[lancamento.ano].energia[mesIndex] = lancamento.energiaGerada;
              this.dadosPorAno[lancamento.ano].imposto[mesIndex] = lancamento.impostoAbatido;
            }
          }
        });

        this.atualizarGraficos();
        this.atualizarTabela();
      },
      error: (error) => console.error('Erro ao carregar lançamentos:', error)
    });
  }

  obterCoresMeses() {
    // 12 cores distintas, harmônicas e com bom contraste
    return [
      '#FF6384', // Janeiro
      '#36A2EB', // Fevereiro
      '#FFCE56', // Março
      '#4BC0C0', // Abril
      '#9966FF', // Maio
      '#FF9F40', // Junho
      '#8DD17E', // Julho
      '#F67019', // Agosto
      '#00A6B4', // Setembro
      '#B2912F', // Outubro
      '#F53794', // Novembro
      '#58508D'  // Dezembro
    ];
  }

  criarGraficos() {
    const coresMeses = this.obterCoresMeses();
    // Gráfico de barras horizontais para Toneladas Processadas
    const toneladasCtx = document.getElementById('lineChart') as HTMLCanvasElement;
    this.lineChart = new Chart(toneladasCtx, {
      type: 'bar',
      data: {
        labels: this.meses,
        datasets: [{
          label: 'Toneladas Processadas (Ton)',
          data: this.dadosPorAno[this.anoAtual].toneladas,
          backgroundColor: coresMeses,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 30
        }],
      },
      options: {
        indexAxis: 'y', // barras horizontais
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { size: 16 }, color: '#333' } },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.x ?? 0}`;
              }
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#333',
            font: { weight: 'bold', size: 14 },
            formatter: function(value: any) {
              return value ?? 0;
            }
          }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: '#eee' }, ticks: { color: '#333', font: { size: 14 } } },
          y: { grid: { color: '#eee' }, ticks: { color: '#333', font: { size: 14 } } }
        },
        animation: { duration: 1200, easing: 'easeOutQuart' }
      }
    });

    const pieCtx = document.getElementById('pieChart') as HTMLCanvasElement;
    this.pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: this.meses,
        datasets: [{
          label: 'Energia Gerada (KW)',
          data: this.dadosPorAno[this.anoAtual].energia,
          backgroundColor: coresMeses,
          borderColor: '#fff',
          borderWidth: 2
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 14 }, color: '#333' } },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed ?? 0}`;
              }
            }
          }
        },
        animation: { duration: 1200, easing: 'easeOutQuart' }
      },
    });

    const barCtx = document.getElementById('barChart') as HTMLCanvasElement;
    this.barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: this.meses,
        datasets: [{
          label: 'Imposto Abatido (R$)',
          data: this.dadosPorAno[this.anoAtual].imposto,
          backgroundColor: coresMeses,
          borderRadius: 8,
          borderSkipped: false
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { size: 16 }, color: '#333' } },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y ?? 0}`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#eee' }, ticks: { color: '#333', font: { size: 14 } } },
          x: { grid: { color: '#eee' }, ticks: { color: '#333', font: { size: 14 } } }
        },
        animation: { duration: 1200, easing: 'easeOutQuart' }
      },
    });
  }

  aoMudarAno() {
    this.atualizarGraficos();
    this.atualizarTabela();
  }

  atualizarGraficos() {
    if (this.lineChart && this.pieChart && this.barChart) {
      this.lineChart.data.datasets[0].data = this.dadosPorAno[this.anoAtual].toneladas;
      this.lineChart.update();

      this.pieChart.data.datasets[0].data = this.dadosPorAno[this.anoAtual].energia;
      this.pieChart.update();

      this.barChart.data.datasets[0].data = this.dadosPorAno[this.anoAtual].imposto;
      this.barChart.update();
    }
  }

  atualizarTabela() {
    const anoSelecionado = this.anoAtual;
    this.dadosTabela = this.meses.map((mes, index) => {
      const lancamento = this.lancamentosService.lancamentosCache?.find(l => l.ano === anoSelecionado && l.mes === mes);
      return {
        mes,
        toneladas: this.dadosPorAno[anoSelecionado].toneladas[index],
        energia: this.dadosPorAno[anoSelecionado].energia[index],
        imposto: this.dadosPorAno[anoSelecionado].imposto[index],
        id: lancamento ? lancamento.id : null
      };
    });
  }

  abrirModal(index: number) {
    if (!this.formularios[index]) {
      this.formularios[index] = this.fb.group({
        toneladas: [0, [Validators.required, Validators.min(0)]],
        energia: [0, [Validators.required, Validators.min(0)]],
        imposto: [0, [Validators.required, Validators.min(0)]],
      });
    }

    this.formularios[index].patchValue({
      toneladas: this.dadosPorAno[this.anoAtual].toneladas[index] || 0,
      energia: this.dadosPorAno[this.anoAtual].energia[index] || 0,
      imposto: this.dadosPorAno[this.anoAtual].imposto[index] || 0
    });

    this.modalAbertoIndex = index;
  }

  fecharModal() {
    this.modalAbertoIndex = null;
  }

  salvarEdicao(index: number) {
    const dados = this.formularios[index].value;
    const id = this.dadosTabela[index].id;
    if (id) {
      // Se existe id, é edição: usar PUT
      this.lancamentosService.atualizarLancamento(id, {
        ano: this.anoAtual,
        mes: this.meses[index],
        toneladasProcessadas: dados.toneladas,
        energiaGerada: dados.energia,
        impostoAbatido: dados.imposto
      }).subscribe({
        next: () => {
          alert('Lançamento atualizado com sucesso!');
          this.carregarLancamentos();
        },
        error: () => {
          alert('Erro ao atualizar lançamento.');
        }
      });
    } else {
      // Se não existe id, é criação: usar POST
      this.lancamentosService.criarLancamento({
        ano: this.anoAtual,
        mes: this.meses[index],
        toneladas: dados.toneladas,
        energia: dados.energia,
        imposto: dados.imposto
      }).subscribe({
        next: () => {
          alert('Lançamento criado com sucesso!');
          this.carregarLancamentos();
        },
        error: () => {
          alert('Erro ao criar lançamento.');
        }
      });
    }
    this.fecharModal();
  }

  abrirModalGeral() {
    this.formularioGeral = this.fb.group({
      mes: ['', Validators.required],
      toneladas: [0, [Validators.required, Validators.min(0)]],
      energia: [0, [Validators.required, Validators.min(0)]],
      imposto: [0, [Validators.required, Validators.min(0)]],
    });
    this.modalGeralAberto = true;
  }

  fecharModalGeral() {
    this.modalGeralAberto = false;
  }

  aoEnviarGeral() {
    if (this.formularioGeral.valid) {
      const dados = this.formularioGeral.value;

      const novoLancamento = {
        ano: this.anoAtual,
        mes: dados.mes,
        toneladas: dados.toneladas,
        energia: dados.energia,
        imposto: dados.imposto,
      };

      this.lancamentosService.criarLancamento(novoLancamento).subscribe({
        next: () => {
          this.carregarLancamentos();
          this.fecharModalGeral();
        },
        error: (error) => {
          console.error('Erro ao criar lançamento:', error);
          alert('Erro ao salvar os dados. Tente novamente.');
        }
      });
    } else {
      alert('Preencha todos os campos corretamente.');
    }
  }

  deletarLancamento(index: number) {
    const id = this.dadosTabela[index].id;
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      this.lancamentosService.deletarLancamento(id).subscribe({
        next: () => {
          alert('Lançamento excluído com sucesso!');
          this.carregarLancamentos();
        },
        error: () => {
          alert('Erro ao excluir lançamento.');
        }
      });
    }
  }

  abrirModalExportar() {
    this.modalExportarAberto = true;
    this.modoExportacao = '';
    this.mesEscolhido = '';
    this.anoExportacao = this.anoAtual;
  }

  fecharModalExportar() {
    this.modalExportarAberto = false;
    this.modoExportacao = '';
    this.mesEscolhido = '';
  }

  exportarPDF(modo: 'ano' | 'mes') {
    this.modoExportacao = modo;
    if (modo === 'ano') {
      this.gerarPDFPorAno();
      this.fecharModalExportar();
    }
    // Se for por mês, exibe select no modal
  }

  confirmarExportarMes() {
    if (this.mesEscolhido) {
      this.gerarPDFPorMes(this.mesEscolhido);
      this.fecharModalExportar();
    }
  }

  gerarPDFPorAno() {
    const doc = new jsPDF();
    const ano = this.anoExportacao;
    const dados = this.meses.map((mes, i) => ({
      mes,
      toneladas: this.dadosPorAno[ano].toneladas[i] || 0,
      energia: this.dadosPorAno[ano].energia[i] || 0,
      imposto: this.dadosPorAno[ano].imposto[i] || 0
    }));
    doc.text(`Relatório de Lançamentos - ${ano}`, 14, 18);
    autoTable(doc, {
      startY: 24,
      head: [["Mês", "Toneladas Processadas (Ton)", "Energia Gerada (KW)", "Imposto Abatido (R$)"]],
      body: dados.map(d => [d.mes, d.toneladas, d.energia, d.imposto]),
      theme: 'grid',
      headStyles: { fillColor: [1, 182, 88] },
      styles: { fontSize: 12 }
    });
    doc.save(`relatorio_lancamentos_${ano}.pdf`);
  }

  gerarPDFPorMes(mes: string) {
    const doc = new jsPDF();
    const ano = this.anoExportacao;
    const i = this.meses.indexOf(mes);
    const dados = [{
      mes,
      toneladas: this.dadosPorAno[ano].toneladas[i] || 0,
      energia: this.dadosPorAno[ano].energia[i] || 0,
      imposto: this.dadosPorAno[ano].imposto[i] || 0
    }];
    doc.text(`Relatório de Lançamentos - ${ano} - ${mes}`, 14, 18);
    autoTable(doc, {
      startY: 24,
      head: [["Mês", "Toneladas Processadas (Ton)", "Energia Gerada (KW)", "Imposto Abatido (R$)"]],
      body: dados.map(d => [d.mes, d.toneladas, d.energia, d.imposto]),
      theme: 'grid',
      headStyles: { fillColor: [1, 182, 88] },
      styles: { fontSize: 12 }
    });
    doc.save(`relatorio_lancamentos_${ano}_${mes}.pdf`);
  }

}
