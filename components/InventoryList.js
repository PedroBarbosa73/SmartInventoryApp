import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { DatabaseService } from '../services/DatabaseService';
import Colors from '../constants/Colors';

export default function InventoryList({ onAddItem, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search by name or category
      const results = await DatabaseService.searchItemsByNameOrCategory(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search items');
    } finally {
      setIsSearching(false);
    }
  };

  const deleteItem = async (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteItem(id);
              // Refresh search results
              handleSearch();
              // Trigger refresh across all tabs
              if (onRefresh) {
                onRefresh();
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const viewLocationItems = async (locationPhotoURI) => {
    try {
      const items = await DatabaseService.searchItemsByLocation(locationPhotoURI);
      if (items.length > 0) {
        Alert.alert(
          'Items in this location',
          `Found ${items.length} item(s) stored here:\n\n${items.map(item => `• ${item.name}`).join('\n')}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No items found', 'No other items are stored in this location.');
      }
    } catch (error) {
      console.error('Error fetching location items:', error);
      Alert.alert('Error', 'Failed to fetch location items');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Smart Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddItem}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView 
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollableContentContainer}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Search Items</Text>
          <Text style={styles.searchSubtitle}>Find everything without searching for it</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or category..."
              placeholderTextColor="#999"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>
                Found {searchResults.length} item(s)
              </Text>
              <View style={styles.resultsList}>
                {searchResults.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      {item.itemPhotoURI ? (
                        <Image
                          source={{ uri: item.itemPhotoURI }}
                          style={styles.itemThumbnail}
                          onError={() => console.log('Failed to load item image')}
                        />
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Text style={styles.photoPlaceholderText}>📦</Text>
                        </View>
                      )}
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.category && (
                          <Text style={styles.itemCategory}>{item.category}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteItem(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.locationSection}>
                      <Text style={styles.locationLabel}>Location:</Text>
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>
                          📍 {item.locationName || 'Unknown Location'}
                        </Text>
                        {item.roomName && (
                          <Text style={styles.roomName}>
                            🏠 {item.roomName}
                          </Text>
                        )}
                        {item.dashboardName && (
                          <Text style={styles.dashboardName}>
                            🏢 {item.dashboardName}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No items found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try searching with different terms or add a new item
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
            backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.buttonPrimary,
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
            backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollableContentContainer: {
    flexGrow: 1,
  },
  searchSection: {
    padding: 20,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  searchButton: {
    padding: 10,
  },
  searchButtonText: {
    fontSize: 24,
  },
  resultsContainer: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultsList: {
    width: '100%',
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  locationSection: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  locationInfo: {
    alignItems: 'flex-start',
  },
  locationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  dashboardName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    marginTop: 20,
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  photoPlaceholderText: {
    fontSize: 24,
    color: '#999',
  },
});
