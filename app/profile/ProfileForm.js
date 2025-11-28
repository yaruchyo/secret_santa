'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function ProfileForm({ user }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loggingOut, setLoggingOut] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password || undefined
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError('Failed to logout');
            }
        } catch (err) {
            setError('An error occurred during logout');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="error-message">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="success-message">
                    <span>✓</span>
                    <span>{success}</span>
                </div>
            )}

            <div>
                <label className="form-label">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    required
                />
            </div>

            <div>
                <label className="form-label">Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input w-full"
                    required
                />
            </div>

            <div className="pt-4 border-t border-white/10 mt-8">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                    <div>
                        <label className="form-label">New Password (optional)</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input w-full"
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    <div>
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="input w-full"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⌛</span>
                            Saving...
                        </span>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>

            <div className="pt-6 border-t border-white/10 mt-8">
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="btn-destructive w-full flex items-center justify-center gap-2"
                >
                    <LogOut size={18} />
                    {loggingOut ? 'Logging out...' : 'Log Out'}
                </button>
            </div>
        </form>
    );
}
