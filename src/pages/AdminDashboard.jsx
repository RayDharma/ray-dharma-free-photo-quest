import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Users, Loader2, Check, X, Image as ImageIcon, LockKeyhole, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Dashboard State
    const [completers, setCompleters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (!isAuthenticated) return;

        fetchCompleters();

        const subscription = supabase
            .channel('public:admin_quest_completers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quest_completers' }, payload => {
                fetchCompleters();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        }
    }, [isAuthenticated, currentPage]);

    const fetchCompleters = async () => {
        try {
            setLoading(true);
            const { data, count, error } = await supabase
                .from('quest_completers')
                .select('*', { count: 'exact' })
                .order('completed_at', { ascending: false })
                .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setCompleters(data || []);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE) || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('quest_completers')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setCompleters(completers.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Gagal mengupdate status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin MENGHAPUS data ini secara permanen dari database?")) return;

        try {
            const { error } = await supabase
                .from('quest_completers')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCompleters(completers.filter(c => c.id !== id));
        } catch (err) {
            console.error("Error deleting record:", err);
            alert("Gagal menghapus data.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'; // Pending
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'rayselpi23') {
            setIsAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Username atau password salah!');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                    <div className="relative text-center mb-8">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                            <LockKeyhole className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Area</h2>
                        <p className="text-gray-400 text-sm">Masuk untuk mengelola partisipan quest.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                required
                            />
                        </div>

                        {loginError && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-2 rounded-lg"
                            >
                                {loginError}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(252,100,64,0.3)] mt-2"
                        >
                            Masuk
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Hub</h1>
                            <p className="text-gray-400">Verifikasi Manual Bukti Quest</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 transition-colors text-sm font-medium"
                    >
                        Keluar
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl overflow-hidden border border-white/5"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-gray-300">
                                    <th className="p-4 font-semibold">Terkirim</th>
                                    <th className="p-4 font-semibold">Username IG</th>
                                    <th className="p-4 font-semibold text-center">Bukti (Screenshot)</th>
                                    <th className="p-4 font-semibold text-center">Status Saat Ini</th>
                                    <th className="p-4 font-semibold text-right">Aksi Verifikasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                <span>Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : completers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400">
                                            Belum ada peserta yang mendaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    completers.map((user, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={user.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                                                {new Date(user.completed_at).toLocaleString('id-ID', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short'
                                                })}
                                            </td>
                                            <td className="p-4 font-bold text-white whitespace-nowrap">
                                                <a href={`https://instagram.com/${user.username}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                                                    @{user.username}
                                                </a>
                                            </td>
                                            <td className="p-4 text-center">
                                                {user.proof_image_url ? (
                                                    <button
                                                        onClick={() => setSelectedImage(user.proof_image_url)}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors mx-auto"
                                                    >
                                                        <ImageIcon className="w-4 h-4 text-accent" /> Lihat
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500 text-xs italic">Tidak ada foto</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.status)}`}>
                                                    {user.status === 'Quest Completed' ? 'Approved (Old)' : user.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, 'Approved')}
                                                        disabled={user.status === 'Approved'}
                                                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Setujui & Tampilkan di Leaderboard"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, 'Rejected')}
                                                        disabled={user.status === 'Rejected'}
                                                        className="p-2 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Tolak Bukti"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg transition-colors"
                                                        title="Hapus Permanen dari Database"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls Admin */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 bg-white/5 border-t border-white/10">
                                <div className="text-sm text-gray-400">
                                    Halaman <span className="font-bold text-white">{currentPage}</span> dari <span className="font-bold text-white">{totalPages}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="p-2 flex items-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm text-gray-300"
                                    >
                                        <ChevronsLeft className="w-4 h-4 mr-1" /> Awal
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 flex items-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm text-gray-300"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                    </button>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 flex items-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm text-gray-300"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 flex items-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm text-gray-300"
                                    >
                                        Akhir <ChevronsRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Modal Image Viewer */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-red-500/50 rounded-full text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img
                                src={selectedImage}
                                alt="Proof Screenshot"
                                className="rounded-xl object-contain max-h-[85vh] border border-white/20 shadow-2xl"
                                onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
