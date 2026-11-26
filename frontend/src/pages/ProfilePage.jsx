import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerLayout from '../components/CustomerLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password change
    if (isChangingPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }
      if (!formData.newPassword) {
        setError('New password is required');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      if (isChangingPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put('/auth/profile', updateData);

      // Update user context with new data
      const updatedUser = response.data.data.user;
      updateUser(updatedUser);
      
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setIsChangingPassword(false);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      '⚠️ WARNING: Are you sure you want to delete your account?\n\n' +
      'This will permanently delete:\n' +
      '• Your profile and personal information\n' +
      '• All your orders and reservations\n' +
      '• Your cart items\n' +
      (user?.role === 'pharmacy' ? '• Your pharmacy and all inventory\n' : '') +
      '\nThis action CANNOT be undone!'
    );

    if (!firstConfirm) return;

    // Ask for password confirmation
    const password = window.prompt(
      'Please enter your password to confirm account deletion:'
    );

    if (!password) {
      setError('Password is required to delete your account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.delete('/auth/account', {
        data: { password }
      });

      // Logout and redirect to home page
      logout();
      navigate('/', { 
        state: { 
          message: 'Your account has been successfully deleted. We\'re sorry to see you go.' 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <span className="font-mono-data text-[11px] uppercase tracking-[0.16em] text-[#0F4C3A]">
            Account Settings
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#121816] mt-1">
            Profile &amp; Security
          </h1>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="bg-white border border-[#E4E1D8] rounded-2xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="p-5 sm:p-6 border-b border-[#EFECE5]">
              <h2 className="text-base font-bold text-[#121816] mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 outline-none transition"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#4E5B55]">
                    Account Role
                  </span>
                  <span className="font-mono-data uppercase text-xs px-3 py-1 rounded-full bg-[#E6F2EC] text-[#0F4C3A] font-semibold">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="p-5 sm:p-6 border-b border-[#EFECE5]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#121816]">
                  Password &amp; Security
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(!isChangingPassword);
                    setFormData(prev => ({
                      ...prev,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                    setError('');
                  }}
                  className="text-xs font-semibold text-[#0F4C3A] hover:underline cursor-pointer"
                >
                  {isChangingPassword ? 'Cancel' : 'Change password'}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 outline-none transition"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 outline-none transition"
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E5B55] mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D4D0C5] rounded-lg text-sm text-[#121816] focus:bg-white focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/15 outline-none transition"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 sm:p-6 bg-[#FAF9F6]">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-5 py-2.5 border border-[#D4D0C5] bg-white rounded-lg text-sm font-semibold text-[#121816] hover:bg-[#EFECE5] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0F4C3A] text-[#F7F6F2] rounded-lg text-sm font-semibold hover:bg-[#16634C] disabled:opacity-50 transition cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Account Metadata */}
        <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-bold text-[#121816] mb-3">Account Metadata</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#4E5B55]">Account Created</span>
              <span className="font-mono-data text-xs font-medium text-[#121816]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4E5B55]">Last Updated</span>
              <span className="font-mono-data text-xs font-medium text-[#121816]">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-[#F3C8BF] rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-bold text-[#9A2E1B] mb-1.5">Danger Zone</h2>
          <p className="text-xs sm:text-sm text-[#4E5B55] mb-4">
            Deleting your account permanently removes your profile, orders, reservations, and cart items. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#FDF2F0] text-[#9A2E1B] border border-[#F3C8BF] rounded-lg text-sm font-semibold hover:bg-[#9A2E1B] hover:text-white transition cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ProfilePage;
