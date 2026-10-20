'use client'
import React from 'react';
import { useUser } from '@clerk/nextjs';
import planData from '@/utils/planData';
import PricingSection1 from '@/components/ui/pricing-section-1';

const DESCRIPTIONS = {
    Free: 'Everything you need to start practising out loud.',
    Monthly: 'For a job hunt in full swing: more interviews, more help.',
};

// Plan. Checkout uses a Stripe test-mode payment link (no real charges).
function Upgrade() {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? '';

    const tiers = planData.map((plan) => ({
        id: String(plan.id),
        name: plan.name,
        description: DESCRIPTIONS[plan.name] ?? '',
        price: `$${plan.cost === 0 ? '0' : plan.cost.toFixed(2)}`,
        frequency: '/month',
        features: plan.offering.map((o) => ({ text: o.value, included: o.included })),
        popular: Boolean(plan.paymentLink),
        cta: plan.paymentLink
            ? { label: 'Upgrade', href: `${plan.paymentLink}?prefilled_email=${encodeURIComponent(email)}`, external: true }
            : { label: 'Your current plan', disabled: true },
    }));

    return (
        <PricingSection1
            tiers={tiers}
            eyebrow="Plan"
            title="Pick the plan for your interview prep"
            subtitle="You're on the Free plan. Checkout runs in Stripe test mode, so no real payment is taken."
            headingLevel="h1"
        />
    );
}

export default Upgrade;
