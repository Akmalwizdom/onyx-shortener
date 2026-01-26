import { safebrowsing_v4 } from '@googleapis/safebrowsing';
import { google } from 'googleapis';

const safeBrowsing = google.safebrowsing('v4');

export async function checkUrlWithSafeBrowsing(urlToCheck: string): Promise<boolean> {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

    if (!apiKey) {
        console.warn('GOOGLE_SAFE_BROWSING_API_KEY is not set. Skipping Safe Browsing check.');
        return false; // Treat as safe if API key is not configured
    }

    try {
        const response = await safeBrowsing.threatMatches.find({
            key: apiKey,
            requestBody: {
                client: {
                    clientId: 'xyno-shortener-app', // A unique client ID for your application
                    clientVersion: '1.0.0',          // The version of your application
                },
                threatInfo: {
                    threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                    platformTypes: ['ANY_PLATFORM'],
                    threatEntryTypes: ['URL'],
                    threatEntries: [{ url: urlToCheck }],
                },
            },
        });

        if (response.data.matches && response.data.matches.length > 0) {
            console.warn(`Unsafe URL detected by Safe Browsing: ${urlToCheck}`);
            return true; // Unsafe URL
        } else {
            return false; // Safe URL
        }
    } catch (error) {
        console.error('Error checking URL with Google Safe Browsing API:', error);
        // In case of API error, we might want to fail safe (block) or allow.
        // For a shortener, it's safer to block if the check fails.
        // However, given it's an external dependency, allowing it to pass might be better
        // if the API is down, to not block legitimate users. I'll allow it for now.
        return false;
    }
}
