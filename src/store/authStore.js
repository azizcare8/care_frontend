import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          // Backend returns: { status: 'success', data: { token, user } }
          // authService.login returns: response.data = { status: 'success', data: { token, user } }
          // So response = { status: 'success', data: { token, user } }
          const token = response?.data?.token || response?.token;
          const user = response?.data?.user || response?.user;
          
          if (!token || !user) {
            console.error('Login response structure:', JSON.stringify(response, null, 2));
            throw new Error('Invalid login response: missing token or user');
          }
          
          // Store token in cookie with proper options
          Cookies.set('token', token, { 
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/' // Ensure cookie is available on all paths
          });

          // Also store in localStorage for environments that block cookies
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
          
          // Also store in state immediately
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          // Verify token is stored (with a small delay to ensure cookie is set)
          setTimeout(() => {
            const storedToken = Cookies.get('token') ||
              (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
            if (!storedToken) {
              // Retry once
              Cookies.set('token', token, { 
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              });
              if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
              }
            }
          }, 100);
          
          return { token, user };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          // Handle both response formats: { data: { token, user } } or { token, user }
          const token = response?.data?.token || response?.token;
          const user = response?.data?.user || response?.user;
          const requiresApproval = response?.requiresApproval || response?.data?.requiresApproval;
          
          // If registration requires admin approval, don't require token
          // Account is created but user cannot login until approved
          if (requiresApproval || (!token && user)) {
            set({
              isLoading: false,
              error: null
            });
            // Return success response with message for pending approval
            return { 
              success: true, 
              user, 
              requiresApproval: true,
              message: response?.message || response?.data?.message || 'Registration successful! Your account is pending admin approval.'
            };
          }
          
          // If token is missing and no user, it's an error
          if (!token || !user) {
            throw new Error('Invalid registration response: missing token or user');
          }
          
          // Store token in cookie
          Cookies.set('token', token, { expires: 7 });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { token, user };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Log error but don't block logout - network errors are handled in authService
          console.warn('Logout API call failed (proceeding with local logout):', error.message);
        } finally {
          // Always clear all auth data, even if API call fails
          Cookies.remove('token');
          localStorage.removeItem('token');
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pendingDonation');
            sessionStorage.removeItem('donorInfo');
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authService.getCurrentUser();
          // Handle both response formats: { data: { user } } or { user } or { data: user }
          const user = response?.data?.data || response?.data?.user || response?.data || response?.user;
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }
          return { user };
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Failed to get user'
          });
          throw error;
        }
      },

      updateUser: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authService.updateDetails(userData);
          set({
            user: response.user,
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Update failed'
          });
          throw error;
        }
      },

      updatePassword: async (passwordData) => {
        set({ isLoading: true });
        try {
          const response = await authService.updatePassword(passwordData);
          set({
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Password update failed'
          });
          throw error;
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const response = await authService.forgotPassword(email);
          set({
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Failed to send reset email'
          });
          throw error;
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.resetPassword(token, password);
          set({
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Password reset failed'
          });
          throw error;
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true });
        try {
          const response = await authService.verifyEmail(token);
          set({
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Email verification failed'
          });
          throw error;
        }
      },

      resendVerification: async () => {
        set({ isLoading: true });
        try {
          const response = await authService.resendVerification();
          set({
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message || 'Failed to resend verification'
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      // Initialize auth state from token
      initializeAuth: async () => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        try {
          const token = Cookies.get('token') ||
            (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
          if (token) {
            set({ token, isAuthenticated: true });
            // Fetch user data to verify token and get user info
            try {
              await get().getCurrentUser();
            } catch (error) {
              // If token is invalid, clear it
              console.warn('Token validation failed:', error);
              Cookies.remove('token');
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
              }
              set({ 
                token: null, 
                isAuthenticated: false, 
                user: null 
              });
            }
          } else {
            // No token, ensure state is cleared
            set({ 
              token: null, 
              isAuthenticated: false, 
              user: null 
            });
          }
        } catch (error) {
          // Silently handle cookie access errors during SSR
          console.warn('Auth initialization error:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // Called when storage is rehydrated
        if (state && typeof window !== 'undefined') {
          state._hasHydrated = true;
          // Ensure token is available to API layer after rehydrate
          if (state.token) {
            const storedToken = Cookies.get('token') || localStorage.getItem('token');
            if (!storedToken) {
              Cookies.set('token', state.token, {
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
              });
              localStorage.setItem('token', state.token);
            }
          }
          // If user exists in storage, verify with server
          if (state.user && state.isAuthenticated) {
            state.getCurrentUser().catch(() => {
              // If verification fails, clear auth
              try {
                Cookies.remove('token');
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('token');
                }
              } catch (error) {
                console.warn('Error removing cookie:', error);
              }
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
            });
          }
        }
      }
    }
  )
);

export default useAuthStore;
