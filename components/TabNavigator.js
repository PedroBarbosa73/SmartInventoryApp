import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const TabNavigator = ({ activeTab, onTabChange, onLogout, currentUser, children }) => {
  const tabs = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      activeIcon: 'home'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'bar-chart',
      activeIcon: 'bar-chart'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person',
      activeIcon: 'person'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabChange(tab.id)}
            >
              <Ionicons
                name={activeTab === tab.id ? tab.activeIcon : tab.icon}
                size={24}
                color={activeTab === tab.id ? Colors.primary : Colors.textSecondary}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabTitle,
                  activeTab === tab.id && styles.activeTabTitle
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Navigation Dots */}
        <View style={styles.dotsContainer}>
          {tabs.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === tabs.findIndex(tab => tab.id === activeTab) && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 6,
    minWidth: 70,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabTitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabTitle: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default TabNavigator;
