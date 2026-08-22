import React, { useState } from 'react';
import type { Card, Deck } from '../types/flashcard';
import { StorageService } from '../services/storageService';
import { X, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';


interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDeckId?: string;
  decks: Deck[];
  cards: Card[];
  onDataChanged: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  targetDeckId,
  decks,
  cards,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import-json' | 'import-csv'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [importCsvText, setImportCsvText] = useState('');
  const [selectedDeckForCsv, setSelectedDeckForCsv] = useState<string>(targetDeckId || decks[0]?.id || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Export full JSON
  const handleExportJSON = () => {
    soundEffects.playPop();
    const dataStr = StorageService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VocaFast_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Đã xuất file sao lưu JSON thành công!' });
  };

  // Export Deck to CSV
  const handleExportDeckCSV = () => {
    soundEffects.playPop();
    const deckCards = targetDeckId ? cards.filter(c => c.deckId === targetDeckId) : cards;
    const header = 'Word,IPA,PartOfSpeech,Meaning,ExampleEn,ExampleVi,Mnemonic\n';
    const rows = deckCards.map(c => 
      `"${c.word.replace(/"/g, '""')}","${(c.ipa || '').replace(/"/g, '""')}","${c.partOfSpeech}","${c.meaning.replace(/"/g, '""')}","${(c.exampleEn || '').replace(/"/g, '""')}","${(c.exampleVi || '').replace(/"/g, '""')}","${(c.mnemonic || '').replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VocaFast_Cards_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Đã xuất danh sách từ vựng ra file CSV thành công!' });
  };

  // Import full JSON
  const handleImportJSON = () => {
    if (!importJsonText.trim()) return;
    const res = StorageService.importData(importJsonText.trim());
    if (res.success) {
      soundEffects.playCorrect();
      setMessage({ type: 'success', text: res.message });
      onDataChanged();
      setTimeout(onClose, 1200);
    } else {
      soundEffects.playIncorrect();
      setMessage({ type: 'error', text: res.message });
    }
  };

  // Import CSV Lines
  const handleImportCSV = () => {
    if (!importCsvText.trim() || !selectedDeckForCsv) return;

    try {
      const lines = importCsvText.trim().split('\n');
      const newCards: Card[] = [];
      const today = new Date().toISOString().split('T')[0];

      lines.forEach((line, index) => {
        // Skip header if present
        if (index === 0 && line.toLowerCase().includes('word') && line.toLowerCase().includes('meaning')) {
          return;
        }
        const parts = line.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        if (parts[0] && parts[1]) {
          const word = parts[0];
          const ipa = parts[1] && parts[1].startsWith('/') ? parts[1] : '';
          const pos = (parts[2] || 'noun') as Card['partOfSpeech'];
          const meaning = parts[3] || parts[1]; // fallback if no ipa
          const exampleEn = parts[4] || '';
          const exampleVi = parts[5] || '';
          const mnemonic = parts[6] || '';

          newCards.push({
            id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            deckId: selectedDeckForCsv,
            word,
            ipa,
            partOfSpeech: pos,
            meaning,
            exampleEn,
            exampleVi,
            mnemonic,
            srsLevel: 0,
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            dueDate: today,
            mastery: 'new',
            createdAt: new Date().toISOString(),
          });
        }
      });

      if (newCards.length > 0) {
        const updatedAll = [...cards, ...newCards];
        StorageService.saveCards(updatedAll);
        soundEffects.playCorrect();
        setMessage({ type: 'success', text: `Đã nhập thành công ${newCards.length} từ vựng mới vào bộ thẻ!` });
        onDataChanged();
        setTimeout(onClose, 1200);
      } else {
        setMessage({ type: 'error', text: 'Không tìm thấy dòng từ vựng hợp lệ. Hãy kiểm tra định dạng CSV.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Lỗi xử lý file CSV: ' + String(e) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Sao Lưu &amp; Nhập Xuất Dữ Liệu (Import/Export)
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-4">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Xuất dữ liệu (Export)
          </button>
          <button
            onClick={() => setActiveTab('import-csv')}
            className={`py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'import-csv'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Nhập từ CSV / Excel
          </button>
          <button
            onClick={() => setActiveTab('import-json')}
            className={`py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'import-json'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Khôi phục JSON
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {message && (
            <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tải về dữ liệu học tập của bạn để lưu trữ an toàn hoặc chuyển sang thiết bị khác mà không lo mất tiến độ.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleExportJSON}
                  className="p-5 rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/40 hover:bg-brand-100/60 transition-all text-left group"
                >
                  <Download className="w-6 h-6 text-brand-600 dark:text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Sao Lưu Toàn Bộ (JSON)</h4>
                  <p className="text-xs text-slate-500 mt-1">Bao gồm toàn bộ bộ thẻ, từ vựng, cấp SRS, streak và thành tích.</p>
                </button>

                <button
                  onClick={handleExportDeckCSV}
                  className="p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100/60 transition-all text-left group"
                >
                  <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Xuất Thẻ Ra File CSV</h4>
                  <p className="text-xs text-slate-500 mt-1">File bảng tính Excel / CSV chứa danh sách từ và nghĩa dễ chia sẻ.</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import-csv' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Chọn Bộ Thẻ Đích Để Thêm Từ
                </label>
                <select
                  value={selectedDeckForCsv}
                  onChange={(e) => setSelectedDeckForCsv(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                >
                  {decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Dán nội dung CSV (Định dạng: Word, IPA, PartOfSpeech, Meaning, ExampleEn, ExampleVi, Mnemonic)
                </label>
                <textarea
                  rows={5}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder={`Word,IPA,PartOfSpeech,Meaning,ExampleEn,ExampleVi,Mnemonic\nUbiquitous,/juːˈbɪkwɪtəs/,adjective,Phổ biến khắp nơi,Smartphones are ubiquitous.,Điện thoại rất phổ biến.,U-bi-qui-tous`}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                onClick={handleImportCSV}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Nhập từ vựng vào bộ thẻ
              </button>
            </div>
          )}

          {activeTab === 'import-json' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Dán chuỗi mã JSON đã sao lưu từ trước để khôi phục lại toàn bộ dữ liệu.
              </p>
              <textarea
                rows={5}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"version": "1.0", "decks": [...], "cards": [...]}'
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={handleImportJSON}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Khôi phục dữ liệu từ JSON
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
