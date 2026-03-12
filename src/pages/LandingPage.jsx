import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Camera, Sparkles, ArrowRight, Users, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { supabase } from '../supabase';

const LandingPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [liveCompleters, setLiveCompleters] = useState([]);
    const [loadingCompleters, setLoadingCompleters] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const MAX_PAGES = 5;

    useEffect(() => {
        const fetchLiveCompleters = async () => {
            try {
                setLoadingCompleters(true);
                const { data, count, error } = await supabase
                    .from('quest_completers')
                    .select('username', { count: 'exact' })
                    .eq('status', 'Approved')
                    .order('completed_at', { ascending: false })
                    .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

                if (!error && data) {
                    setLiveCompleters(data);
                    const actualTotalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
                    setTotalPages(Math.min(actualTotalPages, MAX_PAGES) || 1);
                }
            } catch (err) {
                console.error("Error fetching live completers:", err);
            } finally {
                setLoadingCompleters(false);
            }
        };

        fetchLiveCompleters();

        const subscription = supabase
            .channel('public:quest_completers_landing')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quest_completers' }, payload => {
                // Return to page 1 on new data for better UX, or just refetch
                fetchLiveCompleters();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [currentPage]);

    const handleStartQuest = (e) => {
        e.preventDefault();

        // Bersihkan spasi dan simbol @ jika user mengetiknya
        const cleanUsername = username.trim().replace(/^@/, '');

        if (!cleanUsername) {
            setError('Username Instagram tidak boleh kosong.');
            return;
        }

        if (cleanUsername.length < 3) {
            setError('Username terlalu pendek.');
            return;
        }

        // Ciptakan profil user sintesis (seperti hasil mock OAuth dulu, tapi tanpa code)
        const userProfile = {
            username: cleanUsername,
            profilePic: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanUsername}&backgroundColor=ec4899`,
        };

        // Simpan ke local storage
        localStorage.setItem('ig_user', JSON.stringify(userProfile));

        // Langsung arahkan ke dashboard
        navigate('/quest');
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-background">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 w-full max-w-2xl text-center"
            >
                <div className="flex justify-center mb-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        className="p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl"
                    >
                        <Camera className="w-16 h-16 text-primary" />
                    </motion.div>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight leading-tight">
                    Ray Dharma <br />
                    <span className="text-gradient">Free Photo Quest</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-6 max-w-xl mx-auto leading-relaxed">
                    Tuntaskan misi untuk memenangkan sesi <strong>Free Photoshoot</strong> eksklusif & <strong>High-Res Edited Photos</strong> bergaya cinematic untuk event cosplay di Bali tanggal 24 & 26 April 2026.
                </p>

                {/* Live Leaderboard Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center justify-center mb-10"
                >
                    <div className="flex items-center gap-2 mb-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-300">Live: Peserta Berhasil</span>
                    </div>

                    {loadingCompleters ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    ) : liveCompleters.length > 0 ? (
                        <div className="flex flex-col items-center w-full">
                            <h3 className="text-xl font-bold text-white mb-4">Daftar Pemenang Terkini</h3>

                            <div className="flex flex-col gap-2 w-full max-w-sm">
                                {liveCompleters.map((user, idx) => {
                                    const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm text-primary">
                                                    #{rank}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        className="w-8 h-8 rounded-full object-cover bg-gray-800"
                                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=ec4899`}
                                                        alt={user.username}
                                                    />
                                                    <span className="font-semibold text-white truncate max-w-[100px]">@{user.username}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                                <Sparkles className="w-3 h-3" /> Sukses
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2 mt-4">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="p-1 px-2 flex items-center bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs text-gray-400"
                                    >
                                        <ChevronsLeft className="w-4 h-4 mr-1" /> First
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1 px-2 flex items-center bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs text-gray-400"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                    </button>

                                    <span className="text-xs font-mono text-gray-300 mx-2">
                                        Page {currentPage} / {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-1 px-2 flex items-center bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs text-gray-400"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="p-1 px-2 flex items-center bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs text-gray-400"
                                    >
                                        Last <ChevronsRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 italic">Belum ada peserta. Jadilah yang pertama!</p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="glass-card rounded-2xl p-8 mb-10 text-left"
                >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="text-accent" />
                        Aturan Main:
                    </h2>
                    <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</span>
                            <span><strong>Follow</strong> akun Instagram <code>@raydharmawan_</code></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</span>
                            <span>Berikan <strong>Like</strong> pada postingan terbaru.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</span>
                            <span>Tinggalkan <strong>Comment</strong> menarik di postingan tersebut.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</span>
                            <span><strong>Repost</strong> postingan ke profil Anda.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0">5</span>
                            <span><strong>Share</strong> postingan ke Story Anda.</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Form Input Username Manual */}
                <form onSubmit={handleStartQuest} className="flex flex-col items-center w-full max-w-sm mx-auto gap-4">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Instagram className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            className="bg-white/5 border border-white/10 text-white text-lg rounded-2xl focus:ring-primary focus:border-primary block w-full pl-12 p-4 placeholder-gray-500 transition-all focus:bg-white/10"
                            placeholder="Username Instagram kamu..."
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm animate-pulse">{error}</p>}

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group w-full relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:ring-offset-transparent overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
                        <span className="relative z-10 text-lg">Mulai Quest Sekarang</span>
                        <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </form>

            </motion.div>
        </div >
    );
};

export default LandingPage;
