export default async function handler(req, res) {
    // Hanya perbolehkan request POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        // 1. Tukar Code dengan Access Token
        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.VITE_INSTAGRAM_CLIENT_ID,
                client_secret: process.env.INSTAGRAM_CLIENT_SECRET, // Diambil dari environment Vercel
                grant_type: 'authorization_code',
                redirect_uri: process.env.VITE_INSTAGRAM_REDIRECT_URI,
                code: code.replace('#_', '') // Seringkali Instagram menambahkan #_ di akhir code
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Token Error:', tokenData);
            return res.status(400).json({ error: 'Gagal mendapatkan akses token', details: tokenData });
        }

        // 2. Ambil Profil Instagram dengan Access Token
        const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`);
        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
            console.error('Profile Error:', profileData);
            return res.status(400).json({ error: 'Gagal mengambil profil Instagram', details: profileData });
        }

        // Generate foto profil sementara (karena Basic Display API tidak menyediakan foto profil)
        const profilePic = `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.username}&backgroundColor=ec4899`;

        // 3. Kembalikan data ke frontend
        return res.status(200).json({
            success: true,
            user: {
                id: profileData.id,
                username: profileData.username,
                profilePic: profilePic
            }
        });

    } catch (error) {
        console.error('API Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
