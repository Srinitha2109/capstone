import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-claim-officer',
  imports: [CommonModule],
  templateUrl: './claim-officer.html',
  styleUrl: './claim-officer.css'
})
export class ClaimOfficerComponent {
  private authService = inject(AuthService);
  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  logout() {
    this.authService.logout();
  }
}
