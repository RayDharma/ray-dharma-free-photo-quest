import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [completers, setCompleters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompleters();

        // Opsional: Realtime subscription Supabase
        const subscription = supabase
            .channel('public:quest_completers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quest_completers' }, payload => {
                console.log('Change received!', payload);
                fetchCompleters(); // Refresh data on change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        }
    }, []);

    const fetchCompleters = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('quest_completers')
                .select('*')
                .order('completed_at', { ascending: false });

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setCompleters(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-primary/20 p-3 rounded-xl">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Hub</h1>
                        <p className="text-gray-400">Daftar Hadir / Pemenang Free Photo Quest</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl overflow-hidden border border-white/5"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-gray-300">
                                    <th className="p-4 font-semibold">ID</th>
                                    <th className="p-4 font-semibold">Username IG</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Waktu Selesai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                <span>Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : completers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">
                                            Belum ada peserta yang menyelesaikan quest.
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
                                            <td className="p-4 text-gray-500 font-mono text-sm">
                                                {(user.id || '').substring(0, 8)}...
                                            </td>
                                            <td className="p-4 font-medium text-white">
                                                @{user.username}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                {new Date(user.completed_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
