import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Typography } from '../lib/supabase';
import { createOrUpdateTypography, getTypographies, TypographyInput } from '../lib/typographiesApi';

export const TypographiesPage: React.FC = () => {
  const [typographies, setTypographies] = useState<Typography[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TypographyInput>({
    name: '',
    contact_person: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTypographies = async () => {
    try {
      setLoading(true);
      const data = await getTypographies();
      setTypographies(data);
    } catch (err) {
      console.error(err);
      setError('Errore nel caricamento delle tipografie.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypographies();
  }, []);

  const handleEdit = (t: Typography) => {
    setForm({
      id: t.id,
      name: t.name,
      contact_person: t.contact_person ?? '',
      email: t.email,
    });
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      setError('Il nome è obbligatorio.');
      return false;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Inserisci una mail valida.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    try {
      setSaving(true);
      const saved = await createOrUpdateTypography({
        id: form.id,
        name: form.name.trim(),
        contact_person: form.contact_person?.trim() || '',
        email: form.email.trim(),
      });

      setSuccess(`Tipografia "${saved.name}" salvata correttamente.`);
      setForm({
        name: '',
        contact_person: '',
        email: '',
      });
      await loadTypographies();
    } catch (err) {
      console.error(err);
      setError('Errore nel salvataggio della tipografia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ff0000%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:border-white/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Torna alla Home</span>
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent tracking-tight mb-2">
            Tipografie
          </h1>
          <p className="text-white/70">
            Anagrafica delle tipografie a cui potrai inviare gli ordini dalla schermata di gestione ordini.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              {form.id ? 'Modifica tipografia' : 'Nuova tipografia'}
            </h2>

            {error && (
              <div className="mb-4 rounded-xl bg-red-500/20 border border-red-400/50 text-red-100 px-3 py-2 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl bg-green-500/20 border border-green-400/50 text-green-100 px-3 py-2 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Nome tipografia *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-red-500/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Persona di riferimento
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={form.contact_person}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-red-500/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-red-500/80"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg hover:from-red-600 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvataggio...' : 'Salva tipografia'}
              </button>
            </form>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Elenco tipografie</h2>

            {loading ? (
              <div className="py-8 text-center text-white/70">Caricamento tipografie...</div>
            ) : typographies.length === 0 ? (
              <div className="py-8 text-center text-white/70">
                Nessuna tipografia inserita. Aggiungine una dal form a sinistra.
              </div>
            ) : (
              <div className="space-y-3">
                {typographies.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleEdit(t)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-left hover:bg-white/15 hover:border-white/40 transition-all"
                  >
                    <div>
                      <div className="text-white font-semibold">{t.name}</div>
                      <div className="text-sm text-white/70">
                        {t.contact_person && <span className="mr-2">{t.contact_person} · </span>}
                        <span>{t.email}</span>
                      </div>
                    </div>
                    <span className="text-xs text-white/60">Clicca per modificare</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



