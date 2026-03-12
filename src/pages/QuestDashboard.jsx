import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistItem } from '../components/ChecklistItem';
import { verifyAllQuests } from '../services/instagramApi';
import { supabase } from '../supabase';
import imageCompression from 'browser-image-compression';
import { Trophy, Loader2, Link2, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const QuestDashboard = () => {
    const navigate = useNavigate();

    // User State from OAuth
    const [user, setUser] = useState(null);

    // Quest States
    const [quests, setQuests] = useState({
        isFollowing: false,
        hasLiked: false,
        hasCommented: false,
        hasReposted: false,
        hasShared: false
    });
    const [isVerifying, setIsVerifying] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [savingStatus, setSavingStatus] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Leaderboard State
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('ig_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/');
            return;
        }

        const subscription = supabase
            .channel('public:quest_completers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quest_completers' }, payload => {
                setPage(0);
                fetchLeaderboard(0);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [navigate]);

    useEffect(() => {
        fetchLeaderboard(page);
    }, [page]);

    const fetchLeaderboard = async (currentPage = page) => {
        try {
            setLoadingLeaderboard(true);
            const from = currentPage * 10;
            const to = from + 9;

            const { data, error } = await supabase
                .from('quest_completers')
                .select('username, completed_at, status')
                .eq('status', 'Approved')
                .order('completed_at', { ascending: false })
                .range(from, to);

            if (!error && data) {
                setLeaderboard(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Harap unggah file berupa gambar (JPG, PNG, dll).');
            return;
        }

        setIsVerifying(true);
        setSavingStatus('Sedang mengkompresi gambar...');

        try {
            const options = {
                maxSizeMB: 0.5, // Maksimal 500KB
                maxWidthOrHeight: 1280, // Resolusi cukup HD tapi efisien
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            setSelectedFile(compressedFile);
        } catch (error) {
            console.error('Error compressing image:', error);
            // Fallback ke file asli jika kompresi gagal
            setSelectedFile(file);
        } finally {
            setIsVerifying(false);
            setSavingStatus('');
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setIsVerifying(true);
        setErrorMsg('');
        setSavingStatus('Sedang mengunggah bukti screenshot...');

        try {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.username}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('quest_proofs')
                .upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('quest_proofs')
                .getPublicUrl(filePath);

            setSavingStatus('Menyimpan data pendaftaran...');

            const { error: dbError } = await supabase
                .from('quest_completers')
                .insert([
                    {
                        username: user.username,
                        status: 'Pending',
                        proof_image_url: publicUrl,
                        completed_at: new Date().toISOString()
                    },
                ]);

            if (dbError) {
                if (dbError.code === '23505') {
                    throw new Error('Anda sudah pernah mengirimkan bukti Quest ini!');
                }
                throw dbError;
            }

            setSavingStatus('Bukti berhasil dikirim! Silakan tunggu konfirmasi Admin.');
            setIsCompleted(true);
            setIsVerifying(false);

        } catch (err) {
            console.error("Upload Error:", err);
            if (err.message && err.message.includes('Bucket not found')) {
                setErrorMsg('Sistem belum siap. (Pesan untuk Admin: Harap buat Storage Bucket "quest_proofs" di Supabase Dashboard Anda sekarang!)');
            } else {
                setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah bukti.');
            }
            setIsVerifying(false);
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
                            href="https://www.instagram.com/raydharmawan_"
                            isCompleted={quests.isFollowing}
                            delay={0.1}
                        />
                        <ChecklistItem
                            title="Like Postingan"
                            description="Berikan like pada konten yang Anda sukai."
                            href="https://www.instagram.com/raydharmawan_"
                            isCompleted={quests.hasLiked}
                            delay={0.2}
                        />
                        <ChecklistItem
                            title="Komentar Menarik"
                            description="Tinggalkan jejak kreatif di postingan."
                            href="https://www.instagram.com/raydharmawan_"
                            isCompleted={quests.hasCommented}
                            delay={0.3}
                        />
                        <ChecklistItem
                            title="Repost Postingan"
                            description="Repost postingan ke feeds Anda."
                            href="https://www.instagram.com/raydharmawan_"
                            isCompleted={quests.hasReposted}
                            delay={0.4}
                        />
                        <ChecklistItem
                            title="Share ke Story"
                            description="Bagikan postingan ke Story Instagram."
                            href="https://www.instagram.com/raydharmawan_"
                            isCompleted={quests.hasShared}
                            delay={0.5}
                        />
                    </div>

                    {!isCompleted && (
                        <div className="mt-6 flex flex-col items-center gap-3">
                            <input
                                type="file"
                                id="proof-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isVerifying}
                            />
                            {!selectedFile ? (
                                <label
                                    htmlFor="proof-upload"
                                    className={`w-full py-4 transition-all border border-white/10 rounded-xl font-bold flex justify-center items-center gap-2 cursor-pointer bg-primary/20 text-primary hover:bg-primary/40`}
                                >
                                    Pilih Gambar Screenshot
                                </label>
                            ) : (
                                <div className="w-full flex flex-col gap-3">
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                                        <span className="text-sm text-gray-300 truncate w-32 md:w-48 text-left">📁 {selectedFile.name}</span>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="text-red-400 text-sm hover:underline"
                                            disabled={isVerifying}
                                        >
                                            Ganti
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isVerifying}
                                        className={`w-full py-4 transition-all rounded-xl font-bold flex justify-center items-center gap-2 
                                            ${isVerifying ? 'bg-white/5 text-gray-400 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:opacity-90 shadow-lg'}
                                        `}
                                    >
                                        {isVerifying ? (
                                            <>Sedang Mengunggah... <Loader2 className="w-5 h-5 animate-spin" /></>
                                        ) : (
                                            'Kirim Bukti Sekarang'
                                        )}
                                    </button>
                                </div>
                            )}
                            {errorMsg && (
                                <p className="text-sm font-semibold text-red-500 mt-2 text-center bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 w-full animate-in fade-in slide-in-from-bottom-2">
                                    ⚠️ {errorMsg}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 text-center mt-2 px-2">
                                Pastikan screenshot menampilkan bukti Anda sudah menyelesaikan kelima misi di atas.
                            </p>
                        </div>
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
                            <>
                                <ul className="divide-y divide-white/5">
                                    {leaderboard.map((com, index) => (
                                        <li key={index} className="p-4 flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500 font-mono text-xs w-8 text-center">#{page * 10 + index + 1}</span>
                                                <span className="font-semibold text-gray-200">@{com.username}</span>
                                            </div>
                                            <span className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-full">
                                                Sukses
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between items-center px-4 py-3 border-t border-white/10 mt-2">
                                    <button
                                        onClick={() => setPage(Math.max(0, page - 1))}
                                        disabled={page === 0 || loadingLeaderboard}
                                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Prev
                                    </button>
                                    <span className="text-xs text-gray-500 font-mono">Page {page + 1}</span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={leaderboard.length < 10 || loadingLeaderboard}
                                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default QuestDashboard;
