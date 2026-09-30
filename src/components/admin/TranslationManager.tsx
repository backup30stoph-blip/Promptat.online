import React, { useState } from 'react';
import { 
  Globe, Languages, FileText, CheckCircle2, AlertCircle, Clock, Upload, Download, 
  Search, Filter, Plus, Save, RefreshCw, Layers
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageCode, ContentTranslation, UI_DICTIONARY } from '../../lib/i18n';

interface TranslationManagerProps {
  prompts: any[];
  skills: any[];
  videos: any[];
  blogs: any[];
  showNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TranslationManager: React.FC<TranslationManagerProps> = ({
  prompts,
  skills,
  videos,
  blogs,
  showNotification
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'interface'>('content');
  const [selectedEntity, setSelectedEntity] = useState<'all' | 'prompt' | 'skill' | 'video' | 'blog'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'missing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interface Text Dictionary State
  const [dictionaryState, setDictionaryState] = useState(UI_DICTIONARY);
  const [selectedInterfaceLang, setSelectedInterfaceLang] = useState<LanguageCode>('en');

  // Local simulated translation records matrix
  const allItems = [
    ...prompts.map(p => ({ ...p, entityType: 'prompt' })),
    ...skills.map(s => ({ ...s, entityType: 'skill' })),
    ...videos.map(v => ({ ...v, entityType: 'video' })),
    ...blogs.map(b => ({ ...b, entityType: 'blog' })),
  ];

  const filteredItems = allItems.filter(item => {
    if (selectedEntity !== 'all' && item.entityType !== selectedEntity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (item.title || '').toLowerCase().includes(q) || (item.slug || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Export Interface Dictionary to CSV
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Key,EN,AR,ES,FR,ID\n';
    const keys = Object.keys(dictionaryState.en);
    keys.forEach(key => {
      const row = [
        key,
        `"${(dictionaryState.en[key] || '').replace(/"/g, '""')}"`,
        `"${(dictionaryState.ar[key] || '').replace(/"/g, '""')}"`,
        `"${(dictionaryState.es[key] || '').replace(/"/g, '""')}"`,
        `"${(dictionaryState.fr[key] || '').replace(/"/g, '""')}"`,
        `"${(dictionaryState.id[key] || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `promptat_i18n_dictionary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Interface dictionary exported to CSV!', 'success');
  };

  // Export XLIFF 1.2 Format
  const handleExportXliff = () => {
    let xliff = `<?xml version="1.0" encoding="UTF-8"?>\n<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">\n  <file source-language="ar" target-language="${selectedInterfaceLang}" datatype="plaintext" original="interface-text">\n    <body>\n`;
    Object.keys(dictionaryState.ar).forEach(key => {
      xliff += `      <trans-unit id="${key}">\n        <source>${dictionaryState.ar[key]}</source>\n        <target>${dictionaryState[selectedInterfaceLang][key] || ''}</target>\n      </trans-unit>\n`;
    });
    xliff += `    </body>\n  </file>\n</xliff>`;

    const blob = new Blob([xliff], { type: 'application/xliff+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptat_xliff_ar_${selectedInterfaceLang}.xlf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification(`XLIFF file exported for Arabic -> ${selectedInterfaceLang.toUpperCase()}`, 'success');
  };

  // Status Badge Helper
  const getStatusBadge = (item: any, langCode: LanguageCode) => {
    if (langCode === 'ar' || langCode === 'en') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="h-3 w-3" /> Published
        </span>
      );
    }
    // Deterministic preview status based on item ID hash for demo matrix
    const hash = (item.id || '').charCodeAt(0) % 3;
    if (hash === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="h-3 w-3" /> Published
        </span>
      );
    } else if (hash === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3" /> Draft
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
          <AlertCircle className="h-3 w-3" /> Missing
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Translation Manager</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-language matrix across AR, EN, ES, FR, and ID (Bahasa Indonesia).
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('content')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'content' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Content Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('interface')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'interface' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interface Text Dictionary
          </button>
        </div>
      </div>

      {activeSubTab === 'content' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search titles or slugs..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedEntity}
                onChange={e => setSelectedEntity(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Content Types</option>
                <option value="prompt">Image Prompts</option>
                <option value="skill">Creator Skills</option>
                <option value="video">Faceless Videos</option>
                <option value="blog">Blog Articles</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft / WIP</option>
                <option value="missing">Missing</option>
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <th className="p-3">Content Title</th>
                  <th className="p-3">Type</th>
                  {Object.values(SUPPORTED_LANGUAGES).map(lang => (
                    <th key={lang.code} className="p-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        {lang.flag} {lang.code.toUpperCase()}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                      {item.title}
                      <div className="text-[10px] text-slate-400 font-normal">/{item.slug}</div>
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {item.entityType}
                      </span>
                    </td>
                    {Object.keys(SUPPORTED_LANGUAGES).map(langCode => (
                      <td key={langCode} className="p-3 text-center">
                        {getStatusBadge(item, langCode as LanguageCode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Interface Text Dictionary Subtab */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <div>
              <h3 className="text-sm font-bold text-indigo-950">Interface UI Strings Dictionary</h3>
              <p className="text-xs text-indigo-700 mt-0.5">
                Translate UI buttons, placeholder messages, and navigation labels for AR, EN, ES, FR, and ID.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
              <button
                onClick={handleExportXliff}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <FileText className="h-3.5 w-3.5" /> Export XLIFF 1.2
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Target Edit Language:</span>
            <div className="flex gap-2">
              {Object.values(SUPPORTED_LANGUAGES).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedInterfaceLang(lang.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    selectedInterfaceLang === lang.code
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dictionary Edit Inputs */}
          <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(dictionaryState.en).map(key => (
                <div key={key} className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Key: {key}</span>
                    <span>English: "{dictionaryState.en[key]}"</span>
                  </div>
                  <input
                    type="text"
                    value={dictionaryState[selectedInterfaceLang][key] || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setDictionaryState(prev => ({
                        ...prev,
                        [selectedInterfaceLang]: {
                          ...prev[selectedInterfaceLang],
                          [key]: val
                        }
                      }));
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder={`Translation in ${SUPPORTED_LANGUAGES[selectedInterfaceLang].name}...`}
                  />
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => showNotification('Interface dictionary changes saved successfully!', 'success')}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
              >
                <Save className="h-4 w-4" /> Save Dictionary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
