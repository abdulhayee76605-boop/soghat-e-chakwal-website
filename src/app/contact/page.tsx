'use client';

// ============================================================
// Contact Page — Soghat-e-Chakwal
// ============================================================

import { useState } from 'react';
import { PageHero } from '@/components/common/PageHero';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate contact form submission
    setSubmitted(true);
  };

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! I want to inquire about Soghat-e-Chakwal products.`
    );
    window.open(`${siteConfig.whatsappLink}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-brand-ivory min-h-screen">
      <PageHero
        eyebrow="GET IN TOUCH"
        title="Contact &amp; Inquiries"
        urduTitle="ہم سے رابطہ کریں"
        subtitle="Have a question about our traditional products or wish to place a customized bulk order? We are here to help."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details (Left Column) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-brand-green/10 shadow-sm space-y-6">
              <h2 className="font-heading text-2xl font-bold text-brand-green">
                Direct Contact Channels
              </h2>
              <p className="text-sm text-brand-charcoal/70">
                For the quickest response, please message us directly on WhatsApp.
              </p>

              {/* WhatsApp Card */}
              <div
                onClick={handleWhatsAppClick}
                className="cursor-pointer bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/30 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-[#1e8a45] tracking-wider">
                    Official WhatsApp
                  </p>
                  <p className="font-heading font-bold text-lg text-brand-charcoal">
                    0300-8325693
                  </p>
                  <p className="text-[11px] text-brand-charcoal/60">
                    Click to chat instantly
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-ivory border border-brand-green/10">
                <div className="w-10 h-10 rounded-xl bg-brand-green text-brand-gold flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                    Call Center / Helpline
                  </p>
                  <p className="font-semibold text-sm text-brand-green mt-0.5">
                    +92 300 8325693
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-ivory border border-brand-green/10">
                <div className="w-10 h-10 rounded-xl bg-brand-green text-brand-gold flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                    Distribution &amp; Outlet Address
                  </p>
                  <p className="text-xs sm:text-sm text-brand-charcoal/80 leading-relaxed mt-0.5">
                    Street 1, Shop MC33,<br />
                    Ghauri Town, Phase 7,<br />
                    Islamabad, Pakistan.
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-brand-ivory border border-brand-green/10">
                <div className="w-10 h-10 rounded-xl bg-brand-green text-brand-gold flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                    Customer Support Hours
                  </p>
                  <p className="text-xs text-brand-charcoal/80 mt-0.5">
                    Monday &ndash; Saturday: 9:00 AM &ndash; 6:00 PM (PKT)<br />
                    Sunday: Online WhatsApp orders only
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (Right Column) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-brand-green/10 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-brand-green mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-brand-charcoal/70 mb-8">
                Fill in the details below and our customer care team will get back to you shortly.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-4 bg-brand-cream/60 rounded-2xl border border-brand-gold/40 p-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-brand-green">
                    Thank You for Reaching Out!
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-charcoal/70 max-w-md mx-auto">
                    We have received your message. A representative from Soghat-e-Chakwal will reach out to you via WhatsApp or phone call.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                    }}
                    className="inline-block text-xs font-bold text-brand-green hover:underline mt-2"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-sm bg-brand-ivory/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0300 1234567"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-sm bg-brand-ivory/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-sm bg-brand-ivory/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Order inquiry, bulk purchase, feedback"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-sm bg-brand-ivory/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your questions or message here..."
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/20 focus:outline-none focus:border-brand-gold text-sm bg-brand-ivory/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-green text-brand-cream px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-brand-green-light transition-all shadow-md active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
