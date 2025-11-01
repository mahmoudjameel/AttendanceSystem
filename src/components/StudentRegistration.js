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
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                {/* Inline simple SVG logo */}
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-md flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7v6c0 5 5 9 10 9s10-4 10-9V7l-10-5z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold">{t.title}</h1>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{t.instituteName}</div>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-300">{lang === 'ar' ? 'عربي' : 'English'}</span>
          </div>

          <div className="flex items-center gap-3">
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

            <label className="flex items-center gap-2 text-sm">
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

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Social links */}
              <a href={t.social_facebook} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-300">Facebook</a>
              <a href={t.social_instagram} target="_blank" rel="noreferrer" className="text-sm text-pink-600">Instagram</a>
              <a href={t.social_twitter} target="_blank" rel="noreferrer" className="text-sm text-blue-500">Twitter</a>
              <a href={t.social_linkedin} target="_blank" rel="noreferrer" className="text-sm text-sky-600">LinkedIn</a>
            </div>

            <div className="flex items-center gap-3 justify-end">
              {/* WhatsApp chat button */}
              <WhatsAppButton number={t.whatsappNumber} text={t.whatsappText} lang={lang} />
              {/* Call button */}
              <a href={`tel:${t.phoneNumber}`} className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                {lang === 'ar' ? 'اتصال' : 'Call'}: {t.phoneNumber}
              </a>
            </div>
          </div>
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
