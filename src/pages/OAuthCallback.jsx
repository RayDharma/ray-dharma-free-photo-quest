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
            setStatus('Membaca token dari server...');

            // Panggil Vercel API
            fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setStatus(`Selamat datang, @${data.user.username}!`);
                        localStorage.setItem('ig_user', JSON.stringify(data.user));
                        setTimeout(() => navigate('/quest'), 1000);
                    } else {
                        console.error('Auth Error:', data);
                        setStatus('Gagal Autentikasi. Mengalihkan...');
                        setTimeout(() => navigate('/'), 3000);
                    }
                })
                .catch(err => {
                    console.error('Network Error:', err);
                    setStatus('Error jaringan. Coba lagi nanti...');
                    setTimeout(() => navigate('/'), 3000);
                });

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
