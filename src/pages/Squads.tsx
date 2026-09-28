import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Target, CheckCircle, Calendar, MapPin, Search, Sparkles, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import ResolutionCelebration from '../components/ResolutionCelebration';

interface Squad {
  id: string;
  name: string;
  avatar: string;
  description: string;
  membersCount: number;
  city: string;
  nextEvent: {
    title: string;
    date: string;
    location: string;
  };
  goal: string;
  goalPercent: number;
}

export default function Squads() {
  const [joinedSquadIds, setJoinedSquadIds] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [search, setSearch] = useState('');

  // Seed highly realistic physical citizen fix-it squads
  const [squads, setSquads] = useState<Squad[]>([
    {
      id: 'sq-1',
      name: "HSR Swachh Crusaders",
      avatar: "🌱",
      description: "Organizing weekly neighborhood cleanliness sweeps, water conservation drives, and lake rejuvenation initiatives.",
      membersCount: 142,
      city: "Bengaluru",
      nextEvent: {
        title: "Sector 3 Park Garbage Cleanout",
        date: "Sunday, June 28 • 7:30 AM",
        location: "Sector 3 Playground"
      },
      goal: "Clear 500kg waste this month",
      goalPercent: 78
    },
    {
      id: 'sq-2',
      name: "Bandra Green Sentinels",
      avatar: "🌳",
      description: "Beautifying Bandra roadsides, planting indigenous tree saplings, and campaigning against plastic dumping.",
      membersCount: 94,
      city: "Mumbai",
      nextEvent: {
        title: "Carter Road Sapling Plantation",
        date: "Saturday, July 4 • 8:00 AM",
        location: "Carter Road Promenade"
      },
      goal: "Plant 200 saplings along promenade",
      goalPercent: 45
    },
    {
      id: 'sq-3',
      name: "Pune Wall Art Coalition",
      avatar: "🎨",
      description: "Transforming defaced municipal walls and garbage dump sites into stunning murals of traditional Indian art.",
      membersCount: 112,
      city: "Pune",
      nextEvent: {
        title: "Kothrud Depot Wall Painting",
        date: "Sunday, July 5 • 9:00 AM",
        location: "Kothrud Depot Underpass"
      },
      goal: "Beautify 15 public walls",
      goalPercent: 60
    },
    {
      id: 'sq-4',
      name: "Delhi Anti-Smog League",
      avatar: "🌫️",
      description: "Advocating for air filters in public schools, organizing carpooling clusters, and monitoring garbage burning violations.",
      membersCount: 210,
      city: "Delhi",
      nextEvent: {
        title: "Weekly Air Safety Monitor Brief",
        date: "Saturday, July 11 • 5:00 PM",
        location: "Connaught Place Block G"
      },
      goal: "Deploy 50 air sensor nodes",
      goalPercent: 90
    }
  ]);

  const handleJoin = (squadId: string) => {
    if (joinedSquadIds.includes(squadId)) return;
    
    setJoinedSquadIds(prev => [...prev, squadId]);
    setSquads(prev => prev.map(sq => {
      if (sq.id === squadId) {
        return { ...sq, membersCount: sq.membersCount + 1 };
      }
      return sq;
    }));

    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2000);
  };

  const filteredSquads = squads.filter(sq => {
    return sq.name.toLowerCase().includes(search.toLowerCase()) ||
      sq.description.toLowerCase().includes(search.toLowerCase()) ||
      sq.city.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#050d0a] text-text-primary pt-24 pb-16 relative">
      <Navbar />

      {celebrate && <ResolutionCelebration />}

      <div className="max-w-5xl mx-auto px-6 mt-4 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[#00FF88] text-xs font-mono font-bold uppercase tracking-widest">CITIZEN COOPERATION CLUSTERS</span>
          <h1 className="text-3xl md:text-5xl font-grotesk font-black text-text-primary">
            Local Fix-It Squads
          </h1>
          <p className="text-text-secondary text-xs max-w-md mx-auto leading-relaxed">
            Form community squads with neighboring residents, coordinate weekend physically clean drives, and claim mass karma bonus bundles.
          </p>
        </div>

        {/* Action Row */}
        <div className="glass rounded-2xl p-4 border border-[#1D9E75]/15 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#061410]/50">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search local squads or cities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#050d0a] rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder-text-tertiary border border-[#1D9E75]/15 focus:border-[#00FF88]/40 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => alert("Squad creation wizard will sync on Google Calendar automatically during hackathon phases!")}
            className="px-5 py-2.5 bg-[#1D9E75] hover:bg-[#00FF88] hover:text-black font-grotesk font-bold uppercase tracking-wider text-xs rounded-xl text-white btn-glow flex items-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus size={15} />
            REGISTER NEW SQUAD
          </button>
        </div>

        {/* SQUAD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSquads.map((sq, idx) => {
            const hasJoined = joinedSquadIds.includes(sq.id);
            return (
              <motion.div
                key={sq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="glass rounded-3xl p-6 border border-[#1D9E75]/15 flex flex-col justify-between h-full hover:border-[#00FF88]/30 transition-all card-hover"
              >
                <div className="space-y-4">
                  
                  {/* Top line info */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0c2217] border border-[#1D9E75]/25 flex items-center justify-center text-xl shadow-inner">
                        {sq.avatar}
                      </div>
                      <div>
                        <h3 className="font-grotesk font-extrabold text-base text-text-primary">{sq.name}</h3>
                        <p className="text-[#00FF88] text-[10px] font-mono uppercase font-bold flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {sq.city} Sector
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-text-tertiary block">MEMBERS</span>
                      <span className="font-grotesk font-bold text-sm text-text-primary">{sq.membersCount} Active</span>
                    </div>
                  </div>

                  <p className="text-text-secondary text-xs leading-relaxed">{sq.description}</p>

                  {/* Goal Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-text-tertiary uppercase flex items-center gap-1"><Target size={11} className="text-[#00FF88]" /> SQUAD MISSION</span>
                      <span className="text-[#00FF88] font-bold">{sq.goalPercent}%</span>
                    </div>
                    <div className="w-full bg-[#061410] rounded-full h-1.5 border border-[#1D9E75]/10">
                      <div className="bg-gradient-to-r from-[#1D9E75] to-[#00FF88] h-full rounded-full" style={{ width: `${sq.goalPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-text-tertiary italic">"{sq.goal}"</p>
                  </div>

                  {/* Next physical event */}
                  <div className="p-3.5 bg-[#0c2217]/60 rounded-2xl border border-[#1D9E75]/15 space-y-2">
                    <div className="flex items-center gap-1.5 text-[#BA7517] text-[10px] font-mono font-bold uppercase">
                      <Calendar size={12} />
                      Next Physical Drive
                    </div>
                    <h4 className="font-grotesk font-extrabold text-xs text-text-primary leading-tight">{sq.nextEvent.title}</h4>
                    <p className="text-[10px] text-text-tertiary flex items-center gap-1"><MapPin size={11} /> {sq.nextEvent.location} • {sq.nextEvent.date}</p>
                  </div>
                </div>

                {/* Join buttons */}
                <div className="pt-5 mt-4 border-t border-[#1D9E75]/10">
                  <button
                    onClick={() => handleJoin(sq.id)}
                    disabled={hasJoined}
                    className={`w-full py-3 font-grotesk font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      hasJoined
                        ? 'bg-[#1D9E75]/15 border border-[#1D9E75]/30 text-[#00FF88] cursor-not-allowed'
                        : 'bg-[#0c2217] border border-[#1D9E75]/30 text-text-secondary hover:text-white hover:border-[#00FF88]/40 hover:bg-[#0c2217]/80'
                    }`}
                  >
                    {hasJoined ? (
                      <>
                        <CheckCircle size={14} />
                        SQUAD CONFIGURED & JOINED
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        JOIN PHYSICAL COOPERATION
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
