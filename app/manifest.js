export default function manifest() {
    return {
        name: 'Everyone Santa',
        short_name: 'EveryoneSanta',
        description: 'The ultimate social wishlist and gifting platform for every occasion.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a1f1c',
        theme_color: '#d4af37',
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
