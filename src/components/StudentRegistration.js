import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import ar from '../i18n/ar.json';
import en from '../i18n/en.json';

const translations = { ar, en };

const StudentRegistration = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('reg_lang') || 'ar');
  const [theme, setTheme] = useState(() => localStorage.getItem('reg_theme') || 'light');

  const t = translations[lang] || translations.ar;

  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [major, setMajor] = useState('');
  const [status, setStatus] = useState(lang === 'ar' ? 'طالب' : 'Student');
  const [preferredDays, setPreferredDays] = useState('sat_mon_wed');
  const [preferredTime, setPreferredTime] = useState('9-1');
  const [photoConsent, setPhotoConsent] = useState('yes');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    // apply theme via `dark` class on html element (Tailwind class strategy)
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('reg_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('reg_lang', lang);
    // update status label when switching language
    setStatus(lang === 'ar' ? 'طالب' : 'Student');
  }, [lang]);

  const resetForm = () => {
    setFullName('');
    setContact('');
    setMajor('');
    setStatus(lang === 'ar' ? 'طالب' : 'Student');
    setPreferredDays('sat_mon_wed');
    setPreferredTime('9-1');
    setPhotoConsent('yes');
  };

  // validate and normalize phone number to international format (+ followed by digits)
  const validatePhone = (raw) => {
    if (!raw) return null;
    // remove spaces, parentheses and dashes
    let cleaned = raw.replace(/[\s()-]/g, '');

    // Handle common variants:
    // ++972...  -> +972...
    // 00972...  -> +972...
    // 972... or digits -> +972...
    if (cleaned.startsWith('++')) {
      cleaned = '+' + cleaned.slice(2);
    } else if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.slice(2);
    }
    // We only accept full international formats for Israel mobile prefixes 59 and 56.
    // Accepts: +97259xxxxxxx, +97256xxxxxxx, or 0097259xxxxxxx, 0097256xxxxxxx (we normalized 00.. to +.. above)
    if (!cleaned.startsWith('+')) return null;

    // Validate exact pattern: +9725[6|9] followed by 7 digits
    const match = cleaned.match(/^\+972(5[69])(\d{7})$/);
    if (!match) return null;
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!fullName.trim()) {
      setError(t.errFullName);
      return;
    }
    if (!contact.trim()) {
      setError(t.errContact);
      return;
    }

    const normalizedContact = validatePhone(contact.trim());
    if (!normalizedContact) {
      setError(t.errContactFormat || t.errContact);
      return;
    }
    if (!major.trim()) {
      setError(t.errMajor);
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      contact: normalizedContact,
      major: major.trim(),
      status,
      preferredDays,
      preferredTime,
      photoConsent,
      language: lang,
      createdAt: new Date().toISOString()
    };

    try {
      setSubmitting(true);
      const studentsRef = collection(db, 'students');
      await addDoc(studentsRef, payload);
      setMessage(t.success);
      resetForm();
    } catch (err) {
      console.error('Error adding student:', err);
      setError(t.errSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 reg-bg dark:bg-gray-900">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-md ring-1 ring-gray-100 dark:ring-gray-700 rounded-xl overflow-hidden">
        {/* Card header: organization name and logo */}
        <div className="border-b dark:border-gray-700">
          <div className="p-4 flex items-center gap-4 bg-[#0A1C1C] dark:bg-[#0A1C1C]">
            <div className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-white font-semibold">{t.instituteName}</div>
              <div className="text-lg font-bold text-white">{t.title}</div>
            </div>
          </div>

          <div className="flex items-center justify-end p-3 space-x-3 rtl:space-x-reverse">
            {/* Language segmented control */}
            <div className="inline-flex items-center bg-white dark:bg-gray-700/20 rounded-md p-1 border border-gray-100 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${lang === 'ar' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-600 dark:text-gray-300'}`}
                aria-pressed={lang === 'ar'}
                aria-label="العربية"
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${lang === 'en' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-600 dark:text-gray-300'}`}
                aria-pressed={lang === 'en'}
                aria-label="English"
              >
                English
              </button>
            </div>

            {/* Theme toggle with icons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center bg-transparent rounded-full p-1 focus:outline-none border border-gray-200 dark:border-gray-600"
                aria-label={theme === 'dark' ? (lang === 'ar' ? 'تبديل إلى الوضع الفاتح' : 'Switch to light mode') : (lang === 'ar' ? 'تبديل إلى الوضع الداكن' : 'Switch to dark mode')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-200">
                  {theme === 'dark' ? (
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
                  ) : (
                    <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.fullNameLabel}</label>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.fullNameHelp}</div>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: أحمد محمد علي' : 'e.g. John Michael Doe'}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.contactLabel}</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t.contactPlaceholder}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.majorLabel}</label>
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: علوم الحاسب - هندسة برمجيات' : 'e.g. Computer Science - Software Engineering'}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t.statusLabel}</label>
                  <div className="flex gap-4 items-center">
                    <div role="tablist" aria-label={t.statusLabel} className="inline-flex rounded-md bg-transparent border border-gray-200 dark:border-gray-700 p-1">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={status === (lang === 'ar' ? 'طالب' : 'Student')}
                        onClick={() => setStatus(lang === 'ar' ? 'طالب' : 'Student')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${status === (lang === 'ar' ? 'طالب' : 'Student') ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {t.student}
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={status === (lang === 'ar' ? 'فريلانسر' : 'Freelancer')}
                        onClick={() => setStatus(lang === 'ar' ? 'فريلانسر' : 'Freelancer')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${status === (lang === 'ar' ? 'فريلانسر' : 'Freelancer') ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {t.freelancer}
                      </button>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.daysLabel}</label>
                <div className="flex gap-4 items-center">
                  <div role="tablist" aria-label={t.daysLabel} className="inline-flex w-full rounded-md bg-transparent border border-gray-200 dark:border-gray-700 p-1">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={preferredDays === 'sat_mon_wed'}
                      onClick={() => setPreferredDays('sat_mon_wed')}
                      className={`w-1/2 px-3 py-2 text-sm text-center rounded-md transition-colors ${preferredDays === 'sat_mon_wed' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300 bg-transparent'}`}
                    >
                      {t.daysA}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={preferredDays === 'sun_tue_thu'}
                      onClick={() => setPreferredDays('sun_tue_thu')}
                      className={`w-1/2 px-3 py-2 text-sm text-center rounded-md transition-colors ${preferredDays === 'sun_tue_thu' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300 bg-transparent'}`}
                    >
                      {t.daysB}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.timeLabel}</label>
              {/* Segmented control for time selection for better visual affordance */}
              <div role="tablist" aria-label={t.timeLabel} className="inline-flex w-full rounded-md bg-transparent border border-gray-200 dark:border-gray-700 p-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={preferredTime === '9-1'}
                  onClick={() => setPreferredTime('9-1')}
                  className={`w-1/2 px-3 py-2 text-sm text-center rounded-md transition-colors ${preferredTime === '9-1' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300 bg-transparent'}`}
                >
                  <div className="leading-tight">{t.timeA}</div>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={preferredTime === '1-5'}
                  onClick={() => setPreferredTime('1-5')}
                  className={`w-1/2 px-3 py-2 text-sm text-center rounded-md transition-colors ${preferredTime === '1-5' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300 bg-transparent'}`}
                >
                  <div className="leading-tight">{t.timeB}</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.photoLabel}</label>
              <div className="flex gap-4 items-center">
                <div role="tablist" aria-label={t.photoLabel} className="inline-flex rounded-md bg-transparent border border-gray-200 dark:border-gray-700 p-1">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={photoConsent === 'yes'}
                    onClick={() => setPhotoConsent('yes')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${photoConsent === 'yes' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {t.photoYes}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={photoConsent === 'no'}
                    onClick={() => setPhotoConsent('no')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${photoConsent === 'no' ? (theme === 'dark' ? 'bg-[#E1F2F3] text-[#0A1C1C] font-medium' : 'bg-[#83D0D2] text-[#0A1C1C] font-medium') : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {t.photoNo}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center px-4 py-2 ${theme === 'dark' ? 'bg-white text-[#0A1C1C]' : 'bg-[#0A1C1C] text-white'} font-semibold rounded-md border border-[#0A1C1C] hover:opacity-95 disabled:opacity-60`}
              >
                {submitting ? t.sending : t.submit}
              </button>
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">{t.note}</div>
        </div>

        {/* Card footer */}
        <div className="border-t dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <a href={t.social_facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-indigo-600 dark:text-indigo-300 hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.09.18 2.09.18v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46v1.75h2.59l-.41 2.9h-2.18V22C18.34 21.2 22 17.06 22 12.07z"/></svg>
              </a>
              <a href={t.social_instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-pink-600 hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.5-3.9a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2z"/></svg>
              </a>
              <a href={t.social_linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-sky-600 hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11.02 0zM3 8.98h4v12H3zM9 8.98h3.84v1.65h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.09v6.32h-4v-5.6c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.69H9z"/></svg>
              </a>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <WhatsAppButton number={t.whatsappNumber} text={t.whatsappText} lang={lang} />
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center md:text-right">{(t.copyright || `© {year} Jreas Hub. All rights reserved.`).replace('{year}', new Date().getFullYear())}</div>
        </div>
      </div>
    </div>
  );
};

 
const WhatsAppButton = ({ number, text, lang }) => {
  const formatNumber = (n) => n.replace(/[^0-9]/g, '');
  const n = formatNumber(number);
  const url = `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-2">
        <path d="M20.5 3.5A11.9 11.9 0 0012 1C6.5 1 2 5.5 2 11c0 1.9.5 3.6 1.4 5.1L2 23l6.2-1.6A11.8 11.8 0 0012 23c5.5 0 10-4.5 10-10 0-1.7-.4-3.3-1.5-4.9z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
      </svg>
      {lang === 'ar' ? 'دردشة واتساب' : 'WhatsApp Chat'}
    </a>
  );
};

export default StudentRegistration;
