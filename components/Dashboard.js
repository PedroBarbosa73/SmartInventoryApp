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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { DatabaseService } from '../services/DatabaseService';
import { PhotoService } from '../services/PhotoService';
import Room from './Room';

const { width } = Dimensions.get('window');

const Dashboard = ({ onRefresh, onAddItem, currentUser }) => {
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [dashboardModalVisible, setDashboardModalVisible] = useState(false);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState(null);
  const [contextMenuType, setContextMenuType] = useState('');

  useEffect(() => {
    loadDashboards();
  }, []);

  useEffect(() => {
    if (selectedDashboard) {
      loadRooms();
    }
  }, [selectedDashboard]);

  const loadDashboards = async () => {
    try {
      const dashboardsData = await DatabaseService.getAllDashboards(currentUser?.uid);
      setDashboards(dashboardsData);
      
      // Auto-select first dashboard if none selected
      if (dashboardsData.length > 0 && !selectedDashboard) {
        setSelectedDashboard(dashboardsData[0]);
      }
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

  const selectDashboard = (dashboard) => {
    setSelectedDashboard(dashboard);
  };

  const openDashboardModal = (dashboard = null) => {
    if (dashboard) {
      setEditingDashboard(dashboard);
      setDashboardName(dashboard.name);
      setDashboardDescription(dashboard.description || '');
    } else {
      setEditingDashboard(null);
      setDashboardName('');
      setDashboardDescription('');
    }
    setDashboardModalVisible(true);
  };

  const closeDashboardModal = () => {
    setDashboardModalVisible(false);
    setEditingDashboard(null);
    setDashboardName('');
    setDashboardDescription('');
  };

  const saveDashboard = async () => {
    try {
      if (!dashboardName.trim()) {
        Alert.alert('Error', 'Dashboard name is required');
        return;
      }

      if (editingDashboard) {
        await DatabaseService.updateDashboard(
          editingDashboard.id,
          dashboardName,
          dashboardDescription
        );
      } else {
        await DatabaseService.createDashboard(
          dashboardName,
          dashboardDescription,
          currentUser?.uid
        );
      }

      closeDashboardModal();
      loadDashboards();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving dashboard:', error);
      Alert.alert('Error', 'Failed to save dashboard');
    }
  };

  const deleteDashboard = async (dashboard) => {
    Alert.alert(
      'Delete Dashboard',
      `Are you sure you want to delete "${dashboard.name}"? This will also delete all rooms and storage locations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteDashboard(dashboard.id);
              loadDashboards();
              if (onRefresh) onRefresh();
            } catch (error) {
              console.error('Error deleting dashboard:', error);
              Alert.alert('Error', 'Failed to delete dashboard');
            }
          },
        },
      ]
    );
  };

  const openRoomModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomName(room.name);
      setRoomDescription(room.description || '');
    } else {
      setEditingRoom(null);
      setRoomName('');
      setRoomDescription('');
    }
    setRoomModalVisible(true);
  };

  const closeRoomModal = () => {
    setRoomModalVisible(false);
    setEditingRoom(null);
    setRoomName('');
    setRoomDescription('');
  };

  const saveRoom = async () => {
    try {
      if (!roomName.trim()) {
        Alert.alert('Error', 'Room name is required');
        return;
      }

      if (editingRoom) {
        await DatabaseService.updateRoom(
          editingRoom.id,
          roomName,
          roomDescription
        );
      } else {
        await DatabaseService.createRoom(
          roomName,
          roomDescription,
          selectedDashboard.id,
          currentUser?.uid
        );
      }

      closeRoomModal();
      loadRooms();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving room:', error);
      Alert.alert('Error', 'Failed to save room');
    }
  };

  const deleteRoom = async (room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.name}"? This will also delete all storage locations and items.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteRoom(room.id);
              loadRooms();
              if (onRefresh) onRefresh();
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Error', 'Failed to delete room');
            }
          },
        },
      ]
    );
  };

  const showContextMenu = (event, target, type) => {
    const { pageX, pageY } = event.nativeEvent;
    setContextMenuPosition({ x: pageX, y: pageY });
    setContextMenuTarget(target);
    setContextMenuType(type);
    setContextMenuVisible(true);
  };

  const hideContextMenu = () => {
    setContextMenuVisible(false);
    setContextMenuTarget(null);
    setContextMenuType('');
  };

  const renderDashboardItem = (dashboard) => (
    <TouchableOpacity
      key={dashboard.id}
      style={[
        styles.dashboardCircle,
        selectedDashboard?.id === dashboard.id && styles.selectedDashboard
      ]}
      onPress={() => selectDashboard(dashboard)}
      onLongPress={(event) => showContextMenu(event, dashboard, 'dashboard')}
    >
      <Text style={[
        styles.dashboardText,
        selectedDashboard?.id === dashboard.id && styles.selectedDashboardText
      ]}>
        {dashboard.name}
      </Text>
    </TouchableOpacity>
  );

  const renderRoomItem = (room) => (
    <TouchableOpacity
      key={room.id}
      style={styles.roomCard}
      onPress={() => setSelectedDashboard({ ...selectedDashboard, selectedRoom: room })}
      onLongPress={(event) => showContextMenu(event, room, 'room')}
    >
      <View style={styles.roomIconContainer}>
        <Ionicons name="home" size={24} color={Colors.primary} />
      </View>
      <Text style={styles.roomName} numberOfLines={2}>
        {room.name}
      </Text>
      {room.description && (
        <Text style={styles.roomDescription} numberOfLines={1}>
          {room.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  // If a room is selected, show the Room component
  if (selectedDashboard?.selectedRoom) {
    return (
      <Room
        room={selectedDashboard.selectedRoom}
        onAddItem={onAddItem}
        onRefresh={() => {
          loadRooms();
          if (onRefresh) onRefresh();
        }}
        currentUser={currentUser}
        onBack={() => setSelectedDashboard({ ...selectedDashboard, selectedRoom: null })}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboards</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openDashboardModal()}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Dashboard Selector */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.dashboardSelector}
        contentContainerStyle={styles.dashboardSelectorContent}
      >
        <View style={styles.dashboardCirclesContainer}>
          {dashboards.map(renderDashboardItem)}
        </View>
      </ScrollView>

      {/* Rooms */}
      {selectedDashboard && (
        <View style={styles.roomsContainer}>
          <View style={styles.roomsHeader}>
            <Text style={styles.roomsTitle}>
              {selectedDashboard.name} - Rooms
            </Text>
            <TouchableOpacity
              style={styles.addRoomButton}
              onPress={() => openRoomModal()}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.roomsGrid} showsVerticalScrollIndicator={false}>
            <View style={styles.roomsGridContent}>
              {rooms.map(renderRoomItem)}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Dashboard Modal */}
      <Modal
        visible={dashboardModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDashboardModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingDashboard ? 'Edit Dashboard' : 'New Dashboard'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Dashboard Name"
              value={dashboardName}
              onChangeText={setDashboardName}
              placeholderTextColor={Colors.textLight}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={dashboardDescription}
              onChangeText={setDashboardDescription}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeDashboardModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveDashboard}
              >
                <Text style={styles.saveButtonText}>
                  {editingDashboard ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Room Modal */}
      <Modal
        visible={roomModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRoomModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingRoom ? 'Edit Room' : 'New Room'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Room Name"
              value={roomName}
              onChangeText={setRoomName}
              placeholderTextColor={Colors.textLight}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={roomDescription}
              onChangeText={setRoomDescription}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRoomModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveRoom}
              >
                <Text style={styles.saveButtonText}>
                  {editingRoom ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Context Menu */}
      {contextMenuVisible && (
        <TouchableOpacity
          style={styles.contextMenuOverlay}
          onPress={hideContextMenu}
          activeOpacity={1}
        >
          <View
            style={[
              styles.contextMenu,
              {
                top: contextMenuPosition.y - 100,
                left: Math.min(contextMenuPosition.x - 100, width - 200),
              },
            ]}
          >
            {contextMenuType === 'dashboard' && (
              <>
                <TouchableOpacity
                  style={styles.contextMenuItem}
                  onPress={() => {
                    openDashboardModal(contextMenuTarget);
                    hideContextMenu();
                  }}
                >
                  <Ionicons name="create-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.contextMenuText}>Edit Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contextMenuItem, styles.contextMenuItemDelete]}
                  onPress={() => {
                    deleteDashboard(contextMenuTarget);
                    hideContextMenu();
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  <Text style={styles.contextMenuItemTextDelete}>Delete Dashboard</Text>
                </TouchableOpacity>
              </>
            )}
            
            {contextMenuType === 'room' && (
              <>
                <TouchableOpacity
                  style={styles.contextMenuItem}
                  onPress={() => {
                    openRoomModal(contextMenuTarget);
                    hideContextMenu();
                  }}
                >
                  <Ionicons name="create-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.contextMenuText}>Edit Room</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contextMenuItem, styles.contextMenuItemDelete]}
                  onPress={() => {
                    deleteRoom(contextMenuTarget);
                    hideContextMenu();
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  <Text style={styles.contextMenuItemTextDelete}>Delete Room</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.buttonPrimary,
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.buttonText,
  },
  addButton: {
    backgroundColor: Colors.success,
    padding: 10,
    borderRadius: 20,
  },
  dashboardSelector: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    height: 120, // Reduced height for dashboard selector
    paddingVertical: 8,
  },
  dashboardSelectorContent: {
    paddingVertical: 8,
  },
  dashboardCirclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10, // Reduced gap for tighter grid
  },
  dashboardCircle: {
    backgroundColor: Colors.cardBackground,
    width: '30%', // 3 columns with space-between
    height: 70, // Reduced height
    borderRadius: 12, // Slightly smaller radius
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6, // Reduced padding
  },
  selectedDashboard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  dashboardText: {
    fontSize: 13, // Slightly smaller font
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 2, // Reduced padding
    numberOfLines: 2,
  },
  selectedDashboardText: {
    color: Colors.white,
    fontWeight: '700',
  },
  roomsContainer: {
    flex: 1,
    padding: 20,
    minHeight: 300, // Reduced minimum height for rooms section
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addRoomButton: {
    padding: 10,
  },
  roomsGrid: {
    flex: 1,
    minHeight: 200, // Reduced minimum height for the rooms grid
  },
  roomsGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    width: '48%', // Adjust as needed
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
    textAlign: 'center',
  },
  roomDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
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
  contextMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
    zIndex: 1001,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contextMenuText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  contextMenuItemDelete: {
    borderBottomWidth: 0,
  },
  contextMenuItemTextDelete: {
    color: Colors.error,
    fontWeight: '600',
  },
});

export default Dashboard;
