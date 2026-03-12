import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Mengautentikasi Instagram...');

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            setStatus('Login Ditolak. Mengalihkan kembali...');
            setTimeout(() => navigate('/'), 2000);
            return;
        }

        if (code) {
            setStatus('Menukar kode dengan access token...');
            // IMPLEMENTASI ASLI:
            // Di sini Anda biasanya akan mengirim `code` ke backend Anda (Node.js/Supabase Edge Function)
            // Backend tersebut akan POST ke https://api.instagram.com/oauth/access_token
            // Menggunakan client_id, client_secret, grant_type=authorization_code, redirect_uri, code.
            // API akan mengembalikan `access_token` dan `user_id`.

            // Untuk tujuan Frontend Only (Simulasi):
            setTimeout(() => {
                setStatus('Mengambil profil Instagram...');

                // Simulasikan hasil pengambilan profil dari graph.instagram.com/me
                const simulatedUser = {
                    username: `ig_user_${Math.floor(Math.random() * 1000)}`,
                    profilePic: `https://i.pravatar.cc/150?u=${code}` // Generate random pic based on code
                };

                // Simpan di local storage
                localStorage.setItem('ig_user', JSON.stringify(simulatedUser));

                setStatus('Berhasil! Mengarahkan ke Quest...');
                setTimeout(() => navigate('/quest'), 1000);
            }, 1500);

        } else {
            // Jika tidak ada kode, redirect ke home
            navigate('/');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-8 rounded-2xl flex flex-col items-center max-w-sm text-center"
            >
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                <h2 className="text-xl font-bold text-white mb-2">Harap Tunggu</h2>
                <p className="text-gray-400 text-sm">{status}</p>
            </motion.div>
        </div>
    );
};

export default OAuthCallback;
