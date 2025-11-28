'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaggeredMenu from './StaggeredMenu';

export default function Navbar({ user }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="glass mb-8 sticky top-0 z-50 animate-slide-up">
            <div className="container flex items-center justify-between py-4">
                <Link href="/" className="text-2xl font-bold gradient-text flex items-center gap-2 hover:scale-105 transition-all">
                    🎁 <span className="hidden sm:inline">Secret Santa</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold border-2 border-background avatar-text shadow-lg group-hover:scale-110 transition-transform">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium group-hover:text-white transition-colors">{user?.name}</span>
                    </Link>
                    <Link href="/join" className="btn btn-secondary text-sm">
                        <span>🎉</span> Join Event
                    </Link>
                    <Link href="/create" className="btn btn-primary text-sm">
                        <span>✨</span> New Event
                    </Link>
                    <button onClick={handleLogout} className="btn btn-secondary text-sm">
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button - Direct Rendering */}
                <div className="md:hidden">
                    <StaggeredMenu
                        position="right"
                        items={[
                            { label: 'Home', link: '/' },
                            { label: 'New Event', link: '/create' },
                            { label: 'Join Event', link: '/join' },
                            { label: 'Profile', link: '/profile' },
                            { label: 'Logout', link: '#', onClick: (e) => { e.preventDefault(); handleLogout(); } }
                        ]}
                        displaySocials={false}
                        displayItemNumbering={false}
                        menuButtonColor="#fff"
                        openMenuButtonColor="#fff"
                        changeMenuColorOnOpen={true}
                        colors={['#6366f1', '#8b5cf6', '#d946ef']}
                        accentColor="#ec4899"
                        isFixed={true}
                    />
                </div>
            </div>
        </nav>
    );
}
