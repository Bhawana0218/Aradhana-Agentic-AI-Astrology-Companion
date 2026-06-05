import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Calendar, MapPin, Clock, Mail, Download, Edit3, Save, Camera } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { useChatStore } from '../store/chatStore';
import { toast } from '../components/Toast';
import { formatDate } from '../lib/utils';
import { useTranslation } from '../i18n';

const JOIN_DATE = 'May 15, 2026';

export function Profile() {
  const { t } = useTranslation();
  const { birthDetails, setBirthDetails } = useChatStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(birthDetails?.name || '');
  const [editPlace, setEditPlace] = useState(birthDetails?.place || '');
  const [editDate, setEditDate] = useState(birthDetails?.date || '');
  const [editTime, setEditTime] = useState(birthDetails?.time || '');

  const [avatarSeed] = useState('cosmic_' + Date.now());

  const handleSave = () => {
    setBirthDetails({
      name: editName,
      place: editPlace,
      date: editDate,
      time: editTime,
      lat: birthDetails?.lat,
      lon: birthDetails?.lon,
      timezone: birthDetails?.timezone,
    });
    setEditing(false);
    toast('success', 'Profile updated');
  };

  const handleExportData = () => {
    const data = { birthDetails, exportDate: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aradhana-profile-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Data exported');
  };

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aurora/30 to-mystic/20 border-2 border-aurora/40 flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-aurora border-2 border-space flex items-center justify-center cursor-pointer hover:bg-aurora-light transition-colors">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">
            {birthDetails?.name || 'Cosmic Seeker'}
          </h1>
          <p className="text-sm text-starlight-muted">{t('profile.joined')} {JOIN_DATE}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: t('profile.statReadings'), value: '12', icon: Sparkles },
            { label: t('profile.statJournal'), value: '8', icon: Calendar },
            { label: t('profile.statSessions'), value: '6', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-4 text-center border border-starlight/6">
              <stat.icon className="w-4 h-4 text-aurora-light mx-auto mb-1.5" />
              <p className="font-display text-lg text-starlight">{stat.value}</p>
              <p className="text-[10px] text-starlight-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Birth Details */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm text-starlight tracking-wide">{t('profile.birthDetails')}</h2>
            {!editing ? (
              <button onClick={() => { setEditName(birthDetails?.name || ''); setEditPlace(birthDetails?.place || ''); setEditDate(birthDetails?.date || ''); setEditTime(birthDetails?.time || ''); setEditing(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-primary text-[10px]">
                <Edit3 className="w-3 h-3" />
                {t('profile.edit')}
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-gradient text-[10px] text-white">
                <Save className="w-3 h-3" />
                {t('profile.saveDetails')}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1 block">{t('profile.name')}</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-premium text-sm" placeholder={t('profile.namePlaceholder')} />
              </div>
              <div>
                <label className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1 block">{t('profile.dob')}</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="input-premium text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1 block">{t('profile.tob')}</label>
                <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="input-premium text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1 block">{t('profile.pob')}</label>
                <input value={editPlace} onChange={(e) => setEditPlace(e.target.value)} className="input-premium text-sm" placeholder={t('profile.placePlaceholder')} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-starlight-muted" />
                <span className="text-starlight-dim">{birthDetails?.name || t('profile.notSet')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-starlight-muted" />
                <span className="text-starlight-dim">{birthDetails?.date ? formatDate(birthDetails.date) : t('profile.notSet')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-starlight-muted" />
                <span className="text-starlight-dim">{birthDetails?.time || t('profile.notSet')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-starlight-muted" />
                <span className="text-starlight-dim">{birthDetails?.place || t('profile.notSet')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Email / Account */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6 mb-6">
          <h2 className="font-display text-sm text-starlight tracking-wide mb-4">{t('profile.account')}</h2>
          <div className="flex items-center gap-3 text-sm mb-4">
            <Mail className="w-4 h-4 text-starlight-muted" />
            <span className="text-starlight-dim">seeker@cosmic.xyz</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10">{t('profile.freePlan')}</span>
            <span className="text-[10px] text-starlight-muted">{t('profile.localStorage')}</span>
          </div>
        </div>

        {/* Data Export */}
        <div className="glass-card-premium rounded-2xl p-5 border border-starlight/6">
          <h2 className="font-display text-sm text-starlight tracking-wide mb-2">{t('profile.exportData')}</h2>
          <p className="text-xs text-starlight-muted mb-4">{t('profile.exportDesc')}</p>
          <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-xs">
            <Download className="w-3.5 h-3.5" />
            {t('profile.downloadJson')}
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
