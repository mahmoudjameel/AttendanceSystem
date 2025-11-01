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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-900">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-lg rounded-lg overflow-hidden">
        {/* Card header: organization name and logo */}
        <div className="border-b dark:border-gray-700">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-800 dark:to-indigo-900 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-md flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v6c0 5 5 9 10 9s10-4 10-9V7l-10-5z" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t.instituteName}</div>
              <div className="text-lg font-semibold">{t.title}</div>
            </div>
          </div>

          <div className="flex items-center justify-end p-3">
            <label className="flex items-center gap-2 text-sm">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded-md border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-1"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm ml-3">
              <span className="text-xs text-gray-500 dark:text-gray-300">{theme === 'dark' ? (lang === 'ar' ? 'داكن' : 'Dark') : (lang === 'ar' ? 'فاتح' : 'Light')}</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors"
                aria-label="Toggle theme"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow transform transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`}
                />
              </button>
            </label>
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
                className="w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.contactLabel}</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t.contactPlaceholder}
                className="w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.majorLabel}</label>
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: علوم الحاسب - هندسة برمجيات' : 'e.g. Computer Science - Software Engineering'}
                className="w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t.statusLabel}</label>
                <div className="flex gap-4 items-center">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="status" value={lang === 'ar' ? 'طالب' : 'Student'} checked={status === (lang === 'ar' ? 'طالب' : 'Student')} onChange={() => setStatus(lang === 'ar' ? 'طالب' : 'Student')} />
                    <span className="text-sm">{lang === 'ar' ? t.student : t.student}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="status" value={lang === 'ar' ? 'فريلانسر' : 'Freelancer'} checked={status === (lang === 'ar' ? 'فريلانسر' : 'Freelancer')} onChange={() => setStatus(lang === 'ar' ? 'فريلانسر' : 'Freelancer')} />
                    <span className="text-sm">{lang === 'ar' ? t.freelancer : t.freelancer}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.daysLabel}</label>
                <div className="flex gap-4 items-center">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="days" value="sat_mon_wed" checked={preferredDays === 'sat_mon_wed'} onChange={() => setPreferredDays('sat_mon_wed')} />
                    <span className="text-sm">{t.daysA}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="days" value="sun_tue_thu" checked={preferredDays === 'sun_tue_thu'} onChange={() => setPreferredDays('sun_tue_thu')} />
                    <span className="text-sm">{t.daysB}</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.timeLabel}</label>
              <div className="flex gap-4 items-center">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="time" value="9-1" checked={preferredTime === '9-1'} onChange={() => setPreferredTime('9-1')} />
                  <span className="text-sm">{t.timeA}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="time" value="1-5" checked={preferredTime === '1-5'} onChange={() => setPreferredTime('1-5')} />
                  <span className="text-sm">{t.timeB}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.photoLabel}</label>
              <div className="flex gap-4 items-center">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="photo" value="yes" checked={photoConsent === 'yes'} onChange={() => setPhotoConsent('yes')} />
                  <span className="text-sm">{t.photoYes}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="photo" value="no" checked={photoConsent === 'no'} onChange={() => setPhotoConsent('no')} />
                  <span className="text-sm">{t.photoNo}</span>
                </label>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
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
              <a href={t.social_twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-blue-500 hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.92c-.63.28-1.3.47-2 .55a3.48 3.48 0 001.53-1.92 6.92 6.92 0 01-2.2.83A3.46 3.46 0 0016.1 4c-1.92 0-3.48 1.57-3.48 3.5 0 .27.03.54.09.8A9.83 9.83 0 013 5.15a3.5 3.5 0 001.08 4.66 3.44 3.44 0 01-1.57-.43v.04c0 1.7 1.2 3.12 2.8 3.44-.29.08-.6.12-.92.12-.22 0-.42-.02-.62-.06.42 1.3 1.62 2.25 3.05 2.28A6.95 6.95 0 012 19.54a9.8 9.8 0 005.3 1.55c6.36 0 9.85-5.27 9.85-9.84v-.45A6.98 6.98 0 0022 5.92z"/></svg>
              </a>
              <a href={t.social_linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-sky-600 hover:opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11.02 0zM3 8.98h4v12H3zM9 8.98h3.84v1.65h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.09v6.32h-4v-5.6c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.69H9z"/></svg>
              </a>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <WhatsAppButton number={t.whatsappNumber} text={t.whatsappText} lang={lang} />
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center md:text-right">© {new Date().getFullYear()} {t.instituteName}. All rights reserved.</div>
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
