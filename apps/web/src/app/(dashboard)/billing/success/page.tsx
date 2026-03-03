import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Subscription Active - Siza',
};

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="siza-shell-card max-w-xl p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Welcome to Pro!</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your subscription is active. You now have access to all Pro features including 500 AI
          generations per month, unlimited projects, and multi-LLM support.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to dashboard
          </Link>
          <Link
            href="/billing"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            View billing
          </Link>
        </div>
      </div>
    </div>
  );
}
