import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    }
    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="flex justify-center items-center h-96 text-gray-400">Loading profile...</div>;
  }

  const initials = profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';
  const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center relative">
        <div className="absolute top-4 right-4">
          <button
            className="bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 border border-blue-100 text-sm font-medium"
            onClick={() => setShowEdit(true)}
          >
            Edit Profile
          </button>
        </div>
        <div className="h-24 w-24 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-4xl mb-4 shadow-md">
          {initials}
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{profile.full_name}</div>
        <div className="text-sm text-gray-600 mb-2">{profile.email}</div>
        <div className="text-xs text-gray-600 mb-4">Member since {memberSince}</div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowEdit(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Profile</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const full_name = form.full_name.value;
                const email = form.email.value;
                try {
                  const res = await fetch('/api/users/me', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ full_name, email }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
                  setProfile(data);
                  toast.success('Profile updated!');
                  setShowEdit(false);
                } catch (err) {
                  toast.error(err.message || 'Failed to update profile');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  name="full_name"
                  defaultValue={profile.full_name}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
            </form>
            <div className="border-t my-4"></div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const oldPassword = form.oldPassword.value;
                const newPassword = form.newPassword.value;
                try {
                  const res = await fetch('/api/users/me/password', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ oldPassword, newPassword }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Failed to change password');
                  toast.success('Password changed!');
                  form.reset();
                } catch (err) {
                  toast.error(err.message || 'Failed to change password');
                }
              }}
              className="space-y-4"
            >
              <div className="font-semibold text-lg mb-2">Change Password</div>
              <div>
                <label className="block text-sm font-medium mb-1">Old Password</label>
                <input
                  name="oldPassword"
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 