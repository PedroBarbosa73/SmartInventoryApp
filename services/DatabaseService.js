import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export const DatabaseService = {
  initDatabase: async () => {
    try {
      console.log('Firebase Firestore initialized successfully');
      return 'success';
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  },

  // Dashboard Management Functions
  getAllDashboards: async (userId) => {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'dashboards'),
          where('user_id', 'in', [userId, null]),
          orderBy('name')
        );
      } else {
        q = query(
          collection(db, 'dashboards'),
          orderBy('name')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const dashboards = [];
      
      querySnapshot.forEach((doc) => {
        dashboards.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('getAllDashboards result:', dashboards);
      return dashboards;
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      throw error;
    }
  },

  getDashboardById: async (id) => {
    try {
      const docRef = doc(db, 'dashboards', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching dashboard by id:', error);
      throw error;
    }
  },

  createDashboard: async (name, description, userId) => {
    try {
      const dashboardData = {
        name: name.trim(),
        description: description || '',
        user_id: userId,
        timestamp: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'dashboards'), dashboardData);
      console.log('Dashboard created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  },

  updateDashboard: async (id, name, description) => {
    try {
      const docRef = doc(db, 'dashboards', id);
      await updateDoc(docRef, {
        name: name.trim(),
        description: description || '',
        timestamp: serverTimestamp()
      });
      console.log('Dashboard updated successfully');
      return 'success';
    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw error;
    }
  },

  deleteDashboard: async (id) => {
    try {
      // First, move all storage locations to the default dashboard (ID 1)
      const locationsQuery = query(
        collection(db, 'storage_locations'),
        where('dashboard_id', '==', id)
      );
      const locationsSnapshot = await getDocs(locationsQuery);
      
      const batch = writeBatch(db);
      locationsSnapshot.forEach((locationDoc) => {
        batch.update(doc(db, 'storage_locations', locationDoc.id), {
          dashboard_id: 'default'
        });
      });
      
      // Delete the dashboard
      batch.delete(doc(db, 'dashboards', id));
      await batch.commit();
      
      console.log('Dashboard deleted successfully');
      return 'success';
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw error;
    }
  },

  // Room Management Functions
  getAllRooms: async (dashboardId, userId = null) => {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'rooms'),
          where('dashboard_id', '==', dashboardId),
          where('user_id', '==', userId),
          orderBy('name')
        );
      } else {
        q = query(
          collection(db, 'rooms'),
          where('dashboard_id', '==', dashboardId),
          orderBy('name')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const rooms = [];
      
      querySnapshot.forEach((doc) => {
        rooms.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('getAllRooms result:', rooms);
      return rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  getRoomById: async (id) => {
    try {
      const docRef = doc(db, 'rooms', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching room by id:', error);
      throw error;
    }
  },

  createRoom: async (name, description, dashboardId, userId = null) => {
    try {
      const roomData = {
        name: name.trim(),
        description: description || '',
        dashboard_id: dashboardId,
        user_id: userId,
        timestamp: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      console.log('Room created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  updateRoom: async (id, name, description) => {
    try {
      const docRef = doc(db, 'rooms', id);
      await updateDoc(docRef, {
        name: name.trim(),
        description: description || '',
        timestamp: serverTimestamp()
      });
      
      console.log('Room updated successfully');
      return 'success';
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  deleteRoom: async (id) => {
    try {
      // First, move all storage locations to a default room or delete them
      const locationsQuery = query(
        collection(db, 'storage_locations'),
        where('room_id', '==', id)
      );
      const locationsSnapshot = await getDocs(locationsQuery);
      
      const batch = writeBatch(db);
      locationsSnapshot.forEach((locationDoc) => {
        batch.delete(doc(db, 'storage_locations', locationDoc.id));
      });
      
      // Delete the room
      batch.delete(doc(db, 'rooms', id));
      await batch.commit();
      
      console.log('Room deleted successfully');
      return 'success';
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Storage Location Management Functions
  getAllStorageLocations: async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'storage_locations'), orderBy('name'))
      );
      
      const locations = [];
      querySnapshot.forEach((doc) => {
        locations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('getAllStorageLocations result:', locations);
      return locations;
    } catch (error) {
      console.error('Error fetching storage locations:', error);
      throw error;
    }
  },

  getStorageLocationByName: async (name) => {
    try {
      const q = query(
        collection(db, 'storage_locations'),
        where('name', '==', name)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching storage location by name:', error);
      throw error;
    }
  },

  getStorageLocationsByDashboard: async (dashboardId) => {
    try {
      const q = query(
        collection(db, 'storage_locations'),
        where('dashboard_id', '==', dashboardId),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const locations = [];
      
      querySnapshot.forEach((doc) => {
        locations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('getStorageLocationsByDashboard result:', locations);
      return locations;
    } catch (error) {
      console.error('Error fetching storage locations by dashboard:', error);
      throw error;
    }
  },

  // Updated Storage Location Functions
  getStorageLocationsByRoom: async (roomId, userId = null) => {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'storage_locations'),
          where('room_id', '==', roomId),
          where('user_id', '==', userId),
          orderBy('name')
        );
      } else {
        q = query(
          collection(db, 'storage_locations'),
          where('room_id', '==', roomId),
          orderBy('name')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const locations = [];
      
      querySnapshot.forEach((doc) => {
        locations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('getStorageLocationsByRoom result:', locations);
      return locations;
    } catch (error) {
      console.error('Error fetching storage locations by room:', error);
      throw error;
    }
  },

  createStorageLocation: async (name, description, photoURI, roomId, userId = null) => {
    try {
      const locationData = {
        name: name.trim(),
        description: description || '',
        photoURI: photoURI || '',
        room_id: roomId,
        user_id: userId,
        timestamp: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'storage_locations'), locationData);
      console.log('Storage location created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating storage location:', error);
      throw error;
    }
  },

  updateStorageLocation: async (id, name, description, photoURI, roomId) => {
    try {
      const docRef = doc(db, 'storage_locations', id);
      await updateDoc(docRef, {
        name: name.trim(),
        description: description || '',
        photoURI: photoURI || '',
        room_id: roomId,
        timestamp: serverTimestamp()
      });
      
      console.log('Storage location updated successfully');
      return 'success';
    } catch (error) {
      console.error('Error updating storage location:', error);
      throw error;
    }
  },

  deleteStorageLocation: async (id) => {
    try {
      // First, move all items in this location to the default location
      const itemsQuery = query(
        collection(db, 'items'),
        where('storageLocationId', '==', id)
      );
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const batch = writeBatch(db);
      itemsSnapshot.forEach((itemDoc) => {
        batch.update(doc(db, 'items', itemDoc.id), {
          storageLocationId: 'default'
        });
      });
      
      // Delete the storage location
      batch.delete(doc(db, 'storage_locations', id));
      await batch.commit();
      
      console.log('Storage location deleted successfully');
      return 'success';
    } catch (error) {
      console.error('Error deleting storage location:', error);
      throw error;
    }
  },

  // Item Management Functions
  addItem: async (itemData) => {
    try {
      const item = {
        name: itemData.name.trim(),
        category: itemData.category || '',
        description: itemData.description || '',
        quantity: itemData.quantity || 1,
        photoURI: itemData.photoURI || '',
        storageLocationId: itemData.storageLocationId,
        roomId: itemData.roomId,
        dashboardId: itemData.dashboardId,
        user_id: itemData.user_id,
        timestamp: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'items'), item);
      console.log('Item added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  getAllItems: async (userId = null) => {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'items'),
          where('user_id', '==', userId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'items'),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const items = [];
      
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('getAllItems result:', items);
      return items;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  searchItemsByLocation: async (locationPhotoURI, userId = null) => {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'items'),
          where('locationPhotoURI', '==', locationPhotoURI),
          where('user_id', '==', userId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'items'),
          where('locationPhotoURI', '==', locationPhotoURI),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const items = [];
      
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('searchItemsByLocation result:', items);
      return items;
    } catch (error) {
      console.error('Error searching items by location:', error);
      throw error;
    }
  },

  searchItemsByNameOrCategory: async (query, userId = null) => {
    try {
      // Note: Firestore doesn't support full-text search out of the box
      // This is a simple implementation - for production, consider using Algolia or similar
      const allItems = await DatabaseService.getAllItems(userId);
      const searchTerm = query.toLowerCase();
      
      const filteredItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );
      
      // Enhance items with location information
      const enhancedItems = await Promise.all(
        filteredItems.map(async (item) => {
          try {
            let enhancedItem = { ...item };
            
            // Get storage location details
            if (item.storageLocationId) {
              try {
                const locationDoc = await getDoc(doc(db, 'storage_locations', item.storageLocationId));
                if (locationDoc.exists()) {
                  const locationData = locationDoc.data();
                  enhancedItem.locationName = locationData.name || 'Unknown Location';
                  enhancedItem.locationDescription = locationData.description || '';
                  
                  // Get room details
                  if (locationData.room_id) {
                    try {
                      const roomDoc = await getDoc(doc(db, 'rooms', locationData.room_id));
                      if (roomDoc.exists()) {
                        const roomData = roomDoc.data();
                        enhancedItem.roomName = roomData.name || 'Unknown Room';
                        enhancedItem.roomDescription = roomData.description || '';
                        
                        // Get dashboard details
                        if (roomData.dashboard_id) {
                          try {
                            const dashboardDoc = await getDoc(doc(db, 'dashboards', roomData.dashboard_id));
                            if (dashboardDoc.exists()) {
                              const dashboardData = dashboardDoc.data();
                              enhancedItem.dashboardName = dashboardData.name || 'Unknown Dashboard';
                              enhancedItem.dashboardDescription = dashboardData.description || '';
                            }
                          } catch (error) {
                            console.warn('Error fetching dashboard details:', error);
                          }
                        }
                      }
                    } catch (error) {
                      console.warn('Error fetching room details:', error);
                    }
                  }
                }
              } catch (error) {
                console.warn('Error fetching location details for item:', item.id, error);
              }
            }
            
            return enhancedItem;
          } catch (error) {
            console.warn('Error enhancing item:', item.id, error);
            return item;
          }
        })
      );
      
      console.log('searchItemsByNameOrCategory result:', enhancedItems);
      return enhancedItems;
    } catch (error) {
      console.error('Error searching items by name or category:', error);
      throw error;
    }
  },

  updateItem: async (id, name, category, locationName, storageLocationId) => {
    try {
      const docRef = doc(db, 'items', id);
      await updateDoc(docRef, {
        name: name.trim(),
        category: category ? category.trim() : '',
        locationName: locationName.trim(),
        storageLocationId: storageLocationId,
        timestamp: serverTimestamp()
      });
      
      console.log('Item updated successfully');
      return 'success';
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  getItemsByStorageLocation: async (storageLocationId, userId = null) => {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, 'items'),
          where('storageLocationId', '==', storageLocationId),
          where('user_id', '==', userId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'items'),
          where('storageLocationId', '==', storageLocationId),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const items = [];
      
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Items by storage location retrieved:', items);
      return items;
    } catch (error) {
      console.error('Error getting items by storage location:', error);
      throw error;
    }
  },

  searchItems: async (query, userId = null) => {
    try {
      const allItems = await DatabaseService.getAllItems(userId);
      const searchTerm = query.toLowerCase();
      
      const filteredItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        item.locationName.toLowerCase().includes(searchTerm)
      );
      
      console.log('Search results:', filteredItems);
      return filteredItems;
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      await deleteDoc(doc(db, 'items', id));
      console.log('Item deleted successfully');
      return 'success';
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
};
