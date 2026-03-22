/**
 * Unit Tests for Authentication Context
 * Tests auth provider initialization and user state management
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';
import { auth } from '../../config/firebase.js';

// Mock Firebase
jest.mock('../../config/firebase.js', () => ({
  auth: {
    currentUser: null
  }
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  updateProfile: jest.fn()
}));

// Test component that uses auth context
const TestComponent = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="user-status">
        {currentUser ? 'Logged In' : 'Logged Out'}
      </div>
    </div>
  );
};

describe('AuthContext', () => {
  test('should render AuthProvider without crashing', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );
    
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('should provide auth context to children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged Out');
    });
  });

  test('should provide currentUser as null initially', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const userStatus = screen.getByTestId('user-status');
      expect(userStatus).toHaveTextContent('Logged Out');
    });
  });

  test('should initialize with loading state as false after mount', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
