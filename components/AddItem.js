import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { DatabaseService } from '../services/DatabaseService';
import { PhotoService } from '../services/PhotoService';

const { width } = Dimensions.get('window');

const AddItem = ({ onClose, onItemAdded, currentUser }) => {
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [storageLocations, setStorageLocations] = useState([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemPhotoURI, setItemPhotoURI] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Dashboard, 2: Room, 3: Storage Location, 4: Item Details
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states for creating new items
  const [showCreateDashboardModal, setShowCreateDashboardModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showCreateLocationModal, setShowCreateLocationModal] = useState(false);
  
  // Form states for creating new items
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDescription, setNewDashboardDescription] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationDescription, setNewLocationDescription] = useState('');

  useEffect(() => {
    loadDashboards();
  }, []);

  useEffect(() => {
    if (selectedDashboard) {
      loadRooms();
    }
  }, [selectedDashboard]);

  useEffect(() => {
    if (selectedRoom) {
      loadStorageLocations();
    }
  }, [selectedRoom]);

  const loadDashboards = async () => {
    try {
      const dashboardsData = await DatabaseService.getAllDashboards(currentUser?.uid);
      setDashboards(dashboardsData);
    } catch (error) {
      console.error('Error loading dashboards:', error);
      Alert.alert('Error', 'Failed to load dashboards');
    }
  };

  const loadRooms = async () => {
    try {
      const roomsData = await DatabaseService.getAllRooms(selectedDashboard.id, currentUser?.uid);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading rooms:', error);
      Alert.alert('Error', 'Failed to load rooms');
    }
  };

  const loadStorageLocations = async () => {
    try {
      const locationsData = await DatabaseService.getStorageLocationsByRoom(selectedRoom.id, currentUser?.uid);
      setStorageLocations(locationsData);
    } catch (error) {
      console.error('Error loading storage locations:', error);
      Alert.alert('Error', 'Failed to load storage locations');
    }
  };

  const selectDashboard = (dashboard) => {
    setSelectedDashboard(dashboard);
    setSelectedRoom(null);
    setSelectedStorageLocation(null);
    setCurrentStep(2);
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedStorageLocation(null);
    setCurrentStep(3);
  };

  const selectStorageLocation = (location) => {
    setSelectedStorageLocation(location);
    setCurrentStep(4);
  };

  const goBack = () => {
    if (currentStep === 4) {
      setCurrentStep(3);
      setSelectedStorageLocation(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedRoom(null);
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedDashboard(null);
    }
  };

  const takePhoto = async () => {
    try {
      const photoURI = await PhotoService.takePhoto();
      if (photoURI) {
        setItemPhotoURI(photoURI);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const selectPhoto = async () => {
    try {
      const photoURI = await PhotoService.selectFromGallery();
      if (photoURI) {
        setItemPhotoURI(photoURI);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const saveItem = async () => {
    try {
      if (!itemName.trim()) {
        Alert.alert('Error', 'Item name is required');
        return;
      }

      if (!selectedStorageLocation) {
        Alert.alert('Error', 'Please select a storage location');
        return;
      }

      setIsLoading(true);

      const itemData = {
        name: itemName.trim(),
        category: itemCategory.trim() || '',
        description: itemDescription.trim() || '',
        quantity: parseInt(itemQuantity) || 1,
        photoURI: itemPhotoURI || '',
        storageLocationId: selectedStorageLocation.id,
        roomId: selectedRoom.id,
        dashboardId: selectedDashboard.id,
        user_id: currentUser?.uid,
        timestamp: new Date(),
      };

      await DatabaseService.addItem(itemData);
      
      Alert.alert('Success', 'Item added successfully!', [
        { text: 'OK', onPress: () => {
          if (onItemAdded) onItemAdded();
          onClose();
        }}
      ]);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new dashboard
  const createNewDashboard = async () => {
    try {
      if (!newDashboardName.trim()) {
        Alert.alert('Error', 'Dashboard name is required');
        return;
      }

      setIsLoading(true);
      const dashboardId = await DatabaseService.createDashboard(
        newDashboardName.trim(),
        newDashboardDescription.trim(),
        currentUser?.uid
      );

      // Refresh dashboards and select the new one
      await loadDashboards();
      const newDashboard = dashboards.find(d => d.id === dashboardId) || 
                          { id: dashboardId, name: newDashboardName.trim(), description: newDashboardDescription.trim() };
      
      setSelectedDashboard(newDashboard);
      setCurrentStep(2);
      
      // Reset form
      setNewDashboardName('');
      setNewDashboardDescription('');
      setShowCreateDashboardModal(false);
      
      Alert.alert('Success', 'Dashboard created successfully!');
    } catch (error) {
      console.error('Error creating dashboard:', error);
      Alert.alert('Error', 'Failed to create dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new room
  const createNewRoom = async () => {
    try {
      if (!newRoomName.trim()) {
        Alert.alert('Error', 'Room name is required');
        return;
      }

      if (!selectedDashboard) {
        Alert.alert('Error', 'Please select a dashboard first');
        return;
      }

      setIsLoading(true);
      const roomId = await DatabaseService.createRoom(
        newRoomName.trim(),
        newRoomDescription.trim(),
        selectedDashboard.id,
        currentUser?.uid
      );

      // Refresh rooms and select the new one
      await loadRooms();
      const newRoom = rooms.find(r => r.id === roomId) || 
                     { id: roomId, name: newRoomName.trim(), description: newRoomDescription.trim() };
      
      setSelectedRoom(newRoom);
      setCurrentStep(3);
      
      // Reset form
      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateRoomModal(false);
      
      Alert.alert('Success', 'Room created successfully!');
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new storage location
  const createNewLocation = async () => {
    try {
      if (!newLocationName.trim()) {
        Alert.alert('Error', 'Storage location name is required');
        return;
      }

      if (!selectedRoom) {
        Alert.alert('Error', 'Please select a room first');
        return;
      }

      setIsLoading(true);
      const locationId = await DatabaseService.createStorageLocation(
        newLocationName.trim(),
        newLocationDescription.trim(),
        '', // photoURI
        selectedRoom.id,
        currentUser?.uid
      );

      // Refresh storage locations and select the new one
      await loadStorageLocations();
      const newLocation = storageLocations.find(l => l.id === locationId) || 
                         { id: locationId, name: newLocationName.trim(), description: newLocationDescription.trim() };
      
      setSelectedStorageLocation(newLocation);
      setCurrentStep(4);
      
      // Reset form
      setNewLocationName('');
      setNewLocationDescription('');
      setShowCreateLocationModal(false);
      
      Alert.alert('Success', 'Storage location created successfully!');
    } catch (error) {
      console.error('Error creating storage location:', error);
      Alert.alert('Error', 'Failed to create storage location');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.step, currentStep >= 1 && styles.activeStep]}>
        <Text style={[styles.stepText, currentStep >= 1 && styles.activeStepText]}>1</Text>
      </View>
      <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
      <View style={[styles.step, currentStep >= 2 && styles.activeStep]}>
        <Text style={[styles.stepText, currentStep >= 2 && styles.activeStepText]}>2</Text>
      </View>
      <View style={[styles.stepLine, currentStep >= 3 && styles.activeStepLine]} />
      <View style={[styles.step, currentStep >= 3 && styles.activeStep]}>
        <Text style={[styles.stepText, currentStep >= 3 && styles.activeStepText]}>3</Text>
      </View>
      <View style={[styles.stepLine, currentStep >= 4 && styles.activeStepLine]} />
      <View style={[styles.step, currentStep >= 4 && styles.activeStep]}>
        <Text style={[styles.stepText, currentStep >= 4 && styles.activeStepText]}>4</Text>
      </View>
    </View>
  );

  const renderDashboardSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Dashboard</Text>
      <Text style={styles.stepSubtitle}>Choose where to organize your items</Text>
      
      <View style={styles.selectionContainer}>
        <ScrollView 
          style={styles.selectionGrid} 
          contentContainerStyle={styles.selectionGridContent} 
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {dashboards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="grid-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No dashboards yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first dashboard to get started</Text>
            </View>
          ) : (
            dashboards.map((dashboard) => (
              <TouchableOpacity
                key={dashboard.id}
                style={styles.selectionCard}
                onPress={() => selectDashboard(dashboard)}
              >
                <View style={styles.selectionIconContainer}>
                  <Ionicons name="grid" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.selectionName}>{dashboard.name}</Text>
                {dashboard.description && (
                  <Text style={styles.selectionDescription} numberOfLines={2}>
                    {dashboard.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
          
          {/* Create New Dashboard Option */}
          <TouchableOpacity
            style={[styles.selectionCard, styles.createNewCard]}
            onPress={() => setShowCreateDashboardModal(true)}
          >
            <View style={styles.selectionIconContainer}>
              <Ionicons name="add-circle" size={32} color={Colors.success} />
            </View>
            <Text style={styles.selectionName}>Create New Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderRoomSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Room</Text>
      <Text style={styles.stepSubtitle}>
        Choose a room in {selectedDashboard?.name}
      </Text>
      
      <View style={styles.selectionContainer}>
        <ScrollView 
          style={styles.selectionGrid} 
          contentContainerStyle={styles.selectionGridContent} 
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.selectionCard}
              onPress={() => selectRoom(room)}
            >
              <View style={styles.selectionIconContainer}>
                <Ionicons name="home" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.selectionName}>{room.name}</Text>
              {room.description && (
                <Text style={styles.selectionDescription} numberOfLines={2}>
                  {room.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          
          {/* Create New Room Option */}
          <TouchableOpacity
            style={[styles.selectionCard, styles.createNewCard]}
            onPress={() => setShowCreateRoomModal(true)}
          >
            <View style={styles.selectionIconContainer}>
              <Ionicons name="add-circle" size={32} color={Colors.success} />
            </View>
            <Text style={styles.selectionName}>Create New Room</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderStorageLocationSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Storage Location</Text>
      <Text style={styles.stepSubtitle}>
        Choose where in {selectedRoom?.name} to store the item
      </Text>
      
      <View style={styles.selectionContainer}>
        <ScrollView 
          style={styles.selectionGrid} 
          contentContainerStyle={styles.selectionGridContent} 
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {storageLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.selectionCard}
              onPress={() => selectStorageLocation(location)}
            >
              <View style={styles.selectionIconContainer}>
                <Ionicons name="cube" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.selectionName}>{location.name}</Text>
              {location.description && (
                <Text style={styles.selectionDescription} numberOfLines={2}>
                  {location.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          
          {/* Create New Storage Location Option */}
          <TouchableOpacity
            style={[styles.selectionCard, styles.createNewCard]}
            onPress={() => setShowCreateLocationModal(true)}
          >
            <View style={styles.selectionIconContainer}>
              <Ionicons name="add-circle" size={32} color={Colors.success} />
            </View>
            <Text style={styles.selectionName}>Create New Location</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderItemDetails = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Item Details</Text>
      <Text style={styles.stepSubtitle}>
        Add details for your item in {selectedStorageLocation?.name}
      </Text>
      
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.input}
          placeholder="Item Name *"
          value={itemName}
          onChangeText={setItemName}
          placeholderTextColor={Colors.textLight}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Category (optional)"
          value={itemCategory}
          onChangeText={setItemCategory}
          placeholderTextColor={Colors.textLight}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={itemDescription}
          onChangeText={setItemDescription}
          placeholderTextColor={Colors.textLight}
          multiline
          numberOfLines={3}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={itemQuantity}
          onChangeText={setItemQuantity}
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
        />

        {/* Photo Section */}
        <View style={styles.photoSection}>
          <Text style={styles.photoSectionTitle}>Item Photo (optional)</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={20} color={Colors.primary} />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.photoButton}
              onPress={selectPhoto}
            >
              <Ionicons name="images" size={20} color={Colors.primary} />
              <Text style={styles.photoButtonText}>Select Photo</Text>
            </TouchableOpacity>
          </View>
          
          {itemPhotoURI && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: itemPhotoURI }} style={styles.photoPreviewImage} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setItemPhotoURI('')}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={saveItem}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Item'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderDashboardSelection();
      case 2:
        return renderRoomSelection();
      case 3:
        return renderStorageLocationSelection();
      case 4:
        return renderItemDetails();
      default:
        return renderDashboardSelection();
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Item</Text>
          <View style={styles.placeholder} />
        </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Back Button */}
      {currentStep > 1 && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}

              {/* Step Content */}
        {renderCurrentStep()}
      </View>
      
      {/* Create New Dashboard Modal */}
      <Modal
        visible={showCreateDashboardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateDashboardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Dashboard</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowCreateDashboardModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Dashboard Name *"
              value={newDashboardName}
              onChangeText={setNewDashboardName}
              placeholderTextColor={Colors.textLight}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newDashboardDescription}
              onChangeText={setNewDashboardDescription}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateDashboardModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={createNewDashboard}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Creating...' : 'Create Dashboard'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create New Room Modal */}
      <Modal
        visible={showCreateRoomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateRoomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Room</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowCreateRoomModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Room Name *"
              value={newRoomName}
              onChangeText={setNewRoomName}
              placeholderTextColor={Colors.textLight}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newRoomDescription}
              onChangeText={setNewRoomDescription}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateRoomModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={createNewRoom}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Creating...' : 'Create Room'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create New Storage Location Modal */}
      <Modal
        visible={showCreateLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Storage Location</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowCreateLocationModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Location Name *"
              value={newLocationName}
              onChangeText={setNewLocationName}
              placeholderTextColor={Colors.textLight}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newLocationDescription}
              onChangeText={setNewLocationDescription}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateLocationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={createNewLocation}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Creating...' : 'Create Location'}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    padding: 20,
    zIndex: 1001,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#333',
  },
  placeholder: {
    width: 50, // Adjust as needed for spacing
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    alignItems: 'center',
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  activeStep: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepText: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: '#fff',
  },
  stepLine: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
  },
  activeStepLine: {
    backgroundColor: Colors.primary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  backButtonText: {
    marginLeft: 5,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  selectionContainer: {
    flex: 1,
    marginTop: 10,
  },
  selectionGrid: {
    flex: 1,
  },
  selectionGridContent: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  selectionCard: {
    width: '48%', // Adjust as needed for two columns
    aspectRatio: 1.2, // Make cards slightly taller
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  selectionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    paddingTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  photoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.buttonPrimary + '10',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.buttonPrimary,
  },
  photoButtonText: {
    marginLeft: 5,
    color: Colors.buttonPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: Colors.success,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Create New Card Styles
  createNewCard: {
    borderColor: Colors.success,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: Colors.success + '10',
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 2000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AddItem;
