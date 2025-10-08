import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DatabaseService } from './services/DatabaseService';
import AuthService from './services/AuthService';
import AuthNavigator from './components/AuthNavigator';
import InventoryList from './components/InventoryList';
import AddItem from './components/AddItem';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TabNavigator from './components/TabNavigator';
import Colors from './constants/Colors';

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>Initializing Smart Inventory...</Text>
  </View>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showAddItem, setShowAddItem] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [preSelectedLocation, setPreSelectedLocation] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Firebase
      await DatabaseService.initDatabase();
      console.log('Firebase initialized successfully');
      
      // Set up auth state listener
      const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
        if (user) {
          // User is signed in
          console.log('User authenticated:', user.uid);
          setIsAuthenticated(true);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          
          // Create default data for new users
          await createDefaultDataIfNeeded(user.uid);
        } else {
          // User is signed out
          console.log('User signed out');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
        setIsLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsLoading(false);
    }
  };

  const createDefaultDataIfNeeded = async (userId) => {
    try {
      // Check if user already has dashboards
      const existingDashboards = await DatabaseService.getAllDashboards(userId);
      
      if (existingDashboards.length === 0) {
        console.log('Creating minimal default data for new user');
        
        // Create only one simple dashboard: "Home"
        const homeDashboardId = await DatabaseService.createDashboard('Home', 'Main residence', userId);
        
        // Create only one simple room: "Bedroom"
        const bedroomRoomId = await DatabaseService.createRoom('Bedroom', 'Master bedroom', homeDashboardId, userId);
        
        // Create only one simple storage location: "Bed Shelf"
        await DatabaseService.createStorageLocation('Bed Shelf', 'Storage shelf near the bed', '', bedroomRoomId, userId);
        
        console.log('Minimal default data created successfully');
      }
    } catch (error) {
      console.error('Error creating default data:', error);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleAddItem = (locationName = null) => {
    // If locationName is an object (from Dashboard), extract the name
    const locationNameString = typeof locationName === 'object' && locationName !== null 
      ? locationName.name 
      : locationName;
    setPreSelectedLocation(locationNameString);
    setShowAddItem(true);
  };

  const handleBackToHome = () => {
    setShowAddItem(false);
    setPreSelectedLocation(null);
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleItemAdded = () => {
    triggerRefresh();
    setShowAddItem(false);
    setPreSelectedLocation(null);
  };

  const handleAuthenticationSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveTab('home');
      setShowAddItem(false);
      setPreSelectedLocation(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthNavigator onAuthenticationSuccess={handleAuthenticationSuccess} />
      </GestureHandlerRootView>
    );
  }

  // Show AddItem screen when needed
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TabNavigator 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        currentUser={currentUser}
      >
        {activeTab === 'home' && (
          <InventoryList onAddItem={handleAddItem} onRefresh={triggerRefresh} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard key={refreshKey} onRefresh={triggerRefresh} onAddItem={handleAddItem} currentUser={currentUser} />
        )}
        {activeTab === 'profile' && (
          <Profile currentUser={currentUser} onLogout={handleLogout} />
        )}
      </TabNavigator>
      
      {/* Render AddItem as a modal overlay */}
      {showAddItem && (
        <AddItem
          onClose={() => setShowAddItem(false)}
          onItemAdded={handleItemAdded}
          currentUser={currentUser}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});
