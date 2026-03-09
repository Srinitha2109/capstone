import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyApplicationService, PolicyApplication } from '../../../../services/policy-application.service';
import { PaymentService } from '../../../../services/payment.service';
import { AuthService } from '../../../../services/auth';
import { NotificationService } from '../../../../services/notification';

@Component({
  selector: 'app-policyholder-applications',
  standalone: true,
  imports: [CommonModule],
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

                    <div class="mt-2">
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

  applications = signal<PolicyApplication[]>([]);
  isLoading = signal(true);

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
      case 'ACTIVE': return 'bg-emerald-500';
      case 'APPROVED': return 'bg-burgundy';
      case 'REJECTED': return 'bg-rose-600';
      case 'SUBMITTED': return 'bg-sky-500';
      case 'UNDER_REVIEW': return 'bg-indigo-500';
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
      // Reset hours for accurate date comparison
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
}
