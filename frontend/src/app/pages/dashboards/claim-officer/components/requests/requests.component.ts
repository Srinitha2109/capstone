import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../services/auth';

interface ClaimDoc {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
}

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
  documents?: ClaimDoc[];
  hovering?: boolean;
}

@Component({
  selector: 'app-claim-officer-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-8">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">Claim Requests</h1>
          <p class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Review and process your pending claims</p>
        </div>
        <button (click)="loadClaims()" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-[#8B1A3A] hover:text-white transition-all shadow-sm group">
          <span class="group-hover:rotate-180 transition-transform duration-500 inline-block">🔄</span> 
          Refresh List
        </button>
      </header>

      @if (isLoading()) {
      <div class="flex items-center justify-center py-24">
        <div class="w-10 h-10 border-4 border-[#8B1A3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
      } @else if (pendingClaims().length === 0) {
      <div class="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 gap-6">
        <span class="text-6xl grayscale opacity-30">📂</span>
        <div class="text-center">
          <h3 class="text-xl font-black text-slate-700 mb-1">Queue Clear</h3>
          <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">No new claims requiring your attention</p>
        </div>
      </div>
      } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        @for (claim of pendingClaims(); track claim.id) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
          
          <!-- Card Header (Minimal) -->
          <div class="p-6 pb-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim Reference</span>
              <span class="px-2 py-0.5 text-[8px] font-black uppercase rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pending Review</span>
            </div>
            <h2 class="text-xl font-black text-slate-800 tracking-tight">{{ claim.claimNumber }}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Application: <span class="text-slate-600">APP-{{ claim.policyApplicationId }}</span></p>
          </div>

          <!-- Description Section -->
          <div class="px-6 py-4 flex-1">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Incident Description</span>
            <p class="text-sm font-medium text-slate-700 leading-relaxed">
              {{ claim.description }}
            </p>
          </div>

          <!-- Stats Grid -->
          <div class="px-6 py-4 grid grid-cols-2 gap-4 border-t border-slate-50">
            <div class="bg-slate-50/50 p-3 rounded-2xl">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Requested Amount</span>
              <span class="text-sm font-black text-slate-800">{{ claim.claimAmount | currency }}</span>
            </div>
            <div class="bg-slate-50/50 p-3 rounded-2xl">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Incident Date</span>
              <span class="text-sm font-black text-slate-800">{{ claim.incidentDate | date:'mediumDate' }}</span>
            </div>
          </div>

          <!-- Documents Area -->
          <div class="px-6 py-5 border-t border-slate-50">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Supporting Evidence</span>
            <div class="flex flex-wrap gap-2">
              @for (doc of claim.documents; track doc.id) {
              <button (click)="openDocument(doc)" 
                      class="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all text-[10px] font-bold text-slate-600 shadow-sm group/btn">
                <span>{{ getFileIcon(doc.fileType) }}</span>
                <span class="truncate max-w-[100px]">{{ doc.fileName }}</span>
                <span class="opacity-0 group-hover/btn:opacity-100 transition-opacity ml-1">⬇️</span>
              </button>
              } @empty {
                <span class="text-[10px] italic text-slate-400">No documents attached</span>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-2 flex gap-3">
            <button (click)="approveClaim(claim)"
                    class="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
              Approve Claim
            </button>
            <button (click)="rejectClaim(claim)"
                    class="flex-1 py-3.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95">
              Reject
            </button>
          </div>
        </div>
        }
      </div>
      }
    </div>
  `
})
export class RequestsComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  currentUser = this.authService.currentUser;
  pendingClaims = signal<ClaimItem[]>([]);
  isLoading = signal(true);
  officerId = signal<number | null>(null);

  ngOnInit() {
    this.loadOfficerAndClaims();
  }

  loadOfficerAndClaims() {
    // If not using exact state handling, we reload directly from HTTP
    const user = this.currentUser();
    if (user?.id) {
      this.isLoading.set(true);
      this.http.get<any>(`/api/claim-officers/by-user/${user.id}`).subscribe({
        next: (officer) => {
          this.officerId.set(officer.id);
          this.loadClaims();
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  loadClaims() {
    const id = this.officerId();
    if (!id) return;
    this.isLoading.set(true);

    this.http.get<ClaimItem[]>(`/api/claims/claim-officer/${id}`).subscribe({
      next: (claims) => {
        // Filter only actionable claims
        const actionable = claims.filter(c =>
          c.status === 'SUBMITTED' || c.status === 'ASSIGNED' || c.status === 'UNDER_INVESTIGATION'
        ).map(c => ({ ...c, hovering: false }));
        // Sort newest first
        actionable.sort((a, b) => new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime());
        this.pendingClaims.set(actionable);

        // Fetch docs
        actionable.forEach(claim => {
          this.http.get<ClaimDoc[]>(`/api/claim-documents/claim/${claim.id}`).subscribe({
            next: (docs) => {
              const updated = this.pendingClaims().map(c =>
                c.id === claim.id ? { ...c, documents: docs } : c
              );
              this.pendingClaims.set(updated);
            }
          });
        });

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  approveClaim(claim: ClaimItem) {
    if (confirm('Are you confirm you want to APPROVE this claim?')) {
      this.http.put(`/api/claims/${claim.id}/approve`, {}).subscribe({
        next: () => this.loadClaims()
      });
    }
  }

  rejectClaim(claim: ClaimItem) {
    if (confirm('Are you confirm you want to REJECT this claim?')) {
      this.http.put(`/api/claims/${claim.id}/reject`, {}).subscribe({
        next: () => this.loadClaims()
      });
    }
  }

  openDocument(doc: ClaimDoc) {
    this.http.get(`/api/documents/${doc.id}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: () => alert('Could not open document. Please check if the file exists.')
    });
  }

  getFileIcon(fileType: string): string {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return '🖼️';
    return '📎';
  }
}
