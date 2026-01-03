import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function untuk merge Tailwind CSS classes
 * Menggabungkan clsx dan tailwind-merge untuk handling conditional classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
