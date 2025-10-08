import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { DatabaseService } from '../services/DatabaseService';

const { width } = Dimensions.get('window');

const Room = ({ room, onAddItem, onRefresh, currentUser, onBack }) => {
  const [storageLocations, setStorageLocations] = useState([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for viewing items in a storage location
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationItems, setLocationItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    loadStorageLocations();
  }, [room.id]);

  const loadStorageLocations = async () => {
    try {
      setIsLoading(true);
      const locations = await DatabaseService.getStorageLocationsByRoom(room.id, currentUser?.uid);
      setStorageLocations(locations);
    } catch (error) {
      console.error('Error loading storage locations:', error);
      Alert.alert('Error', 'Failed to load storage locations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationItems = async (locationId) => {
    try {
      setIsLoadingItems(true);
      const items = await DatabaseService.getItemsByStorageLocation(locationId, currentUser?.uid);
      setLocationItems(items);
    } catch (error) {
      console.error('Error loading location items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const openLocationModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationName(location.name);
      setLocationDescription(location.description || '');
    } else {
      setEditingLocation(null);
      setLocationName('');
      setLocationDescription('');
    }
    setLocationModalVisible(true);
  };

  const closeLocationModal = () => {
    setLocationModalVisible(false);
    setEditingLocation(null);
    setLocationName('');
    setLocationDescription('');
  };

  const saveLocation = async () => {
    try {
      if (!locationName.trim()) {
        Alert.alert('Error', 'Location name is required');
        return;
      }

      if (editingLocation) {
        await DatabaseService.updateStorageLocation(
          editingLocation.id,
          locationName,
          locationDescription,
          '',
          room.id
        );
      } else {
        await DatabaseService.createStorageLocation(
          locationName,
          locationDescription,
          '',
          room.id,
          currentUser?.uid
        );
      }

      closeLocationModal();
      loadStorageLocations();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving storage location:', error);
      Alert.alert('Error', 'Failed to save storage location');
    }
  };

  const deleteLocation = async (location) => {
    Alert.alert(
      'Delete Storage Location',
      `Are you sure you want to delete "${location.name}"? This will also delete all items stored here.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteStorageLocation(location.id);
              loadStorageLocations();
              if (onRefresh) onRefresh();
            } catch (error) {
              console.error('Error deleting storage location:', error);
              Alert.alert('Error', 'Failed to delete storage location');
            }
          },
        },
      ]
    );
  };

  const viewLocationItems = async (location) => {
    setSelectedLocation(location);
    await loadLocationItems(location.id);
  };

  const closeLocationItems = () => {
    setSelectedLocation(null);
    setLocationItems([]);
  };

  const renderStorageLocation = (location) => (
    <TouchableOpacity
      key={location.id}
      style={styles.locationCard}
      onPress={() => viewLocationItems(location)}
    >
      <View style={styles.locationIconContainer}>
        <Ionicons name="cube" size={24} color={Colors.primary} />
      </View>
      <Text style={styles.locationName} numberOfLines={2}>
        {location.name}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteLocation(location)}
      >
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Room Header */}
      <View style={styles.roomHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{room.name}</Text>
          {room.description && (
            <Text style={styles.roomDescription}>{room.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addLocationButton}
          onPress={() => openLocationModal()}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Storage Locations Grid */}
      <ScrollView style={styles.locationsGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.locationsGridContent}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading storage locations...</Text>
          ) : storageLocations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No storage locations yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap the + button to add one</Text>
            </View>
          ) : (
            storageLocations.map(renderStorageLocation)
          )}
        </View>
      </ScrollView>

      {/* Items in Selected Storage Location */}
      {selectedLocation && (
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>
              Items in {selectedLocation.name}
            </Text>
            <View style={styles.itemsHeaderButtons}>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => onAddItem(selectedLocation.name)}
              >
                <Ionicons name="add-circle" size={20} color={Colors.success} />
                <Text style={styles.addItemButtonText}>Add Item</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeItemsButton}
                onPress={closeLocationItems}
              >
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
            {isLoadingItems ? (
              <Text style={styles.loadingText}>Loading items...</Text>
            ) : locationItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="box-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>No items in this location</Text>
                <Text style={styles.emptyStateSubtext}>Tap "Add Item" to add something</Text>
              </View>
            ) : (
              locationItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.category && (
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    )}
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Add/Edit Storage Location Modal */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeLocationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLocation ? 'Edit Storage Location' : 'New Storage Location'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeLocationModal}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Storage Location Name"
              value={locationName}
              onChangeText={setLocationName}
              placeholderTextColor={Colors.textLight}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={locationDescription}
              onChangeText={setLocationDescription}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeLocationModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveLocation}
              >
                <Text style={styles.saveButtonText}>
                  {editingLocation ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addLocationButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  locationsGrid: {
    flex: 1,
  },
  locationsGridContent: {
    padding: 20,
  },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  locationIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    marginBottom: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: Colors.buttonSecondary,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Items View Styles
  itemsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    margin: 20,
    marginTop: 0,
    padding: 20,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  itemsHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  addItemButtonText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  closeItemsButton: {
    padding: 4,
  },
  itemsList: {
    maxHeight: 300,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  itemCategory: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
});

export default Room;
