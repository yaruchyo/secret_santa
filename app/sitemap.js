export default function sitemap() {
    return [
        {
            url: 'https://www.everyonesanta.com',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://www.everyonesanta.com/dashboard',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]
}
