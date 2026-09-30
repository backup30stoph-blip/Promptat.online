import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Send, Shield } from 'lucide-react';
import { cmsService } from '../../../services/cmsService';

export const NewsletterColumn: React.FC = () => {
  const { showNotification, t } = useApp();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await cmsService.subscribeToNewsletter(email);
      showNotification(res.message || t('subscribeSuccess', 'Successfully subscribed!'), 'success');
      setIsSubmitted(true);
      setEmail('');
    } catch (err: any) {
      showNotification(err.message || 'Failed to subscribe. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Column Heading */}
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C8798] select-none">
        {t('footerStayUpdated', 'STAY UPDATED')}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-[#64748B]">
        {t('footerNewsletterDesc', 'Fresh prompt blueprints delivered to your inbox.')}
      </p>

      {/* Subscription Form */}
      {isSubmitted ? (
        <div 
          className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-4 text-center text-xs text-slate-600"
          id="footer-news-success"
        >
          <span className="font-semibold text-emerald-800 block mb-0.5">{t('subscribeSuccess', 'Subscription Confirmed!')}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5 w-full">
          {/* Label for accessibility */}
          <label htmlFor="footer-email-input" className="sr-only">
            {t('newsletterInputPlaceholder', 'Enter your email')}
          </label>
          <div className="relative w-full">
            <input
              id="footer-email-input"
              type="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletterInputPlaceholder', 'Enter your email')}
              className="w-full rounded-md border border-slate-200 bg-white py-3 pl-3 pr-12 rtl:pr-3 rtl:pl-12 text-sm outline-none transition-all focus:border-[#E4433C] focus:ring-1 focus:ring-[#E4433C] min-h-[48px]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute inset-y-1.5 right-1.5 rtl:right-auto rtl:left-1.5 flex h-9 w-9 items-center justify-center rounded-md bg-[#E4433C] text-white shadow-sm hover:bg-[#c21124] transition-colors cursor-pointer disabled:opacity-50"
              aria-label={t('subscribeButton', 'Subscribe')}
              id="footer-newsletter-btn"
            >
              <Send className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
          
          {/* Compliance Info */}
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[11px] text-[#64748B]">
            <Shield className="h-3.5 w-3.5 text-[#E4433C] shrink-0" />
            <span>{t('newsletterPrivacy', 'We respect your privacy completely. Unsubscribe anytime with a single click.')}</span>
          </div>
        </form>
      )}
    </div>
  );
};
