'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Work {
  title: string;
  type: string;
  author: string;
  text: string;
}

export default function AdminPage() {
  const [bucketName, setBucketName] = useState('');
  const [bucketNumber, setBucketNumber] = useState(1);
  const [works, setWorks] = useState<Work[]>([{ title: '', type: '', author: '', text: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const addWork = () => {
    setWorks([...works, { title: '', type: '', author: '', text: '' }]);
  };

  const removeWork = (index: number) => {
    if (works.length > 1) {
      setWorks(works.filter((_, i) => i !== index));
    }
  };

  const updateWork = (index: number, field: keyof Work, value: string) => {
    const updatedWorks = works.map((work, i) =>
      i === index ? { ...work, [field]: value } : work
    );
    setWorks(updatedWorks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validate that all works have required fields
    const invalidWorks = works.filter(work =>
      !work.title.trim() || !work.type.trim() || !work.author.trim() || !work.text.trim()
    );

    if (invalidWorks.length > 0) {
      setMessage('Lütfen tüm eserlerin tüm alanlarını doldurun.');
      setIsSubmitting(false);
      return;
    }

    if (!bucketName.trim()) {
      setMessage('Bucket adı gereklidir.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/buckets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketName: bucketName.trim(),
          bucketNumber,
          works,
        }),
      });

      if (response.ok) {
        setMessage('Bucket başarıyla eklendi!');
        setBucketName('');
        setBucketNumber(1);
        setWorks([{ title: '', type: '', author: '', text: '' }]);
      } else {
        const error = await response.json();
        setMessage(`Hata: ${error.error}`);
      }
    } catch (error) {
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-6 text-center">Bucket Ekle - Admin Paneli</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bucket Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bucketName" className="block text-sm font-medium text-slate-300 mb-2">
                Bucket Adı *
              </label>
              <input
                type="text"
                id="bucketName"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Bucket adını girin"
              />
            </div>

            <div>
              <label htmlFor="bucketNumber" className="block text-sm font-medium text-slate-300 mb-2">
                Bucket Numarası *
              </label>
              <input
                type="number"
                id="bucketNumber"
                value={bucketNumber}
                onChange={(e) => setBucketNumber(parseInt(e.target.value) || 1)}
                min="1"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Works */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-300">Eserler</h3>
              <button
                type="button"
                onClick={addWork}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                + Eser Ekle
              </button>
            </div>

            {works.map((work, index) => (
              <div key={index} className="border border-slate-600 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-slate-400">Eser {index + 1}</h4>
                  {works.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWork(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Sil
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      value={work.title}
                      onChange={(e) => updateWork(index, 'title', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Eser başlığını girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tür *
                    </label>
                    <input
                      type="text"
                      value={work.type}
                      onChange={(e) => updateWork(index, 'type', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Kitap, Şiir, vb."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Yazar *
                    </label>
                    <input
                      type="text"
                      value={work.author}
                      onChange={(e) => updateWork(index, 'author', e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Yazar adını girin"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Metin *
                    </label>
                    <textarea
                      value={work.text}
                      onChange={(e) => updateWork(index, 'text', e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-vertical"
                      placeholder="Eser metnini girin"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold shadow-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Bucket\'ı Kaydet'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.includes('başarıyla') ? 'bg-green-900/50 border border-green-600 text-green-300' : 'bg-red-900/50 border border-red-600 text-red-300'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
