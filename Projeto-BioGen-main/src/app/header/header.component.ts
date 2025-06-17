import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  assets: any;
  private navToggle: HTMLElement | null = null;
  private navMenu: HTMLElement | null = null;

  isAuthenticated = false;
  currentUser: User | null = null;
  private authSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Inscrição para autenticação (pode ser feito no SSR)
    this.authSubscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    this.authSubscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngAfterViewInit() {
    // Somente executa no navegador
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        this.initMobileMenu();
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.navToggle) {
      this.navToggle.removeEventListener('click', this.toggleMobileMenu.bind(this));
    }

    this.authSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }

  private initMobileMenu() {
    if (typeof document === 'undefined') return;

    this.navToggle = document.getElementById('nav-toggle');
    this.navMenu = document.getElementById('nav-menu');

    if (this.navToggle && this.navMenu) {
      this.navToggle.addEventListener('click', this.toggleMobileMenu.bind(this));

      const navLinks = this.navMenu.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', this.closeMobileMenu.bind(this));
      });

      document.addEventListener('click', this.handleOutsideClick.bind(this));
    }
  }

  private toggleMobileMenu() {
    if (typeof document === 'undefined') return;

    if (this.navToggle && this.navMenu) {
      this.navToggle.classList.toggle('active');
      this.navMenu.classList.toggle('active');

      if (this.navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  private closeMobileMenu() {
    if (typeof document === 'undefined') return;

    if (this.navToggle && this.navMenu) {
      this.navToggle.classList.remove('active');
      this.navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  private handleOutsideClick(event: Event) {
    if (typeof document === 'undefined') return;

    const target = event.target as HTMLElement;
    if (this.navToggle && this.navMenu &&
        !this.navToggle.contains(target) &&
        !this.navMenu.contains(target)) {
      this.closeMobileMenu();
    }
  }
}
