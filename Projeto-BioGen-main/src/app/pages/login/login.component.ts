import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Verificar se o usuário já está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Verifica se há mensagem de redirecionamento
    this.route.queryParams.subscribe(params => {
      if (params['mensagem'] === 'UsuarioNaoCadastrado') {
        alert('Usuário não cadastrado. Por favor, realize seu cadastro.');
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login bem-sucedido:', response);

          if (response && response.user && response.user.role === 'admin') {
            this.router.navigate(['/dashboard-admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro no login:', error);

          // Verifica se é usuário não cadastrado
          if (error.error?.error === 'Usuário não cadastrado' && error.error?.redirect) {
            this.router.navigateByUrl(error.error.redirect);
            return;
          }

          // Tratamento padrão de erros
          if (error.status === 401) {
            this.errorMessage = 'Email ou senha incorretos';
          } else if (error.status === 500) {
            this.errorMessage = 'Erro interno do servidor. Tente novamente.';
          } else {
            this.errorMessage = 'Erro de conexão. Verifique sua internet.';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  get emailErrorMessage(): string {
    if (this.emailControl?.hasError('required')) {
      return 'Email é obrigatório';
    }
    if (this.emailControl?.hasError('email')) {
      return 'Email inválido';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    if (this.passwordControl?.hasError('required')) {
      return 'Senha é obrigatória';
    }
    if (this.passwordControl?.hasError('minlength')) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }
}
