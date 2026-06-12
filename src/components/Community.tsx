import { useState } from 'react';
import { Trophy, Newspaper, Bookmark, BookmarkCheck, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMMUNITY_MEMBERS, NEWS_ARTICLES, ECO_FACTS, LEVELS } from '../data/emissionData';
import type { NewsCategory } from '../types';

const SUB_TABS = ['Leaderboard', 'News', 'Local'] as const;
type SubTab = typeof SUB_TABS[number];

const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  policy:  'bg-blue-500/10   text-blue-300   border-blue-500/20',
  tech:    'bg-purple-500/10 text-purple-300  border-purple-500/20',
  science: 'bg-teal-500/10   text-teal-300    border-teal-500/20',
  tips:    'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

function LeaderboardTab() {
  const { state } = useApp();
  const userScore = state.user.carbonScore;
  const userLevel = state.user.level;
  const userStreak = state.user.streak;

  const allMembers = [
    ...COMMUNITY_MEMBERS,
    { id: 'me', name: state.user.name, location: 'You', score: userScore, level: userLevel, streak: userStreak, isCurrentUser: true },
  ].sort((a, b) => b.score - a.score);

  const myRank = allMembers.findIndex(m => m.isCurrentUser) + 1;
  const topPercent = Math.round(((allMembers.length - myRank) / allMembers.length) * 100);
  const weeklyProgress = state.weeklyChallenge;

  return (
    <div className="space-y-4">
      {/* My rank summary */}
      <div className="card-glow bg-gradient-eco text-center py-4">
        <p className="text-slate-400 text-xs mb-1">Your Community Rank</p>
        <p className="text-4xl font-bold text-emerald-400">#{myRank}</p>
        <p className="text-slate-300 text-sm mt-1">
          Beating <span className="text-emerald-400 font-semibold">{topPercent}%</span> of the community 🏆
        </p>
        {myRank <= 5 && (
          <div className="mt-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 inline-block">
            ⭐ Top 5 — Community Star!
          </div>
        )}
      </div>

      {/* Weekly challenge */}
      <div className="card">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl">🌍</span>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Community Challenge</p>
            <p className="text-sm text-white mt-0.5">{weeklyProgress.goal}</p>
          </div>
        </div>
        <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000"
            style={{ width: `${(weeklyProgress.current / weeklyProgress.target) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-emerald-400 font-medium">{weeklyProgress.current} / {weeklyProgress.target} activities</span>
          <span className="text-slate-600">{Math.round((weeklyProgress.current / weeklyProgress.target) * 100)}%</span>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Community Ranking</h3>
        <div className="space-y-2">
          {allMembers.map((member, i) => {
            const rank = i + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const levelInfo = LEVELS[Math.min(member.level, LEVELS.length - 1)];
            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  member.isCurrentUser
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <span className="text-base w-7 text-center font-bold text-slate-400">{rankIcon}</span>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-medium truncate ${member.isCurrentUser ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {member.name} {member.isCurrentUser ? '(You)' : ''}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">{member.isCurrentUser ? 'Your profile' : member.location} · {levelInfo?.icon ?? '🌱'} {member.streak}🔥</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${member.isCurrentUser ? 'text-emerald-400' : 'text-slate-300'}`}>{member.score}</p>
                  <p className="text-xs text-slate-600">score</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspire section */}
      <div className="card border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Inspire a Friend 💌</h3>
        <p className="text-xs text-slate-500 mb-3">Share EcoTrack with someone you care about — every action counts.</p>
        <button
          onClick={() => {
            const text = `Hey! I've been using EcoTrack to reduce my carbon footprint. My score is ${userScore}/1000. Join me! 🌿`;
            if (navigator.share) {
              navigator.share({ title: 'EcoTrack — Carbon Footprint Platform', text });
            } else {
              navigator.clipboard.writeText(text);
              alert('Copied to clipboard!');
            }
          }}
          className="btn-primary w-full py-2.5 text-sm"
        >
          Share My Score 🌍
        </button>
      </div>
    </div>
  );
}

function NewsTab() {
  const { state, dispatch } = useApp();
  const [catFilter, setCatFilter] = useState<NewsCategory | 'all'>('all');
  const factIndex = new Date().getDay() % ECO_FACTS.length;
  const todayFact = ECO_FACTS[factIndex];

  const filtered = NEWS_ARTICLES.filter(a => catFilter === 'all' || a.category === catFilter);
  const NEWS_CATEGORIES: Array<{ value: NewsCategory | 'all'; label: string }> = [
    { value: 'all', label: '🌍 All' },
    { value: 'policy', label: '📋 Policy' },
    { value: 'tech', label: '🔬 Tech' },
    { value: 'science', label: '🔭 Science' },
    { value: 'tips', label: '💡 Tips' },
  ];

  return (
    <div className="space-y-4">
      {/* Eco Fact Banner */}
      <div className="card-glow bg-gradient-eco border-emerald-500/20">
        <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1.5">Today's Eco Fact</p>
        <p className="text-sm text-slate-200 leading-relaxed">"{todayFact}"</p>
      </div>

      {/* Trending tags */}
      <div className="flex gap-1.5 flex-wrap">
        {['#SolarEnergy', '#EVs', '#PlantBased', '#CarbonTax', '#NetZero', '#ClimateAction'].map(tag => (
          <span key={tag} className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-500 rounded-full hover:border-slate-600 hover:text-slate-400 cursor-default transition-all">
            <Tag size={8} />{tag}
          </span>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {NEWS_CATEGORIES.map(({ value, label }) => (
          <button key={value} onClick={() => setCatFilter(value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              catFilter === value ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filtered.map(article => {
          const isSaved = state.savedArticles.includes(article.id);
          return (
            <div key={article.id} className="card border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${NEWS_CATEGORY_COLORS[article.category]}`}>
                  {article.category}
                </span>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_SAVED_ARTICLE', payload: article.id })}
                  className={`transition-colors ${isSaved ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>
              <h4 className="text-sm font-semibold text-white leading-snug mb-1.5">{article.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{article.summary}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <span>{article.source}</span>
                  <span>·</span>
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readingTime} min read</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {article.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-emerald-600/60">{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocalTab() {
  return (
    <div className="space-y-4 animate-in">
      <div className="card border border-emerald-500/20">
        <h3 className="text-sm font-semibold text-emerald-400 mb-2">Local Eco-Hubs</h3>
        <p className="text-xs text-slate-400 mb-4">
          Discover recycling centers, sustainable stores, and eco-communities near you using Google Maps.
        </p>
        
        <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100000!2d-122.4!3d37.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQyJzAwLjAiTiAxMjLCsDI0JzAwLjAiVw!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
          ></iframe>
        </div>
        
        <div className="mt-4 flex gap-2">
          {['♻️ Recycling', '🚲 Bike Shares', '🥑 Farmers Markets'].map(tag => (
            <span key={tag} className="px-2.5 py-1 text-[10px] bg-slate-800 border border-slate-700 text-slate-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props { onNavigate: (p: import('../types').Page) => void }

export default function Community({ onNavigate: _ }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('Leaderboard');

  return (
    <div className="pt-6 pb-2 space-y-4 animate-in">
      <div>
        <h1 className="text-xl font-bold text-white">Community</h1>
        <p className="text-slate-500 text-sm">Connect, compete, and stay informed</p>
      </div>

      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
        {SUB_TABS.map(tab => (
          <button key={tab} onClick={() => setSubTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              subTab === tab ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span className="flex items-center justify-center gap-1.5">
              {tab === 'Leaderboard' && <Trophy size={14} />}
              {tab === 'News' && <Newspaper size={14} />}
              {tab === 'Local' && <span className="text-sm">📍</span>}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {subTab === 'Leaderboard' && <LeaderboardTab />}
      {subTab === 'News' && <NewsTab />}
      {subTab === 'Local' && <LocalTab />}
    </div>
  );
}
