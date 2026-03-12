import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistItem } from '../components/ChecklistItem';
import { verifyAllQuests } from '../services/instagramApi';
import { supabase } from '../supabase';
import { Trophy, Loader2, Link2, Users } from 'lucide-react';

const QuestDashboard = () => {
    const navigate = useNavigate();

    // User State from OAuth
    const [user, setUser] = useState(null);

    // Quest States
    const [quests, setQuests] = useState({
        isFollowing: false,
        hasLiked: false,
        hasCommented: false
    });
    const [isVerifying, setIsVerifying] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [savingStatus, setSavingStatus] = useState('');

    // Leaderboard State
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    useEffect(() => {
        // 1. Cek User Profile dari Local Storage (Disimpan oleh OAuthCallback)
        const storedUser = localStorage.getItem('ig_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Jika tidak ada user, redirect ke halaman utama
            navigate('/');
            return;
        }

        // 2. Fetch Leaderboard Publik dari Supabase
        fetchLeaderboard();

        const subscription = supabase
            .channel('public:quest_completers')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quest_completers' }, payload => {
                fetchLeaderboard(); // Refresh saat ada user baru
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [navigate]);

    const fetchLeaderboard = async () => {
        try {
            setLoadingLeaderboard(true);
            const { data, error } = await supabase
                .from('quest_completers')
                .select('username, completed_at')
                .order('completed_at', { ascending: false })
                .limit(10); // Ambil 10 terbaru agar UI rapi

            if (!error && data) {
                setLeaderboard(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleVerifyClick = async () => {
        setIsVerifying(true);
        setSavingStatus('');

        // Dalam implementasi asli yang utuh, lempar token dari OAuth flow ke fungsi ini
        const mockAccessToken = 'MOCK_TOKEN_123';
        const targetUserId = 'raydharmawan_id';
        const targetMediaId = 'campaign_post_id';

        const result = await verifyAllQuests(mockAccessToken, targetUserId, targetMediaId);

        if (result.success) {
            setQuests(result.data);
            setIsVerifying(false);

            // Jika semua tugas selesai
            if (result.data.isFollowing && result.data.hasLiked && result.data.hasCommented) {
                setIsCompleted(true);
                saveCompletion(user.username);
            }
        } else {
            setIsVerifying(false);
        }
    };

    const saveCompletion = async (username) => {
        try {
            setSavingStatus('Menyimpan nama Anda ke daftar...');

            const { data, error } = await supabase
                .from('quest_completers')
                .insert([
                    { username, status: 'Quest Completed', completed_at: new Date().toISOString() },
                ]);

            if (error) {
                console.error("Supabase error:", error);

                // Handle duplicate username constraint if you add one to Supabase
                if (error.code === '23505') {
                    setSavingStatus('Anda sudah pernah menyelesaikan Quest ini!');
                } else {
                    setSavingStatus('Gagal menyimpan. Coba lagi nanti.');
                }
            } else {
                setSavingStatus('Berhasil disimpan! Anda resmi terdaftar. 🎉');
            }
        } catch (err) {
            console.error("Unknown error:", err);
            setSavingStatus('Terjadi kesalahan koneksi saat menyimpan.');
        }
    };

    if (!user) return null; // Atau spinner loading

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center">

            <div className="w-full max-w-lg mt-10 space-y-8">

                {/* Profile Card */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-card rounded-3xl p-6 flex items-center gap-6"
                >
                    <div className="relative">
                        <img
                            src={user.profilePic}
                            alt="Profile"
                            className="w-20 h-20 rounded-full border-2 border-primary/50 object-cover"
                        />
                        {isCompleted && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -bottom-2 -right-2 bg-accent rounded-full p-1"
                            >
                                <Trophy className="w-5 h-5 text-white" />
                            </motion.div>
                        )}
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Participant</p>
                        <h2 className="text-2xl font-bold text-white max-w-[200px] truncate" title={`@${user.username}`}>
                            @{user.username}
                        </h2>
                    </div>
                </motion.div>

                {/* Quest Checklists */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Misi Utama
                        </h3>
                        <span className="text-sm font-medium text-gray-400">Klik List untuk Menjalankan</span>
                    </div>

                    <div className="space-y-4 relative">
                        <ChecklistItem
                            title="Follow @raydharmawan_"
                            description="Buka profil dan klik ikuti."
                            href="https://www.instagram.com/raydharmawan_" // Tautan ke Profil
                            isCompleted={quests.isFollowing}
                            delay={0.1}
                        />
                        <ChecklistItem
                            title="Like Postingan"
                            description="Berikan like pada postingan ini."
                            href="https://www.instagram.com/p/TARGET_POST_ID/" // Tautan Spesifik Postingan
                            isCompleted={quests.hasLiked}
                            delay={0.2}
                        />
                        <ChecklistItem
                            title="Komentar Menarik"
                            description="Tinggalkan jejakmu di postingan."
                            href="https://www.instagram.com/p/TARGET_POST_ID/#comments" // Tautan ke Komentar Postingan
                            isCompleted={quests.hasCommented}
                            delay={0.3}
                        />

                        {isVerifying && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-md rounded-xl flex items-center justify-center flex-col z-10">
                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                <p className="text-primary font-medium animate-pulse text-center px-4">Memverifikasi misi via Instagram API...<br /><span className="text-xs text-gray-400">(Estimasi 3 detik)</span></p>
                            </div>
                        )}
                    </div>

                    {!isCompleted && (
                        <button
                            onClick={handleVerifyClick}
                            disabled={isVerifying}
                            className="w-full mt-6 py-4 bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors border border-white/10 rounded-xl font-bold text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isVerifying ? 'Sedang Memeriksa...' : 'Cek Status Misi Saya'}
                        </button>
                    )}
                </motion.div>

                {/* Success Animation & Database Status */}
                <AnimatePresence>
                    {isCompleted && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center p-8 glass-card rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 border-primary/30"
                        >
                            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                            <h3 className="text-2xl font-bold text-white mb-2">Quest Completed!</h3>
                            <p className="text-gray-300 mb-4">
                                Selamat! Quest kamu selesai dan sedang diproses ke dalam buku tamu.
                            </p>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <p className="text-sm font-mono text-accent">
                                    {savingStatus}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Public Leaderboard */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-10 pb-10"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <Users className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold">Daftar Pemenang Terkini</h3>
                    </div>

                    <div className="glass-card rounded-xl p-2">
                        {loadingLeaderboard ? (
                            <div className="p-8 flex justify-center text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Memuat daftar...
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                Belum ada yang menyelesaikan quest. Jadilah yang pertama!
                            </div>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {leaderboard.map((com, index) => (
                                    <li key={index} className="p-4 flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500 font-mono text-xs w-5 text-center">#{index + 1}</span>
                                            <span className="font-semibold text-gray-200">@{com.username}</span>
                                        </div>
                                        <span className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-full">
                                            Sukses
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default QuestDashboard;
