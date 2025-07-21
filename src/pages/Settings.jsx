import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
        setProfile(data);
        setEditName(data.full_name);
      } catch (err) {
        toast.error(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleNameSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ full_name: editName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setProfile(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      toast.success('Password changed!');
      setPwForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your profile and password</p>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : profile ? (
        <>
          <form onSubmit={handleNameSave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Email</label>
              <input value={profile.email} disabled className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Full Name</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-900"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
          <form onSubmit={handlePwChange} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="font-semibold text-lg mb-2">Change Password</div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Old Password</label>
              <input
                type="password"
                value={pwForm.oldPassword}
                onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-gray-900"
                required
              />
            </div>
            <button type="submit" disabled={pwLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center text-red-600">Failed to load profile.</div>
      )}
    </div>
  );
};

export default Settings; 