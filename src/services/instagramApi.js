/**
 * Instagram Graph API Service
 * File ini berisi helper functions untuk berinteraksi dengan Meta Instagram Graph API.
 * Saat ini menggunakan data mock untuk keperluan UI development.
 */

// Helper function untuk memeriksa status Follow
export const checkFollowStatus = async (accessToken, targetUserId) => {
    // IMPLEMENTASI ASLI:
    // endpoint: GET `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    // Setelah mendapatkan ID user yang login, Anda perlu mengecek relationship terhadap `targetUserId` (@raydharmawan_)
    // Catatan: Meta Graph API untuk user biasa (Basic Display API) tidak mendukung endpoint follow tracking secara langsung
    // Untuk tracking follow/like/comment dengan Graph API biasanya memerlukan Instagram Business Account & interaksi dengan page terkait.

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'success', isFollowing: true });
        }, 1500); // Simulasi request 1.5 detik
    });
};

// Helper function untuk memeriksa status Like pada postingan tertentu
export const checkLikeStatus = async (accessToken, targetMediaId) => {
    // IMPLEMENTASI ASLI:
    // endpoint API bisnis: GET `https://graph.facebook.com/v19.0/${targetMediaId}/likes?access_token=${accessToken}`

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'success', hasLiked: true });
        }, 2000);
    });
};

// Helper function untuk memeriksa status Comment pada postingan tertentu
export const checkCommentStatus = async (accessToken, targetMediaId) => {
    // IMPLEMENTASI ASLI:
    // endpoint API bisnis: GET `https://graph.facebook.com/v19.0/${targetMediaId}/comments?access_token=${accessToken}`

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'success', hasCommented: true });
        }, 2500);
    });
};

// Fungsi gabungan untuk memverifikasi seluruh task secara bersamaan
export const verifyAllQuests = async (accessToken, targetUserId, targetMediaId) => {
    try {
        const [followRes, likeRes, commentRes] = await Promise.all([
            checkFollowStatus(accessToken, targetUserId),
            checkLikeStatus(accessToken, targetMediaId),
            checkCommentStatus(accessToken, targetMediaId)
        ]);

        return {
            success: true,
            data: {
                isFollowing: followRes.isFollowing,
                hasLiked: likeRes.hasLiked,
                hasCommented: commentRes.hasCommented
            }
        };
    } catch (error) {
        console.error("Error verifying quests:", error);
        return { success: false, error: error.message };
    }
};
