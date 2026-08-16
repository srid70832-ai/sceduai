import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Student, Teacher, Administrator, UserRole } from '../types';
import { api } from '../lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: Profile | null;
  student: Student | null;
  teacher: Teacher | null;
  admin: Administrator | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  saveOnboarding: (data: any) => Promise<void>;
  quickSwitchRole?: (role: UserRole) => Promise<void>;
  loadDemoData?: (role?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('edusense_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setStudent(data.student || null);
      setTeacher(data.teacher || null);
      setAdmin(data.admin || null);
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      localStorage.removeItem('edusense_token');
      setToken(null);
      setUser(null);
      setStudent(null);
      setTeacher(null);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('edusense_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStudent(data.student || null);
      setTeacher(data.teacher || null);
      setAdmin(data.admin || null);
      showToast(`Welcome back, ${data.user.full_name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);
      localStorage.setItem('edusense_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStudent(data.student || null);
      setTeacher(data.teacher || null);
      showToast(`Account successfully registered as ${data.user.role}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('edusense_token');
    setToken(null);
    setUser(null);
    setStudent(null);
    setTeacher(null);
    setAdmin(null);
    showToast('Signed out of SC EduSense AI.', 'info');
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateProfile = async (profileData: any) => {
    setIsLoading(true);
    try {
      const result = await api.updateProfile(profileData);
      if (result && result.user) {
        setUser(result.user);
        if (result.student) setStudent(result.student);
        if (result.teacher) setTeacher(result.teacher);
      } else if (result) {
        setUser(result as any);
      }
      await fetchCurrentUser();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboarding = async (onboardingData: any) => {
    setIsLoading(true);
    try {
      const data = await api.saveOnboarding(onboardingData);
      setUser(data.user);
      if (data.student) setStudent(data.student);
      if (data.teacher) setTeacher(data.teacher);
      if (data.admin) setAdmin(data.admin);
      showToast('Onboarding preferences saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save onboarding preferences.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const data = await api.quickSwitch(role);
      localStorage.setItem('edusense_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStudent(data.student || null);
      setTeacher(data.teacher || null);
      setAdmin(data.admin || null);
      showToast(`Switched active view to ${role} (${data.user.full_name})`, 'success');
    } catch (err: any) {
      showToast(err.message || `No ${role} profile found in database.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        teacher,
        admin,
        token,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        saveOnboarding,
        quickSwitchRole,
        loadDemoData: async (targetRole?: string) => {
          if (targetRole && (targetRole === 'STUDENT' || targetRole === 'TEACHER' || targetRole === 'ADMIN')) {
            await quickSwitchRole(targetRole as UserRole);
          } else {
            await refreshUser();
          }
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
