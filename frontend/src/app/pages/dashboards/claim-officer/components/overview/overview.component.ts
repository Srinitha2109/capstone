import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../services/auth';

interface ClaimItem {
    id: number;
    claimNumber: string;
    policyApplicationId: number;
    policyNumber?: string;
    description: string;
    claimAmount: number;
    incidentDate: string;
    incidentLocation: string;
    status: string;
    hovering?: boolean;
}

@Component({
    selector: 'app-claim-officer-overview',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col gap-8">
      <header>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Claims Overview</h1>
        <p class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Summary and history of your assigned claims</p>
      </header>

      @if (isLoading()) {
      <div class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-[#8B1A3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
      } @else {
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Assigned</span>
          <span class="text-4xl font-black text-slate-800">{{ allClaims().length }}</span>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pending Requests</span>
          <span class="text-4xl font-black text-amber-500">{{ pendingCount() }}</span>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Approved Claims</span>
          <span class="text-4xl font-black text-emerald-500">{{ approvedCount() }}</span>
        </div>
        <div class="bg-[#8B1A3A] p-6 rounded-2xl shadow-md shadow-rose-900/20 flex flex-col relative overflow-hidden">
          <div class="absolute -right-6 -top-6 text-6xl opacity-10">💵</div>
          <span class="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2 relative z-10">Total Payouts Approved</span>
          <span class="text-3xl font-black text-white relative z-10 mt-1">{{ totalPayouts() | currency }}</span>
        </div>
      </div>

      <!-- All Claims List -->
      <section>
        <h2 class="text-lg font-black text-slate-800 mb-4">All Assigned Claims</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (claim of allClaims(); track claim.id) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 flex flex-col group cursor-default"
               [class.shadow-xl]="claim.hovering"
               [class.-translate-y-1]="claim.hovering"
               (mouseenter)="claim.hovering = true"
               (mouseleave)="claim.hovering = false">

            <!-- Card Header - always visible -->
            <div class="px-6 py-4 border-b flex items-center justify-between transition-colors duration-300"
                 [style.background]="claim.hovering ? '#8B1A3A' : '#F9F0F3'"
                 [style.borderColor]="claim.hovering ? '#8B1A3A' : '#C17B8C20'">
              <span class="text-[11px] font-black tracking-widest transition-colors duration-300" 
                    [style.color]="claim.hovering ? 'white' : '#8B1A3A'">
                {{ claim.claimNumber }}
              </span>
              <span [ngClass]="getStatusClass(claim.status, claim.hovering)"
                    class="px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md border transition-colors duration-300">
                {{ claim.status }}
              </span>
            </div>

            <!-- Normal body -->
            <div class="p-6 flex-1 flex flex-col gap-4">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Application</span>
                  <span class="text-sm font-black" style="color:#8B1A3A">{{ claim.policyNumber || 'APP-' + claim.policyApplicationId }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Amount</span>
                  <span class="text-base font-black text-slate-700">{{ claim.claimAmount | currency }}</span>
                </div>
              </div>

              <!-- Description: truncated normally, full on hover -->
              <p class="text-xs font-bold text-slate-500 leading-relaxed transition-all duration-300"
                 [class.line-clamp-2]="!claim.hovering"
                 [class.line-clamp-none]="claim.hovering">
                {{ claim.description }}
              </p>

              <!-- Extra details visible only on hover -->
              <div class="overflow-hidden transition-all duration-300"
                   [style.maxHeight]="claim.hovering ? '200px' : '0px'"
                   [style.opacity]="claim.hovering ? '1' : '0'">
                <div class="flex gap-6 pt-4 border-t border-slate-50 mt-2">
                  <div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Incident Date</span>
                    <span class="text-xs font-black text-slate-700">{{ claim.incidentDate | date:'mediumDate' }}</span>
                  </div>
                  <div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Location</span>
                    <span class="text-xs font-black text-slate-700 truncate max-w-[120px]">{{ claim.incidentLocation }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          } @empty {
          <div class="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
             <span class="text-5xl opacity-50 mb-4">📄</span>
             <h3 class="text-lg font-black text-slate-700">No Claims Assigned</h3>
             <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">You currently have no claims in your portfolio</p>
          </div>
          }
        </div>
      </section>
      }
    </div>
  `,
    styles: [`
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-none { display: block; }
  `]
})
export class OverviewComponent implements OnInit {
    private authService = inject(AuthService);
    private http = inject(HttpClient);

    currentUser = this.authService.currentUser;
    allClaims = signal<ClaimItem[]>([]);
    isLoading = signal(true);

    pendingCount = signal(0);
    approvedCount = signal(0);
    totalPayouts = signal(0);

    ngOnInit() {
        const user = this.currentUser();
        if (user?.id) {
            this.http.get<any>(`/api/claim-officers/by-user/${user.id}`).subscribe({
                next: (officer) => this.loadClaims(officer.id),
                error: () => this.isLoading.set(false)
            });
        }
    }

    loadClaims(officerId: number) {
        this.http.get<ClaimItem[]>(`/api/claims/claim-officer/${officerId}`).subscribe({
            next: (claims) => {
                const claimsWithState = claims.map(c => ({ ...c, hovering: false }));
                // Sort newest first
                claimsWithState.sort((a, b) => new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime());

                this.allClaims.set(claimsWithState);

                let pending = 0;
                let approved = 0;
                let payouts = 0;

                claims.forEach(c => {
                    if (c.status === 'SUBMITTED' || c.status === 'ASSIGNED' || c.status === 'UNDER_INVESTIGATION') pending++;
                    if (c.status === 'APPROVED' || c.status === 'SETTLED') {
                        approved++;
                        payouts += c.claimAmount;
                    }
                });

                this.pendingCount.set(pending);
                this.approvedCount.set(approved);
                this.totalPayouts.set(payouts);

                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    getStatusClass(status: string, isHovering: boolean = false): string {
        if (isHovering) return 'bg-white/20 border-white/30 text-white';

        switch (status) {
            case 'APPROVED': case 'SETTLED': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
            case 'REJECTED': return 'bg-rose-50 border-rose-100 text-rose-500';
            default: return 'bg-amber-50 border-amber-100 text-amber-600';
        }
    }
}
