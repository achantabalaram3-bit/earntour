import { AlertTriangle } from 'lucide-react';

export const LegalReviewNotice = () => (
  <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900" data-testid="legal-review-notice">
    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
    <p className="text-sm leading-relaxed">
      <b>Requires Indian legal review.</b> This document was inherited from the previous UK product and has not yet been
      reviewed for TallSkill India. It may reference UK law, GBP amounts, payments or postal entry that do not apply to
      TallSkill, which has no deposits and no paid entry.
    </p>
  </div>
);
