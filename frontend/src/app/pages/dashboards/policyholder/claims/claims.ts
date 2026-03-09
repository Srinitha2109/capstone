import { Component } from '@angular/core';

@Component({
    selector: 'app-policyholder-claims',
    standalone: true,
    template: `
    <div class="card">
      <h2>My Claims</h2>
      <p>View and manage your insurance claims.</p>
      <div class="no-data">
        <span class="icon">🩹</span>
        <p>No claims history found.</p>
      </div>
    </div>
  `,
    styles: [`
    .no-data { text-align: center; padding: 40px; color: var(--text-secondary); }
    .icon { font-size: 3rem; display: block; margin-bottom: 16px; }
  `]
})
export class ClaimsComponent { }
