// Rounded Top Footer from Hirael <https://hirael.com/blocks/footer/footer-02>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael
// Adapted: JavaScript, Next.js links, this product's columns and brand.

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

const ENTER =
  'animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] fill-mode-both motion-reduce:animate-none';

const stagger = (index) => ({ animationDelay: `${index * 60}ms` });

const MAX_LINKS = 5;

// Columns: [{ title, href, links: [{ label, href }] }]. Only real pages.
const COLUMNS = [
  {
    title: 'Practice',
    href: '/dashboard',
    links: [
      { label: 'Start an interview', href: '/dashboard' },
      { label: 'Your interviews', href: '/dashboard' },
      { label: 'How it works', href: '/how-it-works' },
    ],
  },
  {
    title: 'Plans',
    href: '/dashboard/upgrade',
    links: [
      { label: 'Pricing', href: '/dashboard/upgrade' },
      { label: 'Free plan', href: '/dashboard/upgrade' },
      { label: 'Monthly plan', href: '/dashboard/upgrade' },
    ],
  },
  {
    title: 'Account',
    href: '/sign-in',
    links: [
      { label: 'Sign in', href: '/sign-in' },
      { label: 'Create an account', href: '/sign-up' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

const META_LINKS = [
  { label: 'GitHub', href: 'https://github.com/yashk9293' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yashk9293/' },
];

const Footer02 = ({ columns = COLUMNS }) => {
  return (
    <footer data-slot="footer" className="relative mx-2 rounded-t-3xl border-t border-border bg-background xl:mx-4">
      <div data-slot="footer-inner" className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(35%_128px_at_50%_0%,color-mix(in_oklch,var(--brand)_14%,transparent),transparent)]"
        />

        <div className="relative flex flex-col gap-10 lg:flex-row">
          <div data-slot="footer-brand" className={cn(ENTER, 'flex flex-col gap-3 lg:w-1/3')}>
            <Logo compact />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Practise job interviews out loud. Five questions for your exact role, each answer rated out of 10 with
              feedback and a model answer.
            </p>
          </div>

          <nav
            data-slot="footer-nav"
            aria-label="Footer"
            className="grid flex-1 grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3"
          >
            {columns.map((col, index) => (
              <div data-slot="footer-column" key={col.title} style={stagger(index + 1)} className={ENTER}>
                <Link
                  href={col.href}
                  className="text-sm font-semibold text-foreground transition-colors duration-150 hover:text-primary"
                >
                  {col.title}
                </Link>
                <ul className="mt-3 space-y-2.5">
                  {col.links.slice(0, MAX_LINKS).map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {col.links.length > MAX_LINKS && (
                    <li>
                      <Link
                        href={col.href}
                        className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        View all
                        <ArrowRight className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div
          data-slot="footer-meta"
          style={stagger(4)}
          className={cn(
            ENTER,
            'relative mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6',
            'sm:flex-row sm:items-center',
          )}
        >
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AI Interview Mocker. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {META_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer02;
