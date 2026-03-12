import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Camera, Sparkles } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        // URL Autentikasi Instagram yang asli
        const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '1234567890';
        const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || `${window.location.origin}/oauth-callback`;
        const scope = 'user_profile,user_media';

        // Ini mengarahkan pengguna ke halaman login Instagram yang sebenarnya
        const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;

        // Redirect langsung ke Meta Instagram
        window.location.href = authUrl;
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

                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
                    Tuntaskan misi rahasia untuk memenangkan sesi <strong>Free Photoshoot</strong> eksklusif dan <strong>High-Res Edited Photos</strong> bergaya cinematic.
                </p>

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
                            <span>Berikan <strong>Like</strong> pada postingan campaign terbaru.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</span>
                            <span>Tinggalkan <strong>Comment</strong> menarik di postingan tersebut.</span>
                        </li>
                    </ul>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogin}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:ring-offset-transparent overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
                    <Instagram className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-12" />
                    <span className="relative z-10 text-lg">Login with Instagram</span>
                </motion.button>
                <p className="mt-4 text-sm text-gray-500">Mulai quest kamu sekarang.</p>
            </motion.div>
        </div>
    );
};

export default LandingPage;
