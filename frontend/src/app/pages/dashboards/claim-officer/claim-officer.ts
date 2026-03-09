import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-claim-officer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen bg-slate-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-100 shadow-sm flex flex-col shrink-0 sticky top-0 h-screen">
        <div class="px-6 py-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-black shadow-inner" style="background:#8B1A3A">CO</div>
            <div>
              <p class="text-sm font-black text-slate-800 tracking-tight">Claims Officer</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ currentUser()?.fullName || 'Officer' }}</p>
            </div>
          </div>
        </div>
        
        <nav class="flex-1 px-4 py-6 flex flex-col gap-2">
          <a routerLink="/claim-officer/dashboard" routerLinkActive="active-link"
             class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
            <span class="text-lg">📊</span>
            <span>Dashboard</span>
          </a>
          
          <a routerLink="/claim-officer/requests" routerLinkActive="active-link"
             class="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
            <span class="text-lg">📥</span>
            <span>Requests</span>
          </a>
        </nav>
        
        <div class="p-4 border-t border-slate-100">
          <button (click)="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div class="p-8 max-w-7xl mx-auto w-full">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .active-link {
      background: #F9F0F3 !important;
      color: #8B1A3A !important;
    }
  `]
})
export class ClaimOfficerComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
