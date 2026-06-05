import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { SearchInput } from '../components/SearchInput';
import { TabBar } from '../components/TabBar';
import { useTranslation } from '../i18n';
import type { ZodiacSignDetail, PlanetDetail, HouseDetail, NakshatraDetail, FAQItem } from '../types';
import clsx from 'clsx';

const ZODIAC_DATA: ZodiacSignDetail[] = [
  { name: 'Aries', symbol: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', house: 1, keywords: ['Courageous', 'Impulsive', 'Pioneering'], description: 'Aries, the first sign of the zodiac, represents new beginnings and initiatory energy. Those born under this sign are natural leaders who charge forward with courage and determination.', strengths: ['Brave', 'Confident', 'Independent', 'Passionate'], weaknesses: ['Impatient', 'Aggressive', 'Impulsive'], color: '#fb7185' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus', house: 2, keywords: ['Stable', 'Sensual', 'Determined'], description: 'Taurus embodies stability, sensuality, and perseverance. Ruled by Venus, Taureans appreciate beauty and comfort while building lasting foundations.', strengths: ['Patient', 'Reliable', 'Devoted', 'Artistic'], weaknesses: ['Stubborn', 'Possessive', 'Lazy'], color: '#2dd4bf' },
  { name: 'Gemini', symbol: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury', house: 3, keywords: ['Curious', 'Adaptable', 'Communicative'], description: 'Gemini, the twins, represents duality and communication. Ruled by Mercury, Geminis are intellectual, versatile, and endlessly curious about the world.', strengths: ['Witty', 'Intelligent', 'Versatile', 'Social'], weaknesses: ['Indecisive', 'Superficial', 'Restless'], color: '#fbbf24' },
  { name: 'Cancer', symbol: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon', house: 4, keywords: ['Nurturing', 'Emotional', 'Intuitive'], description: 'Cancer, the crab, embodies nurturing and protective energy. Ruled by the Moon, Cancerians are deeply emotional, intuitive, and connected to home and family.', strengths: ['Loyal', 'Compassionate', 'Intuitive', 'Protective'], weaknesses: ['Moody', 'Over-sensitive', 'Clingy'], color: '#e8d5a3' },
  { name: 'Leo', symbol: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun', house: 5, keywords: ['Creative', 'Bold', 'Generous'], description: 'Leo, the lion, radiates confidence and creative power. Ruled by the Sun, Leos are natural performers who thrive on admiration and self-expression.', strengths: ['Generous', 'Passionate', 'Charismatic', 'Creative'], weaknesses: ['Arrogant', 'Dramatic', 'Stubborn'], color: '#f4a236' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', house: 6, keywords: ['Analytical', 'Practical', 'Detail-oriented'], description: 'Virgo represents precision, analysis, and service. Ruled by Mercury, Virgos have sharp minds and a deep desire to be useful and improve the world around them.', strengths: ['Detail-oriented', 'Hardworking', 'Helpful', 'Intelligent'], weaknesses: ['Critical', 'Perfectionist', 'Worrier'], color: '#7dd3fc' },
  { name: 'Libra', symbol: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus', house: 7, keywords: ['Diplomatic', 'Charming', 'Fair-minded'], description: 'Libra, the scales, represents balance and harmony. Ruled by Venus, Librans are diplomatic, charming, and driven by a deep sense of justice and beauty.', strengths: ['Diplomatic', 'Social', 'Fair', 'Artistic'], weaknesses: ['Indecisive', 'People-pleasing', 'Avoids conflict'], color: '#c084fc' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', modality: 'Fixed', ruler: 'Pluto', house: 8, keywords: ['Intense', 'Transformative', 'Mysterious'], description: 'Scorpio delves into the depths of transformation and mystery. Ruled by Pluto, Scorpios are intense, passionate, and driven by a need for profound truth.', strengths: ['Brave', 'Loyal', 'Passionate', 'Resourceful'], weaknesses: ['Jealous', 'Secretive', 'Controlling'], color: '#fb7185' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', house: 9, keywords: ['Adventurous', 'Optimistic', 'Philosophical'], description: 'Sagittarius, the archer, aims for truth and adventure. Ruled by Jupiter, Sagittarians are optimistic, freedom-loving, and eternally seeking higher knowledge.', strengths: ['Optimistic', 'Adventurous', 'Honest', 'Philosophical'], weaknesses: ['Tactless', 'Restless', 'Overconfident'], color: '#818cf8' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', house: 10, keywords: ['Ambitious', 'Disciplined', 'Responsible'], description: 'Capricorn, the sea-goat, embodies ambition and discipline. Ruled by Saturn, Capricorns are master builders who achieve greatness through patience and hard work.', strengths: ['Disciplined', 'Ambitious', 'Patient', 'Responsible'], weaknesses: ['Pessimistic', 'Rigid', 'Workaholic'], color: '#d4a373' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', modality: 'Fixed', ruler: 'Uranus', house: 11, keywords: ['Innovative', 'Humanitarian', 'Eccentric'], description: 'Aquarius, the water-bearer, pours forth innovation and vision. Ruled by Uranus, Aquarians are forward-thinking, humanitarian, and proudly unconventional.', strengths: ['Innovative', 'Independent', 'Humanitarian', 'Intellectual'], weaknesses: ['Detached', 'Rebellious', 'Unpredictable'], color: '#7dd3fc' },
  { name: 'Pisces', symbol: '♓', element: 'Water', modality: 'Mutable', ruler: 'Neptune', house: 12, keywords: ['Empathetic', 'Artistic', 'Mystical'], description: 'Pisces, the fish, swims in the oceans of imagination and spirituality. Ruled by Neptune, Pisceans are deeply empathetic, artistic, and connected to the unseen.', strengths: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'], weaknesses: ['Escapist', 'Overly trusting', 'Victim mentality'], color: '#818cf8' },
].map((z) => ({ ...z, color: z.color || '#e8d5a3', strengths: Array.isArray(z.strengths) ? z.strengths : ['Brave'], weaknesses: Array.isArray(z.weaknesses) ? z.weaknesses : ['Impatient'] })) as ZodiacSignDetail[];

const PLANET_DATA: PlanetDetail[] = [
  { name: 'Sun', symbol: '☉', rules: ['Self', 'Identity', 'Vitality'], description: 'The Sun represents your core essence, ego, and life force. It shows where you shine brightest and how you express your authentic self.', color: '#f4a236', speed: '1° per day', retrograde_period: '3 weeks annually', keywords: ['Ego', 'Identity', 'Creative expression'] },
  { name: 'Moon', symbol: '☽', rules: ['Emotions', 'Intuition', 'Habits'], description: 'The Moon governs your emotional nature, subconscious patterns, and instinctual responses. It reveals how you nurture yourself and others.', color: '#e8d5a3', speed: '13° per day', retrograde_period: '3 weeks every 2.5 years', keywords: ['Emotions', 'Intuition', 'Nurturing'] },
  { name: 'Mercury', symbol: '☿', rules: ['Communication', 'Intellect', 'Travel'], description: 'Mercury rules all forms of communication, mental processing, and information exchange. It shapes how you think, speak, and learn.', color: '#9d93f8', speed: '1-2° per day', retrograde_period: '3-4 weeks, 3x per year', keywords: ['Communication', 'Thinking', 'Learning'] },
  { name: 'Venus', symbol: '♀', rules: ['Love', 'Beauty', 'Values'], description: 'Venus governs love, pleasure, beauty, and what you value. It reveals your approach to relationships, aesthetics, and financial comfort.', color: '#f9a8d4', speed: '1-2° per day', retrograde_period: '6 weeks every 18 months', keywords: ['Love', 'Beauty', 'Values'] },
  { name: 'Mars', symbol: '♂', rules: ['Action', 'Desire', 'Aggression'], description: 'Mars represents your drive, ambition, and how you assert yourself. It fuels your passions, sexual energy, and competitive spirit.', color: '#fb7185', speed: '0.5-1° per day', retrograde_period: '8 weeks every 2 years', keywords: ['Action', 'Passion', 'Courage'] },
  { name: 'Jupiter', symbol: '♃', rules: ['Expansion', 'Luck', 'Wisdom'], description: 'Jupiter is the planet of good fortune, abundance, and higher learning. It shows where you experience growth and how you seek meaning.', color: '#fbbf24', speed: '0.5° per day', retrograde_period: '4 months annually', keywords: ['Expansion', 'Luck', 'Growth'] },
  { name: 'Saturn', symbol: '♄', rules: ['Discipline', 'Structure', 'Karma'], description: 'Saturn represents responsibility, limitation, and life lessons. It shows where you face challenges that build character and lasting achievement.', color: '#d4a373', speed: '0.5° per day', retrograde_period: '4.5 months annually', keywords: ['Discipline', 'Responsibility', 'Structure'] },
  { name: 'Uranus', symbol: '♅', rules: ['Innovation', 'Rebellion', 'Sudden change'], description: 'Uranus brings sudden changes, breakthroughs, and unconventional energy. It shakes up established patterns to awaken higher consciousness.', color: '#7dd3fc', speed: '0.5° per day', retrograde_period: '5 months annually', keywords: ['Innovation', 'Change', 'Freedom'] },
  { name: 'Neptune', symbol: '♆', rules: ['Illusion', 'Spirituality', 'Creativity'], description: 'Neptune dissolves boundaries and connects you to the divine. It governs dreams, intuition, artistic inspiration, and spiritual transcendence.', color: '#818cf8', speed: '1-2° per month', retrograde_period: '5 months annually', keywords: ['Spirituality', 'Dreams', 'Intuition'] },
  { name: 'Pluto', symbol: '♇', rules: ['Transformation', 'Power', 'Rebirth'], description: 'Pluto rules the underworld of the psyche — transformation, power, and regeneration. It brings intense change that leads to profound personal evolution.', color: '#c084fc', speed: '1-2° per month', retrograde_period: '5 months annually', keywords: ['Transformation', 'Power', 'Rebirth'] },
];

const HOUSES_DATA: HouseDetail[] = [
  { number: 1, title: 'House of Self', keywords: ['Identity', 'Appearance', 'Beginnings'], description: 'The 1st House represents your personality, physical appearance, and how you present yourself to the world. It is the mask you wear and the first impression you make.', ruled_sign: 'Aries' },
  { number: 2, title: 'House of Value', keywords: ['Finances', 'Possessions', 'Self-worth'], description: 'The 2nd House governs material possessions, financial resources, and personal values. It reveals your relationship with money and what you truly value.', ruled_sign: 'Taurus' },
  { number: 3, title: 'House of Communication', keywords: ['Communication', 'Siblings', 'Learning'], description: 'The 3rd House rules communication, writing, speaking, and early education. It also governs relationships with siblings, neighbors, and your immediate environment.', ruled_sign: 'Gemini' },
  { number: 4, title: 'House of Home', keywords: ['Home', 'Family', 'Roots'], description: 'The 4th House represents your home, family origins, and emotional foundations. It reveals your relationship with your parents and where you feel most secure.', ruled_sign: 'Cancer' },
  { number: 5, title: 'House of Pleasure', keywords: ['Creativity', 'Romance', 'Children'], description: 'The 5th House governs creative self-expression, romance, dating, children, and recreational activities. It is where you play, create, and find joy.', ruled_sign: 'Leo' },
  { number: 6, title: 'House of Health', keywords: ['Health', 'Service', 'Daily work'], description: 'The 6th House rules physical health, daily routines, service to others, and work environment. It reveals your approach to wellness and how you maintain order.', ruled_sign: 'Virgo' },
  { number: 7, title: 'House of Partnership', keywords: ['Partnerships', 'Marriage', 'Contracts'], description: 'The 7th House governs all one-on-one relationships including marriage, business partnerships, and open enemies. It reveals what you seek in a partner.', ruled_sign: 'Libra' },
  { number: 8, title: 'House of Transformation', keywords: ['Transformation', 'Shared resources', 'Mystery'], description: 'The 8th House rules shared finances, inheritance, sexuality, death, rebirth, and the occult. It is where you undergo deep psychological transformation.', ruled_sign: 'Scorpio' },
  { number: 9, title: 'House of Philosophy', keywords: ['Travel', 'Higher education', 'Philosophy'], description: 'The 9th House governs long-distance travel, higher education, philosophy, religion, and the search for meaning. It expands your horizons through experience.', ruled_sign: 'Sagittarius' },
  { number: 10, title: 'House of Career', keywords: ['Career', 'Reputation', 'Public life'], description: 'The 10th House represents your career, public reputation, and life achievements. It reveals your highest ambitions and the mark you leave on the world.', ruled_sign: 'Capricorn' },
  { number: 11, title: 'House of Community', keywords: ['Friendships', 'Community', 'Hopes'], description: 'The 11th House governs friendships, social networks, group affiliations, and your hopes and wishes for the future. It reveals your tribe.', ruled_sign: 'Aquarius' },
  { number: 12, title: 'House of Subconscious', keywords: ['Subconscious', 'Solitude', 'Spirituality'], description: 'The 12th House rules the subconscious mind, solitude, hidden enemies, and spiritual liberation. It is the realm of dreams, karma, and transcendence.', ruled_sign: 'Pisces' },
];

const NAKSHATRA_DATA: NakshatraDetail[] = [
  { number: 1, name: 'Ashwini', lord: 'Ketu', symbol: 'Horse head', deity: 'Ashwini Kumaras', description: 'The star of transportation and speed. Ashwini natives are quick, healing, and pioneering.', range: '0°00′ – 13°20′ Aries' },
  { number: 2, name: 'Bharani', lord: 'Venus', symbol: 'Yoni', deity: 'Yama', description: 'The star of restraint and transformation. Bharani natives are disciplined, responsible, and deeply caring.', range: '13°20′ – 26°40′ Aries' },
  { number: 3, name: 'Krittika', lord: 'Sun', symbol: 'Razor', deity: 'Agni', description: 'The star of sharpness and clarity. Krittika natives are courageous, determined, and cutting through illusion.', range: '26°40′ Aries – 10°00′ Taurus' },
  { number: 4, name: 'Rohini', lord: 'Moon', symbol: 'Chariot', deity: 'Brahma', description: 'The star of growth and creativity. Rohini natives are artistic, nurturing, and deeply connected to beauty.', range: '10°00′ – 23°20′ Taurus' },
  { number: 5, name: 'Mrigashira', lord: 'Mars', symbol: 'Deer head', deity: 'Soma', description: 'The star of seeking and searching. Mrigashira natives are curious, restless, and always exploring.', range: '23°20′ Taurus – 6°40′ Gemini' },
  { number: 6, name: 'Ardra', lord: 'Rahu', symbol: 'Teardrop', deity: 'Rudra', description: 'The star of storms and transformation. Ardra natives are intense, cathartic, and deeply transformative.', range: '6°40′ – 20°00′ Gemini' },
  { number: 7, name: 'Punarvasu', lord: 'Jupiter', symbol: 'Quiver', deity: 'Aditi', description: 'The star of renewal and return. Punarvasu natives are optimistic, philosophical, and endlessly resilient.', range: '20°00′ Gemini – 3°20′ Cancer' },
  { number: 8, name: 'Pushya', lord: 'Saturn', symbol: 'Lotus', deity: 'Brihaspati', description: 'The star of nourishment and protection. Pushya natives are nurturing, spiritual, and deeply supportive.', range: '3°20′ – 16°40′ Cancer' },
  { number: 9, name: 'Ashlesha', lord: 'Mercury', symbol: 'Serpent', deity: 'Naga', description: 'The star of entanglement and wisdom. Ashlesha natives are intuitive, mysterious, and possess deep psychic gifts.', range: '16°40′ – 30°00′ Cancer' },
  { number: 10, name: 'Magha', lord: 'Ketu', symbol: 'Throne', deity: 'Pitris', description: 'The star of royalty and ancestry. Magha natives are dignified, powerful, and connected to their lineage.', range: '0°00′ – 13°20′ Leo' },
];

const FAQ_DATA: FAQItem[] = [
  { question: 'What is a birth chart?', answer: 'A birth chart (or natal chart) is a celestial snapshot of the sky at the exact moment and location of your birth. It maps the positions of all planets, the Sun, and the Moon across the twelve zodiac signs and houses, revealing your unique cosmic blueprint.', category: 'basics' },
  { question: 'What is the difference between Sun sign, Moon sign, and Rising sign?', answer: 'Your Sun sign represents your core identity and ego. Your Moon sign reveals your emotional nature and inner world. Your Rising sign (Ascendant) is the mask you show the world — the first impression you make. All three together create a fuller picture of your personality.', category: 'basics' },
  { question: 'What does it mean when a planet is retrograde?', answer: 'A retrograde planet appears to move backward in the sky from Earth\'s perspective. In astrology, retrogrades are periods for review, reflection, and revision in the areas ruled by that planet. Mercury retrograde is the most well-known, affecting communication and technology.', category: 'transits' },
  { question: 'How often does Mercury go retrograde?', answer: 'Mercury goes retrograde three to four times per year, for about three weeks each time. It retrogrades in Air signs (Gemini, Libra, Aquarius) and sometimes Earth signs (Taurus, Virgo, Capricorn).', category: 'transits' },
  { question: 'What is a Saturn Return?', answer: 'A Saturn Return occurs when transiting Saturn returns to the exact position it occupied in your natal chart — approximately every 29 years. This cosmic milestone around ages 28-31 (and again at 58-60) brings profound life restructuring, maturity, and karmic reckoning.', category: 'transits' },
  { question: 'What are the 12 houses in astrology?', answer: 'The 12 houses represent different areas of life: 1st (Self), 2nd (Values), 3rd (Communication), 4th (Home), 5th (Creativity), 6th (Health), 7th (Partnerships), 8th (Transformation), 9th (Philosophy), 10th (Career), 11th (Community), 12th (Subconscious).', category: 'houses' },
  { question: 'What is an aspect in astrology?', answer: 'An aspect is the angular relationship between two planets in your chart. Major aspects include Conjunction (0°), Sextile (60°), Square (90°), Trine (120°), and Opposition (180°). Each aspect brings a different dynamic — harmonious or challenging — between planetary energies.', category: 'basics' },
  { question: 'What are Nakshatras?', answer: 'Nakshatras are the 27 lunar mansions in Vedic astrology. Each Nakshatra spans 13°20′ of the zodiac and carries specific qualities, ruling deities, and characteristics. They add a deeper layer of precision to chart interpretation beyond zodiac signs alone.', category: 'advanced' },
  { question: 'Can astrology predict the future?', answer: 'Astrology is a tool for self-understanding and recognizing life patterns and potentials, not for fixed prediction. It shows tendencies, timing cycles, and the energetic weather — but you always have free will to navigate these influences.', category: 'general' },
  { question: 'What is the difference between Western and Vedic astrology?', answer: 'Western astrology uses the tropical zodiac (based on seasons), while Vedic (Jyotish) astrology uses the sidereal zodiac (based on actual star positions). Vedic also places greater emphasis on the Moon sign and Nakshatras, and uses a different system of house division.', category: 'advanced' },
];

const ELEMENT_COLORS: Record<string, string> = { Fire: 'text-rose-cosmos border-rose-cosmos/30', Earth: 'text-teal border-teal/30', Air: 'text-sol-light border-sol-light/30', Water: 'text-aurora-light border-aurora-light/30' };
const ELEMENT_BG: Record<string, string> = { Fire: 'bg-rose-cosmos/8', Earth: 'bg-teal/8', Air: 'bg-sol/8', Water: 'bg-aurora/8' };
const MODALITY_COLORS: Record<string, string> = { Cardinal: 'text-starlight border-starlight/20', Fixed: 'text-starlight-dim border-starlight-dim/20', Mutable: 'text-starlight-muted border-starlight-muted/20' };

export function LearningHub() {
  const { t } = useTranslation();
  const [section, setSection] = useState('zodiac');
  const [search, setSearch] = useState('');
  const [expandedZodiac, setExpandedZodiac] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const SECTIONS = [
    { id: 'zodiac', label: t('learningHub.tab.zodiac'), icon: '♈' },
    { id: 'planets', label: t('learningHub.tab.planets'), icon: '☉' },
    { id: 'houses', label: t('learningHub.tab.houses'), icon: '🏠' },
    { id: 'nakshatras', label: t('learningHub.tab.nakshatras'), icon: '☽' },
    { id: 'faq', label: t('learningHub.tab.faq'), icon: '❓' },
  ];

  const filteredZodiac = useMemo(() => {
    if (!search) return ZODIAC_DATA;
    const q = search.toLowerCase();
    return ZODIAC_DATA.filter((z) => z.name.toLowerCase().includes(q) || z.element.toLowerCase().includes(q) || z.keywords.some((k) => k.toLowerCase().includes(q)));
  }, [search]);

  const filteredPlanets = useMemo(() => {
    if (!search) return PLANET_DATA;
    const q = search.toLowerCase();
    return PLANET_DATA.filter((p) => p.name.toLowerCase().includes(q) || p.keywords.some((k) => k.toLowerCase().includes(q)));
  }, [search]);

  const filteredHouses = useMemo(() => {
    if (!search) return HOUSES_DATA;
    const q = search.toLowerCase();
    return HOUSES_DATA.filter((h) => h.title.toLowerCase().includes(q) || h.keywords.some((k) => k.toLowerCase().includes(q)));
  }, [search]);

  const filteredNakshatras = useMemo(() => {
    if (!search) return NAKSHATRA_DATA;
    const q = search.toLowerCase();
    return NAKSHATRA_DATA.filter((n) => n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
  }, [search]);

  const filteredFaq = useMemo(() => {
    if (!search) return FAQ_DATA;
    const q = search.toLowerCase();
    return FAQ_DATA.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [search]);

  return (
    <PageTransition>
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl text-starlight tracking-wider mb-1">{t('learningHub.title')}</h1>
          <p className="text-sm text-starlight-muted">{t('learningHub.subtitle')}</p>
        </div>

        <SearchInput value={search} onChange={setSearch} placeholder={t('learningHub.searchPlaceholder').replace('{section}', section)} className="mb-4" />

        <TabBar tabs={SECTIONS.map((s) => ({ id: s.id, label: s.label }))} active={section} onChange={setSection} className="mb-6" />

        {/* Zodiac */}
        {section === 'zodiac' && (
          <div className="space-y-3">
            {filteredZodiac.length === 0 ? (
              <p className="text-center text-sm text-starlight-muted py-8">{t('learningHub.emptyZodiac')}</p>
            ) : (
              filteredZodiac.map((sign, i) => (
                <motion.div
                  key={sign.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={clsx(
                    'glass-card-premium rounded-2xl border transition-all duration-200 cursor-pointer',
                    expandedZodiac === sign.name ? 'border-aurora/25' : 'border-starlight/6 hover:border-aurora/15'
                  )}
                >
                  <div className="p-4 flex items-center gap-4" onClick={() => setExpandedZodiac(expandedZodiac === sign.name ? null : sign.name)}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-serif" style={{ backgroundColor: `${sign.color}15`, borderColor: `${sign.color}30`, borderWidth: 1 }}>
                      {sign.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm text-starlight">{sign.name}</h3>
                        <span className={clsx('text-[9px] px-1.5 py-0.5 rounded-full border font-medium', ELEMENT_COLORS[sign.element])}>{sign.element}</span>
                        <span className={clsx('text-[9px] px-1.5 py-0.5 rounded-full border', MODALITY_COLORS[sign.modality])}>{sign.modality}</span>
                      </div>
                      <p className="text-[11px] text-starlight-dim mt-0.5">{t('learningHub.ruledBy')} {sign.ruler} · {sign.house}{t('learningHub.house')}</p>
                    </div>
                    <motion.div animate={{ rotate: expandedZodiac === sign.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 text-starlight-muted" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {expandedZodiac === sign.name && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 pt-0 border-t border-starlight/6 space-y-3">
                          <p className="text-xs text-starlight-dim/80 leading-relaxed mt-3">{sign.description}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1.5">{t('learningHub.strengths')}</p>
                              <div className="flex flex-wrap gap-1">
                                {sign.strengths.map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-teal/8 text-teal border border-teal/20">{s}</span>)}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1.5">{t('learningHub.weaknesses')}</p>
                              <div className="flex flex-wrap gap-1">
                                {sign.weaknesses.map((w) => <span key={w} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-cosmos/8 text-rose-cosmos border border-rose-cosmos/20">{w}</span>)}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-starlight-muted uppercase tracking-widest mb-1">{t('learningHub.keywords')}</p>
                            <div className="flex flex-wrap gap-1">
                              {sign.keywords.map((k) => <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10">{k}</span>)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Planets */}
        {section === 'planets' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlanets.map((planet, i) => (
              <motion.div
                key={planet.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-premium rounded-2xl p-4 border border-starlight/6 hover:border-aurora/15 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${planet.color}15`, borderColor: `${planet.color}30`, borderWidth: 1 }}>
                    <span style={{ color: planet.color }}>{planet.symbol}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-starlight">{planet.name}</h3>
                    <p className="text-[10px] text-starlight-muted">{planet.speed}</p>
                  </div>
                </div>
                <p className="text-[11px] text-starlight-dim/80 leading-relaxed mb-3">{planet.description}</p>
                <div className="flex flex-wrap gap-1">
                  {planet.keywords.map((k) => <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10">{k}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Houses */}
        {section === 'houses' && (
          <div className="grid sm:grid-cols-2 gap-3">
            {filteredHouses.map((h, i) => (
              <motion.div
                key={h.number}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-premium rounded-2xl p-4 border border-starlight/6 hover:border-aurora/15 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-aurora/10 border border-aurora/20 flex items-center justify-center text-xs font-bold text-aurora-light">
                    {h.number}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-starlight">{h.title}</h3>
                    <p className="text-[10px] text-starlight-muted">{t('learningHub.ruledBy')} {h.ruled_sign}</p>
                  </div>
                </div>
                <p className="text-[11px] text-starlight-dim/80 leading-relaxed mb-2">{h.description}</p>
                <div className="flex flex-wrap gap-1">
                  {h.keywords.map((k) => <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10">{k}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Nakshatras */}
        {section === 'nakshatras' && (
          <div className="space-y-2">
            {filteredNakshatras.length === 0 ? (
              <p className="text-center text-sm text-starlight-muted py-8">{t('learningHub.emptyNakshatras')}</p>
            ) : (
              filteredNakshatras.map((n, i) => (
                <motion.div
                  key={n.number}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card-premium rounded-2xl p-4 border border-starlight/6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-aurora/10 border border-aurora/20 flex items-center justify-center text-xs font-bold text-aurora-light">
                      {n.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-starlight">{n.name}</h3>
                      <p className="text-[10px] text-starlight-muted">{t('learningHub.lord')} {n.lord} · {t('learningHub.symbol')} {n.symbol} · {n.range}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-starlight-dim/80 leading-relaxed mt-2">{n.description}</p>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* FAQ */}
        {section === 'faq' && (
          <div className="space-y-2">
            {filteredFaq.length === 0 ? (
              <p className="text-center text-sm text-starlight-muted py-8">{t('learningHub.emptyFaq')}</p>
            ) : (
              filteredFaq.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={clsx(
                    'glass-card-premium rounded-2xl border transition-all duration-200 cursor-pointer',
                    expandedFaq === item.question ? 'border-aurora/25' : 'border-starlight/6 hover:border-aurora/15'
                  )}
                >
                  <div className="p-4 flex items-center justify-between gap-3" onClick={() => setExpandedFaq(expandedFaq === item.question ? null : item.question)}>
                    <h3 className="text-sm font-medium text-starlight flex-1">{item.question}</h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-aurora/8 text-aurora-dim border border-aurora/10 flex-shrink-0">{item.category}</span>
                    <motion.div animate={{ rotate: expandedFaq === item.question ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 text-starlight-muted" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {expandedFaq === item.question && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-4 pb-4 text-xs text-starlight-dim/80 leading-relaxed border-t border-starlight/6 pt-3">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
