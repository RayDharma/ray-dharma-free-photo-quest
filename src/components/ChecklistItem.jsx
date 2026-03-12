import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const ChecklistItem = ({
    title,
    description,
    isCompleted,
    delay = 0,
    href,
    onClick
}) => {
    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={cn(
                "glass-card p-4 rounded-xl flex items-center gap-4 transition-all duration-300",
                isCompleted ? "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(252,100,64,0.2)]" : "opacity-70 grayscale-[0.3]"
            )}
        >
            <div className="flex-shrink-0">
                {isCompleted ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </motion.div>
                ) : (
                    <Circle className="w-8 h-8 text-gray-500" />
                )}
            </div>
            <div className="flex-1">
                <h3 className={cn(
                    "font-semibold text-lg transition-colors duration-300",
                    isCompleted ? "text-white" : "text-gray-300"
                )}>
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-gray-400 mt-1">{description}</p>
                )}
            </div>
        </motion.a>
    );
};
