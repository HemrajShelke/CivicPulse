import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { Trophy, Award, Flame, Search, Star, MapPin, Sparkles, Building } from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface LeaderboardRecord {
  uid?: string;
  email?: string;
  rank: number;
  name: string;
  avatar: string;
  city: string;
  ward: string;
  streak: number;
  reportsCount: number;
  points: number;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [selectedCity, setSelectedCity] = useState('All');
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList: any[] = [];
      snapshot.forEach((doc) => {
        usersList.push(doc.data());
      });
      setDbUsers(usersList);
      setLoadingUsers(false);
    }, (err) => {
      console.error("Error with real-time users list:", err);
      handleFirestoreError(err, OperationType.LIST, "users");
      setLoadingUsers(false);
    });

    return () => unsubscribe();
  }, []);

  // No fake human samples - Leaderboard is fully dynamic from real signed up users!
  const seedLeaderboard: LeaderboardRecord[] = [];

  // Merge seed rows and real dbUsers
  const mergedLeaderboard: LeaderboardRecord[] = [...seedLeaderboard];

  dbUsers.forEach((dbUser) => {
    if (!dbUser || !dbUser.name) return;
    
    // Check if user is already in the list by uid to prevent duplicates
    const idx = mergedLeaderboard.findIndex(
      (r) => r.uid === dbUser.uid || (dbUser.email && r.email?.toLowerCase() === dbUser.email?.toLowerCase())
    );

    const record: LeaderboardRecord = {
      uid: dbUser.uid,
      email: dbUser.email,
      rank: 0, // reassigned below
      name: dbUser.name,
      avatar: dbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dbUser.name)}`,
      city: dbUser.city || "Bengaluru",
      ward: dbUser.ward || "General Ward",
      streak: dbUser.streak || 1,
      reportsCount: dbUser.reportedCount || 0,
      points: dbUser.karmaPoints || 100,
      isCurrentUser: user ? (dbUser.uid === user.uid || (dbUser.email && user.email && dbUser.email.toLowerCase() === user.email.toLowerCase())) : false
    };

    if (idx !== -1) {
      mergedLeaderboard[idx] = {
        ...mergedLeaderboard[idx],
        ...record,
        isCurrentUser: user ? (dbUser.uid === user.uid || (dbUser.email && user.email && dbUser.email.toLowerCase() === user.email.toLowerCase())) : false
      };
    } else {
      mergedLeaderboard.push(record);
    }
  });

  // Append current user dynamically if not already present
  if (user) {
    const userExists = mergedLeaderboard.some(r => r.uid === user.uid || (user.email && r.email?.toLowerCase() === user.email.toLowerCase()));
    if (!userExists) {
      mergedLeaderboard.push({
        uid: user.uid,
        email: user.email,
        rank: 0,
        name: user.name,
        avatar: user.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
        city: user.city || "Bengaluru",
        ward: user.ward || "General Ward",
        streak: user.streak || 1,
        reportsCount: user.reportedCount || 0,
        points: user.karmaPoints,
        isCurrentUser: true
      });
    }
  }

  // Sort by points desc and reassign ranks
  const sortedLeaderboard = mergedLeaderboard
    .sort((a, b) => b.points - a.points)
    .map((record, index) => ({
      ...record,
      rank: index + 1
    }));

  const filteredLeaderboard = sortedLeaderboard.filter(record => {
    return selectedCity === 'All' || record.city.toLowerCase() === selectedCity.toLowerCase();
  });

  const topThree = filteredLeaderboard.slice(0, 3);
  const remainingRows = filteredLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#050d0a] text-text-primary pt-24 pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 mt-4 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[#00FF88] text-xs font-mono font-bold uppercase tracking-widest">CIVIC GLORY LEADERBOARD</span>
          <h1 className="text-3xl md:text-5xl font-grotesk font-black text-text-primary">
            Citizen Heroes List
          </h1>
          <p className="text-text-secondary text-xs max-w-md mx-auto leading-relaxed">
            Every file, comment, upvote, and resolution elevates your civic points. High ranks achieve municipal advisory roles.
          </p>
        </div>

        {/* City Filter Row */}
        <div className="flex justify-center">
          <div className="flex gap-1.5 p-1 bg-[#061410] border border-[#1D9E75]/15 rounded-2xl text-xs font-mono font-bold uppercase">
            {['All', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  selectedCity === c 
                    ? 'bg-[#1D9E75]/35 text-[#00FF88] border border-[#1D9E75]/30' 
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* TOP 3 PODIUM HEROES ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          
          {/* Rank 2 (Left on desktop) */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`glass rounded-3xl p-6 text-center border-t-4 border-t-[#82a895]/60 flex flex-col items-center space-y-4 ${
                topThree[1].isCurrentUser ? 'border-2 border-[#00FF88]/40 bg-[#00FF88]/5 shadow-[0_0_30px_rgba(0,255,136,0.05)]' : 'border border-[#1D9E75]/15'
              }`}
            >
              <div className="relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl" title="Silver Medal">🥈</span>
                <img src={topThree[1].avatar} alt={topThree[1].name} className="w-16 h-16 rounded-2xl border border-border bg-[#0c2217] mt-1" />
              </div>
              <div>
                <h3 className="font-grotesk font-extrabold text-base text-text-primary leading-tight">{topThree[1].name}</h3>
                <p className="text-text-tertiary text-[11px] mt-1 flex items-center gap-1 justify-center"><MapPin size={11} /> {topThree[1].ward}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full pt-3 border-t border-[#1D9E75]/10 font-mono text-[11px] text-text-secondary">
                <div>
                  <span className="text-[9px] text-text-tertiary uppercase block">STREAK</span>
                  <p className="font-bold flex items-center justify-center gap-0.5 text-[#FF6B35]"><Flame size={12} className="fill-[#FF6B35]" /> {topThree[1].streak}</p>
                </div>
                <div>
                  <span className="text-[9px] text-text-tertiary uppercase block">POINTS</span>
                  <p className="font-bold text-[#00FF88]">{topThree[1].points} PTS</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rank 1 (Middle on desktop, tallest) */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`glass rounded-3xl p-8 text-center border-t-4 border-t-[#BA7517] relative flex flex-col items-center space-y-5 md:-translate-y-4 shadow-xl ${
                topThree[0].isCurrentUser ? 'border-2 border-[#00FF88]/40 bg-[#00FF88]/5 shadow-[0_0_40px_rgba(0,255,136,0.1)]' : 'border border-[#1D9E75]/25 shadow-black/50'
              }`}
            >
              {/* crown indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <Sparkles size={14} className="text-[#00FF88] animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-[10px] font-mono text-[#00FF88] font-bold">1ST WARD RATING</span>
              </div>

              <div className="relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>👑</span>
                <img src={topThree[0].avatar} alt={topThree[0].name} className="w-20 h-20 rounded-2xl border-2 border-[#BA7517] bg-[#0c2217] shadow-lg" />
              </div>
              <div>
                <h3 className="font-grotesk font-black text-lg text-text-primary leading-tight">{topThree[0].name}</h3>
                <p className="text-text-tertiary text-xs mt-1 flex items-center gap-1 justify-center"><MapPin size={11} /> {topThree[0].ward}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-3 border-t border-[#1D9E75]/10 font-mono text-xs text-text-secondary">
                <div>
                  <span className="text-[10px] text-text-tertiary uppercase block">STREAK</span>
                  <p className="font-bold flex items-center justify-center gap-0.5 text-[#FF6B35]"><Flame size={12} className="fill-[#FF6B35]" /> {topThree[0].streak}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-tertiary uppercase block">POINTS</span>
                  <p className="font-bold text-[#00FF88]">{topThree[0].points} PTS</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rank 3 (Right on desktop) */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`glass rounded-3xl p-6 text-center border-t-4 border-t-[#D85A30]/60 flex flex-col items-center space-y-4 ${
                topThree[2].isCurrentUser ? 'border-2 border-[#00FF88]/40 bg-[#00FF88]/5 shadow-[0_0_30px_rgba(0,255,136,0.05)]' : 'border border-[#1D9E75]/15'
              }`}
            >
              <div className="relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl" title="Bronze Medal">🥉</span>
                <img src={topThree[2].avatar} alt={topThree[2].name} className="w-16 h-16 rounded-2xl border border-border bg-[#0c2217] mt-1" />
              </div>
              <div>
                <h3 className="font-grotesk font-extrabold text-base text-text-primary leading-tight">{topThree[2].name}</h3>
                <p className="text-text-tertiary text-[11px] mt-1 flex items-center gap-1 justify-center"><MapPin size={11} /> {topThree[2].ward}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-3 border-t border-[#1D9E75]/10 font-mono text-[11px] text-text-secondary">
                <div>
                  <span className="text-[9px] text-text-tertiary uppercase block">STREAK</span>
                  <p className="font-bold flex items-center justify-center gap-0.5 text-[#FF6B35]"><Flame size={12} className="fill-[#FF6B35]" /> {topThree[2].streak}</p>
                </div>
                <div>
                  <span className="text-[9px] text-text-tertiary uppercase block">POINTS</span>
                  <p className="font-bold text-[#00FF88]">{topThree[2].points} PTS</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* GLORY LIST TABLE */}
        <div className="glass rounded-3xl border border-[#1D9E75]/15 overflow-hidden">
          <div className="p-5 border-b border-[#1D9E75]/10 flex justify-between items-center bg-[#061410]/40">
            <h3 className="font-grotesk font-bold text-sm uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Trophy size={15} className="text-[#00FF88]" />
              Civic Sentinel Rankings
            </h3>
            <span className="text-[10px] font-mono text-text-tertiary">RANKED BY CIVIC KARMA POINTS</span>
          </div>

          <div className="divide-y divide-[#1D9E75]/10 text-xs">
            {remainingRows.map((record) => (
              <div
                key={record.rank}
                className={`flex items-center justify-between p-4 transition-all ${
                  record.isCurrentUser ? 'bg-[#00FF88]/5 font-bold border-l-2 border-l-[#00FF88]' : 'hover:bg-[#0c2217]/20'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="font-mono text-text-tertiary w-6 text-center font-bold">#{record.rank}</span>
                  <img src={record.avatar} alt={record.name} className="w-10 h-10 rounded-xl border border-[#1D9E75]/10 bg-[#0c2217]" />
                  <div>
                    <h4 className="font-grotesk font-extrabold text-sm text-text-primary flex items-center gap-1.5">
                      {record.name}
                      {record.isCurrentUser && (
                        <span className="text-[9px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">YOU</span>
                      )}
                    </h4>
                    <p className="text-text-tertiary text-[11px] mt-0.5 flex items-center gap-1"><MapPin size={10} /> {record.ward}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-text-tertiary uppercase block">Reports</span>
                    <p className="text-text-secondary font-bold">{record.reportsCount} Filed</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-tertiary uppercase block">STREAK</span>
                    <p className="text-[#FF6B35] font-bold flex items-center gap-0.5 justify-end">
                      <Flame size={12} className="fill-[#FF6B35]" />
                      {record.streak}
                    </p>
                  </div>
                  <div className="min-w-[80px]">
                    <span className="text-[9px] text-text-tertiary uppercase block">KARMA</span>
                    <p className="text-[#00FF88] font-bold">{record.points} PTS</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
