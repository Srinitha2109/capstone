import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-underwriter',
  imports: [CommonModule],
  templateUrl: './underwriter.html',
  styleUrl: './underwriter.css',
})
export class UnderwriterComponent {
  private authService = inject(AuthService);
  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  logout() {
    this.authService.logout();
  }
}
