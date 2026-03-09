import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyApplicationService, PolicyApplication } from '../../../../services/policy-application.service';
import { PaymentService } from '../../../../services/payment.service';
import { AuthService } from '../../../../services/auth';
import { NotificationService } from '../../../../services/notification';
import { ClaimService, Claim } from '../../../../services/claim.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-policyholder-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-black text-burgundy tracking-tight">My Applications</h1>
                <p class="text-sm text-slate-500 font-bold uppercase mt-1 tracking-tight">Track and manage your policy requests</p>
            </div>
            <div class="bg-burgundy/5 px-6 py-3 rounded-2xl border border-burgundy/10 shadow-sm">
                <span class="text-sm font-black text-burgundy">{{ applications().length }} Total Applications</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (app of applications(); track app.id) {
            <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-burgundy/10 transition-all duration-500 overflow-hidden flex flex-col group">
                <!-- Status Header -->
                <div class="px-8 py-5 flex items-center justify-between border-b border-white/10" 
                     [ngClass]="getStatusBg(app.status)">
                    <span class="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">{{ app.policyNumber }}</span>
                    <span class="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase rounded-lg backdrop-blur-md border border-white/20">
                        {{ app.status }}
                    </span>
                </div>

                <div class="p-8 flex-1 flex flex-col gap-6">
                    <div>
                        <h3 class="text-xl font-black text-slate-800 leading-tight group-hover:text-burgundy transition-colors uppercase tracking-tight">
                            {{ app.planName || 'Insurance Plan' }}
                        </h3>
                        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1.5 flex items-center gap-2">
                             PLAN: {{ app.paymentPlan }}
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                            <span class="block text-[9px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Coverage</span>
                            <span class="text-base font-black text-slate-700">{{ app.selectedCoverageAmount | currency }}</span>
                        </div>
                        <div class="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                            <span class="block text-[9px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Premium</span>
                            <span class="text-base font-black text-burgundy">{{ app.premiumAmount | currency }}</span>
                        </div>
                    </div>

                    <div class="space-y-4 pt-2">
                        <div class="flex justify-between items-center px-1">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</span>
                            <span class="text-xs font-black text-burgundy">{{ (app.endDate | date:'mediumDate') || 'TBD' }}</span>
                        </div>
                        <div class="flex justify-between items-center px-1">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Payment Due</span>
                            <span class="text-xs font-black text-slate-700">{{ app.nextPaymentDueDate ? (app.nextPaymentDueDate | date:'mediumDate') : 'Pending Payment' }}</span>
                        </div>
                    </div>

                    <div class="mt-2 flex flex-col gap-3">
                        @if (isPaymentRequired(app)) {
                        <button (click)="payPremium(app)"
                                class="w-full py-4 bg-burgundy text-white text-sm font-black rounded-2xl hover:bg-burgundy-secondary transition-all shadow-lg shadow-burgundy/20 flex items-center justify-center gap-3 group/btn hover:scale-[1.02] active:scale-95">
                             <span class="text-lg group-btn:rotate-12 transition-transform">💳</span> 
                             Pay Premium
                        </button>
                        } @else if (app.status === 'ACTIVE') {
                        <button class="w-full py-4 bg-[#E6F9F3] text-[#00A389] border border-[#D1F2E9] text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-default">
                             <span class="text-base">✅</span> 
                             Paid (Next: {{ app.nextPaymentDueDate | date:'mediumDate' }})
                        </button>
                        @if (getAvailableBalance(app) > 0) {
                        <button (click)="openClaimModal(app)"
                                class="w-full py-3 bg-burgundy/5 text-burgundy border border-burgundy/10 text-xs font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-burgundy hover:text-white transition-all">
                             <span>🆘</span> Raise Claim
                        </button>
                        } @else {
                        <div class="w-full py-3 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-black rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                            <span>🚫</span> Coverage Limit Reached
                        </div>
                        }
                        } @else if (app.status === 'REJECTED') {
                        <div class="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                            <span class="block text-[9px] font-black uppercase text-rose-400 mb-1 tracking-widest">Rejection Reason</span>
                            <p class="text-xs font-bold text-rose-700 italic leading-relaxed">"{{ app.rejectionReason || 'No reason provided' }}"</p>
                        </div>
                        } @else {
                        <div class="flex flex-col items-center justify-center gap-3 py-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                            <div class="flex gap-1.5">
                                <div class="w-2 h-2 rounded-full bg-burgundy/20 animate-bounce" style="animation-delay: 0ms"></div>
                                <div class="w-2 h-2 rounded-full bg-burgundy/40 animate-bounce" style="animation-delay: 150ms"></div>
                                <div class="w-2 h-2 rounded-full bg-burgundy/60 animate-bounce" style="animation-delay: 300ms"></div>
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Under Agent Review</span>
                        </div>
                        }
                    </div>
                </div>
            </div>
            } @empty {
            <div class="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 gap-6">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-5xl grayscale opacity-50 shadow-inner">📄</div>
                <div class="text-center">
                    <h3 class="text-2xl font-black text-slate-800 mb-2">No Applications Found</h3>
                    <p class="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">Your journey to comprehensive protection starts here. Browse our available policies.</p>
                </div>
            </div>
            }
        </div>
    </div>

    <!-- Raise Claim Modal -->
    @if (showClaimModal()) {
    <div class="fixed inset-0 bg-slate-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">
            <!-- Modal Header -->
            <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                    <h2 class="text-xl font-black text-slate-800">Raise a Claim</h2>
                    <p class="text-xs text-slate-400 font-semibold mt-0.5">Application ID: <span class="font-black text-burgundy">#{{ selectedApp()?.id }}</span></p>
                </div>
                <button (click)="closeClaimModal()" class="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">✕</button>
            </div>

            <!-- Available Balance Banner -->
            <div class="mx-8 mt-6 p-4 rounded-xl flex items-center justify-between"
                 [ngClass]="getAvailableBalance(selectedApp()!) > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'">
                <div>
                    <span class="text-[10px] font-black uppercase tracking-widest"
                          [ngClass]="getAvailableBalance(selectedApp()!) > 0 ? 'text-emerald-500' : 'text-rose-400'">Coverage Balance Available</span>
                    <p class="text-base font-black mt-0.5"
                       [ngClass]="getAvailableBalance(selectedApp()!) > 0 ? 'text-emerald-700' : 'text-rose-600'">
                        {{ getAvailableBalance(selectedApp()!) | currency }}
                    </p>
                </div>
                <div class="text-right">
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Coverage Limit</span>
                    <p class="text-sm font-black text-slate-600">{{ selectedApp()?.selectedCoverageAmount | currency }}</p>
                    <span class="text-[10px] font-semibold text-slate-400">Settled: {{ (selectedApp()?.totalSettledAmount || 0) | currency }}</span>
                </div>
            </div>

            <div class="px-8 pt-6 pb-8 space-y-5">
                <div class="grid grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Incident Date</label>
                        <input type="date" [(ngModel)]="claimForm.incidentDate"
                               class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 outline-none font-semibold text-sm text-slate-700">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Incident Location</label>
                        <input type="text" [(ngModel)]="claimForm.incidentLocation" placeholder="e.g. Hyderabad"
                               class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 outline-none font-semibold text-sm text-slate-700 placeholder:text-slate-300">
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description of Incident</label>
                    <textarea [(ngModel)]="claimForm.description" rows="4" placeholder="Describe what happened in detail..."
                              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 outline-none font-semibold text-sm text-slate-700 placeholder:text-slate-300 resize-none"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Estimated Claim Amount ($)</label>
                        <input type="number" [(ngModel)]="claimForm.claimAmount" min="0"
                               [max]="getAvailableBalance(selectedApp()!)"
                               class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy/30 outline-none font-semibold text-sm text-slate-700">
                        @if (claimForm.claimAmount > getAvailableBalance(selectedApp()!)) {
                        <p class="text-[10px] text-rose-500 font-bold">Exceeds available balance of {{ getAvailableBalance(selectedApp()!) | currency }}</p>
                        }
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upload Documents</label>
                        <div class="relative">
                            <input type="file" (change)="onFileSelected($event)" multiple class="absolute inset-0 opacity-0 cursor-pointer">
                            <div class="w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl text-center">
                                <p class="text-[10px] font-black text-slate-400 uppercase">
                                    {{ selectedFiles.length > 0 ? selectedFiles.length + ' file(s) selected' : '📎 Click to upload proof' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 pt-2">
                    <button (click)="closeClaimModal()" class="flex-1 py-3.5 border border-slate-200 rounded-xl font-black text-sm text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button (click)="submitClaim()"
                            [disabled]="isSubmitting() || claimForm.claimAmount <= 0 || claimForm.claimAmount > getAvailableBalance(selectedApp()!)"
                            class="flex-[2] py-3.5 bg-burgundy text-white rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isSubmitting() ? 'Submitting...' : 'Submit Claim' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
  `]
})
export class ApplicationsComponent implements OnInit {
  private policyAppService = inject(PolicyApplicationService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);
  private claimService = inject(ClaimService);

  applications = signal<PolicyApplication[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // Claim Modal State
  showClaimModal = signal(false);
  selectedApp = signal<PolicyApplication | null>(null);
  selectedFiles: File[] = [];
  claimForm = {
    incidentDate: '',
    incidentLocation: '',
    description: '',
    claimAmount: 0
  };

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.policyAppService.getApplicationsByUserId(user.id).subscribe({
        next: (apps) => {
          this.applications.set(apps);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  getStatusBg(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'bg-burgundy';
      case 'APPROVED': return 'bg-burgundy/80';
      case 'REJECTED': return 'bg-rose-600';
      case 'SUBMITTED': return 'bg-burgundy/40';
      case 'UNDER_REVIEW': return 'bg-burgundy/60';
      default: return 'bg-slate-400';
    }
  }

  isPaymentRequired(app: PolicyApplication): boolean {
    if (!app.status) return false;
    if (app.status === 'APPROVED') return true;
    if (app.status === 'ACTIVE') {
      if (!app.nextPaymentDueDate) return false;
      const dueDate = new Date(app.nextPaymentDueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return today >= dueDate;
    }
    return false;
  }

  payPremium(app: PolicyApplication) {
    if (!app.id || !app.premiumAmount) return;

    this.paymentService.createPayment({
      policyApplicationId: app.id,
      amount: app.premiumAmount,
      paymentMethod: 'CARD',
      paymentType: 'PREMIUM'
    }).subscribe({
      next: () => {
        this.notificationService.show('Payment Done! Your policy is now ACTIVE.', 'success');
        this.loadApplications();
      },
      error: () => this.notificationService.show('Payment failed. Please try again.', 'error')
    });
  }

  getAvailableBalance(app: PolicyApplication): number {
    if (!app || !app.selectedCoverageAmount) return 0;
    const settled = app.totalSettledAmount ?? 0;
    const available = (app.selectedCoverageAmount as number) - (settled as number);
    return available > 0 ? available : 0;
  }

  openClaimModal(app: PolicyApplication) {
    this.selectedApp.set(app);
    this.showClaimModal.set(true);
    this.claimForm = {
      incidentDate: new Date().toISOString().split('T')[0],
      incidentLocation: '',
      description: '',
      claimAmount: 0
    };
    this.selectedFiles = [];
  }

  closeClaimModal() {
    this.showClaimModal.set(false);
    this.selectedApp.set(null);
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  submitClaim() {
    const app = this.selectedApp();
    if (!app || !app.id) return;

    if (!this.claimForm.incidentDate || !this.claimForm.incidentLocation || !this.claimForm.description || this.claimForm.claimAmount <= 0) {
      this.notificationService.show('Please fill all required fields correctly.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    const claimData: Claim = {
      policyApplicationId: app.id,
      description: this.claimForm.description,
      claimAmount: this.claimForm.claimAmount,
      incidentDate: this.claimForm.incidentDate,
      incidentLocation: this.claimForm.incidentLocation
    };

    this.claimService.createClaim(claimData, this.selectedFiles).subscribe({
      next: () => {
        this.notificationService.show('Claim submitted successfully! Our officer will contact you.', 'success');
        this.isSubmitting.set(false);
        this.closeClaimModal();
      },
      error: (err) => {
        console.error('Claim error:', err);
        this.notificationService.show('Failed to submit claim. Please try again.', 'error');
        this.isSubmitting.set(false);
      }
    });
  }
}
