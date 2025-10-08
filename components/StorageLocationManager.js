import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { DatabaseService } from '../services/DatabaseService';
import { PhotoService } from '../services/PhotoService';
import Colors from '../constants/Colors';

export default function StorageLocationManager({ visible, onClose, onRefresh }) {
  const [storageLocations, setStorageLocations] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [locationPhotoURI, setLocationPhotoURI] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadStorageLocations();
    }
  }, [visible]);

  const loadStorageLocations = async () => {
    try {
      const result = await DatabaseService.getAllStorageLocations();
      setStorageLocations(result);
    } catch (error) {
      console.error('Error loading storage locations:', error);
    }
  };

  const openCreateModal = () => {
    setEditingLocation(null);
    setLocationName('');
    setLocationDescription('');
    setLocationPhotoURI('');
    setCreateModalVisible(true);
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setLocationName(location.name);
    setLocationDescription(location.description || '');
    setLocationPhotoURI(location.photoURI || '');
    setCreateModalVisible(true);
  };

  const closeModal = () => {
    setCreateModalVisible(false);
    setEditingLocation(null);
    setLocationName('');
    setLocationDescription('');
    setLocationPhotoURI('');
  };

  const takeLocationPhoto = async () => {
    try {
      const photo = await PhotoService.takePhoto();
      if (photo) {
        setLocationPhotoURI(photo);
      } else {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const selectLocationPhoto = async () => {
    try {
      const photo = await PhotoService.selectFromGallery();
      if (photo) {
        setLocationPhotoURI(photo);
      } else {
        Alert.alert('Permission Denied', 'Photo library permission is required to select photos');
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const saveLocation = async () => {
    if (!locationName.trim()) {
      Alert.alert('Error', 'Location name is required');
      return;
    }

    setIsLoading(true);
    try {
      if (editingLocation) {
        await DatabaseService.updateStorageLocation(
          editingLocation.id,
          locationName.trim(),
          locationDescription.trim(),
          locationPhotoURI || '',
          editingLocation.dashboard_id || 1
        );
        Alert.alert('Success', 'Storage location updated successfully');
      } else {
        await DatabaseService.createStorageLocation(
          locationName.trim(),
          locationDescription.trim(),
          locationPhotoURI || '',
          1 // Default to Home dashboard
        );
        Alert.alert('Success', 'Storage location created successfully');
      }
      
      closeModal();
      loadStorageLocations();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving storage location:', error);
      Alert.alert('Error', 'Failed to save storage location');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocation = async (location) => {
    if (location.id === 1) {
      Alert.alert('Error', 'Cannot delete the default storage location');
      return;
    }

    Alert.alert(
      'Delete Storage Location',
      `Are you sure you want to delete "${location.name}"? All items in this location will be moved to "General Storage".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteStorageLocation(location.id);
              Alert.alert('Success', 'Storage location deleted successfully');
              loadStorageLocations();
              if (onRefresh) {
                onRefresh();
              }
            } catch (error) {
              console.error('Error deleting storage location:', error);
              Alert.alert('Error', 'Failed to delete storage location');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Main Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Manage Storage Locations</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={styles.addButton} 
                  onPress={openCreateModal}
                  accessibilityLabel="Add new storage location"
                  accessibilityHint="Create a new storage location for organizing items"
                >
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={onClose}
                  accessibilityLabel="Close storage location manager"
                  accessibilityHint="Close the storage location management screen"
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.content}>
              {storageLocations.map((location) => (
                <View key={location.id} style={styles.locationCard}>
                  <View style={styles.locationInfo}>
                    {location.photoURI ? (
                      <Image source={{ uri: location.photoURI }} style={styles.locationPhoto} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>📁</Text>
                      </View>
                    )}
                    <View style={styles.locationDetails}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      {location.description && (
                        <Text style={styles.locationDescription}>{location.description}</Text>
                      )}
                      <Text style={styles.locationDate}>
                        Created: {new Date(location.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.locationActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(location)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    {location.id !== 1 && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteLocation(location)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLocation ? 'Edit Storage Location' : 'New Storage Location'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Location Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={locationName}
                  onChangeText={setLocationName}
                  placeholder="e.g., Bedside Table, Kitchen Drawer"
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.textInput}
                  value={locationDescription}
                  onChangeText={setLocationDescription}
                  placeholder="Optional description"
                  multiline
                />
              </View>

              {/* Photo */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Photo (Optional)</Text>
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoButton} onPress={takeLocationPhoto}>
                    <Text style={styles.photoButtonText}>📷 Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoButton} onPress={selectLocationPhoto}>
                    <Text style={styles.photoButtonText}>🖼️ Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.photoButton, styles.skipButton]} 
                    onPress={() => setLocationPhotoURI('')}
                  >
                    <Text style={styles.skipButtonText}>⏭️ Skip</Text>
                  </TouchableOpacity>
                </View>
                {locationPhotoURI && (
                  <View style={styles.photoPreview}>
                    <Image source={{ uri: locationPhotoURI }} style={styles.selectedPhoto} />
                    <TouchableOpacity 
                      style={styles.removePhotoButton} 
                      onPress={() => setLocationPhotoURI('')}
                    >
                      <Text style={styles.removePhotoButtonText}>✕ Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
                onPress={saveLocation}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : (editingLocation ? 'Update' : 'Create')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#555',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  locationCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  locationPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  photoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  photoPlaceholderText: {
    fontSize: 24,
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationDate: {
    fontSize: 12,
    color: '#999',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  editButtonText: {
    color: Colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseButtonText: {
    fontSize: 24,
    color: '#555',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    overflow: 'hidden',
  },
  modalFooter: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#e0e0e0',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#555',
  },
  photoPreview: {
    position: 'relative',
    marginTop: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff4444',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removePhotoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
