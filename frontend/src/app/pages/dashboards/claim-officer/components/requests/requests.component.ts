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
          <p class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Review and process incoming claims</p>
        </div>
        <button (click)="loadClaims()" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-[#8B1A3A] hover:border-[#8B1A3A]/30 transition-all shadow-sm">
          🔄 Refresh List
        </button>
      </header>

      @if (isLoading()) {
      <div class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-[#8B1A3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
      } @else if (pendingClaims().length === 0) {
      <div class="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 gap-6">
        <span class="text-6xl opacity-40">📭</span>
        <div class="text-center">
          <h3 class="text-xl font-black text-slate-700 mb-1">Inbox Zero!</h3>
          <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">No pending claim requests to review</p>
        </div>
      </div>
      } @else {
      <div class="flex flex-col gap-6">
        @for (claim of pendingClaims(); track claim.id) {
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          
          <!-- Top bar -->
          <div class="px-8 py-4 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
            <div class="flex items-center gap-4">
              <span class="text-sm font-black text-[#8B1A3A] bg-[#C17B8C20] px-3 py-1 rounded-lg">{{ claim.claimNumber }}</span>
              <div class="h-4 w-px bg-slate-200"></div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">App: {{ claim.policyNumber || 'APP-' + claim.policyApplicationId }}</span>
            </div>
            <span class="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border bg-amber-50 border-amber-100 text-amber-600">
              Needs Review
            </span>
          </div>

          <!-- Main content body -->
          <div class="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10 bg-white relative">
            
            <!-- Left col: Details -->
            <div class="col-span-2 flex flex-col gap-6">
              
              <!-- Key Data -->
              <div class="flex flex-wrap gap-8">
                <div>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Incident Date</span>
                  <span class="text-[15px] font-black text-slate-800">{{ claim.incidentDate | date:'mediumDate' }}</span>
                </div>
                <div>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</span>
                  <span class="text-[15px] font-bold text-slate-700">{{ claim.incidentLocation }}</span>
                </div>
                <div>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Requested Amount</span>
                  <span class="text-lg font-black text-[#8B1A3A]">{{ claim.claimAmount | currency }}</span>
                </div>
              </div>

              <!-- Description -->
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Description</span>
                <p class="text-sm text-slate-600 font-semibold leading-relaxed bg-[#F9F0F3]/30 p-5 rounded-xl border border-[#C17B8C10]">
                  {{ claim.description }}
                </p>
              </div>
              
              <!-- Documents List -->
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Submitted Evidence</span>
                @if (!claim.documents || claim.documents.length === 0) {
                <div class="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-3">
                  <span class="text-lg grayscale opacity-50">📎</span>
                  <span class="text-xs font-bold text-slate-400">No documents attached</span>
                </div>
                } @else {
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (doc of claim.documents; track doc.id) {
                  <a [href]="getDocumentUrl(doc)" target="_blank"
                     class="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-[#8B1A3A] hover:shadow-md transition-all group">
                    <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg group-hover:bg-[#F9F0F3] transition-colors">
                      {{ getFileIcon(doc.fileType) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-slate-700 group-hover:text-[#8B1A3A] truncate transition-colors">{{ doc.fileName }}</p>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Click to view ↗</p>
                    </div>
                  </a>
                  }
                </div>
                }
              </div>

            </div>

            <!-- Right col: Actions panel -->
            <div class="flex flex-col gap-4 border-l border-slate-100 pl-10">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Make Decision</span>
              
              <button (click)="approveClaim(claim)"
                      class="w-full py-4 bg-[#8B1A3A] hover:bg-[#A92A4C] text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-[#8B1A3A]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
                <span class="text-lg">✅</span> Approve Claim
              </button>
              
              <button (click)="rejectClaim(claim)"
                      class="w-full py-4 bg-white border-2 border-rose-100 hover:border-rose-200 text-rose-500 hover:bg-rose-50 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
                <span class="text-lg opacity-80">❌</span> Reject Claim
              </button>

              <div class="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p class="text-[10px] font-bold text-slate-500 leading-relaxed">
                  <span class="text-[#8B1A3A] font-black">Note:</span> Decisions made here are final and will notify the policyholder immediately. Please ensure all evidence has been reviewed.
                </p>
              </div>
            </div>

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
                );
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

    getDocumentUrl(doc: ClaimDoc): string {
        return `/uploads/${doc.fileName}`; // Replace with actual backend serving URL if needed
    }

    getFileIcon(fileType: string): string {
        if (!fileType) return '📄';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return '🖼️';
        return '📎';
    }
}
