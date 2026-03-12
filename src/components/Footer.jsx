import React from 'react';

const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <div className="w-full text-center mt-12 pb-4 text-xs text-gray-500 font-medium z-10 relative">
            &copy; {year} Hikayyara Creative, Ray Dharma & Selvi Dharma
        </div>
    );
};

export default Footer;
