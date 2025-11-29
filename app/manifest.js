export default function manifest() {
    return {
        name: 'Everyone Santa',
        short_name: 'EveryoneSanta',
        description: 'The premium Secret Santa generator for your holiday gift exchanges.',
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
