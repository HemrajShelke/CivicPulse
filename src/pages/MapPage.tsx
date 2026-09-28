import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useIssueStore } from '../store/issueStore';
import { MapPin, Search, ListFilter, SlidersHorizontal, Layers, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';

export default function MapPage() {
  const navigate = useNavigate();
  const { issues } = useIssueStore();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract cities
  const cities = ['All', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune'];

  // Categories
  const categories = [
    'All',
    'Road Infrastructure',
    'Sewage & Water',
    'Electricity',
    'Garbage & Waste',
    'Traffic & Transit',
    'Health & Sanitation'
  ];

  // Filtering criteria
  const filteredIssues = issues.filter(issue => {
    const matchesCity = selectedCity === 'All' || issue.address.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050d0a] text-text-primary pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-4 space-y-6">
        
        {/* Header summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[#00FF88] text-xs font-mono font-bold uppercase tracking-widest">SWACHH RADAR NETWORK</span>
            <h1 className="text-3xl font-grotesk font-extrabold text-text-primary mt-1">
              Interactive Heatmap Radar
            </h1>
            <p className="text-text-tertiary text-xs mt-1">
              Explore reported municipal concerns across Indian cities in high-contrast vector projection overlays.
            </p>
          </div>

          {/* Quick Stats overview */}
          <div className="flex gap-4">
            <div className="glass px-4 py-2 rounded-xl text-center border border-[#1D9E75]/15">
              <span className="text-[9px] font-mono text-text-tertiary block">CRITICAL THREADS</span>
              <span className="text-lg font-grotesk font-bold text-[#FF2D55]">{issues.filter(i => i.severity === "Critical" && i.status !== "Resolved").length} Nodes</span>
            </div>
            <div className="glass px-4 py-2 rounded-xl text-center border border-[#1D9E75]/15">
              <span className="text-[9px] font-mono text-text-tertiary block">RESOLVED COMPLAINTS</span>
              <span className="text-lg font-grotesk font-bold text-[#00FF88]">{issues.filter(i => i.status === "Resolved").length} Nodes</span>
            </div>
          </div>
        </div>

        {/* Dashboard Filters Row */}
        <div className="glass rounded-2xl p-4 border border-[#1D9E75]/15 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#061410]/50">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search active radar nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050d0a] rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder-text-tertiary border border-[#1D9E75]/15 focus:border-[#00FF88]/40 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* City select */}
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#00FF88]" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#050d0a] border border-[#1D9E75]/20 text-xs font-semibold text-text-secondary px-3.5 py-2 rounded-xl outline-none cursor-pointer focus:border-[#00FF88]/40"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Indian Cities' : c}</option>
                ))}
              </select>
            </div>

            {/* Category select */}
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-[#1D9E75]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#050d0a] border border-[#1D9E75]/20 text-xs font-semibold text-text-secondary px-3.5 py-2 rounded-xl outline-none cursor-pointer focus:border-[#00FF88]/40"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Giant Map Component */}
        <MapComponent issues={filteredIssues} />

        {/* Detailed node list preview */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-[#00FF88]" />
            <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-text-primary">Radar Feeds In This Projection ({filteredIssues.length})</h3>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="text-center py-10 glass rounded-xl border border-[#1D9E75]/10 text-text-tertiary text-xs">
              No matching issues found on the current city sector. Try selecting a different city or category!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIssues.map(issue => {
                const isCritical = issue.severity === "Critical";
                const isResolved = issue.status === "Resolved";
                return (
                  <motion.div
                    key={issue.id}
                    whileHover={{ scale: 1.01 }}
                    className="glass rounded-xl p-4 border border-[#1D9E75]/10 flex justify-between items-start cursor-pointer hover:border-[#00FF88]/20"
                    onClick={() => navigate(`/issue/${issue.id}`)}
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-[#00FF88]' : isCritical ? 'bg-[#FF2D55] animate-pulse' : 'bg-[#BA7517]'}`} />
                        <span className="text-[10px] font-mono uppercase font-semibold text-text-tertiary">{issue.category}</span>
                      </div>
                      <h4 className="font-grotesk font-bold text-sm text-text-primary hover:text-[#00FF88] transition-colors">{issue.title}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-1">{issue.description}</p>
                    </div>

                    <div className="text-right flex flex-col justify-between h-full items-end min-w-[80px]">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isResolved ? 'bg-[#1D9E75]/15 text-[#00FF88]' : isCritical ? 'bg-[#FF2D55]/15 text-[#FF2D55]' : 'bg-[#BA7517]/15 text-[#BA7517]'
                      }`}>
                        {issue.status}
                      </span>
                      <span className="text-[10px] text-text-tertiary font-mono block mt-3">{issue.votes} VOTES</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
