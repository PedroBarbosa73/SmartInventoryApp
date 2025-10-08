# Smart Inventory App

A React Native mobile application for managing personal inventory items with photo-based storage location tracking.

## Features

- **Item Management**: Add, edit, and delete inventory items
- **Photo Capture**: Take photos of items and storage locations
- **Storage Organization**: Group items by storage locations
- **Search Functionality**: Find items by name or category
- **Location Tracking**: Visual storage location management
- **Modern UI**: Clean, intuitive interface with tab navigation


The app features a clean, modern interface with:
- Home tab for searching and viewing items
- Storage tab for organized item management
- Add Item screen for creating new inventory entries
- Storage Location Manager for organizing storage areas

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)
- Firebase project (see Firebase Setup section below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SmartInventory
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase (see Firebase Setup section below)

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android
```

### Firebase Setup

This app uses Firebase for authentication and data storage. Follow these steps:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one

2. **Enable Required Services**:
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Create database in test mode
   - **Storage** (optional): For cloud photo storage

3. **Configure Firebase**:
   - Copy your Firebase config to `services/firebase.js`
   - Update Firestore rules with `firestore.rules`

See `FIREBASE_SETUP.md` for detailed instructions.

## Usage

### Adding Items

1. Tap the "+ Add Item" button on the home screen
2. Enter the item name (required)
3. Optionally add a category
4. Take or select photos for the item and storage location
5. Enter a storage location name
6. Select the storage group
7. Save the item

### Managing Storage Locations

1. Go to the Storage tab
2. Tap the "📁 Locations" button
3. Create new storage locations or edit existing ones
4. Add descriptions and photos to help identify locations

### Searching Items

1. Use the search bar on the home screen
2. Search by item name or category
3. View search results with item details and storage information

### Editing Items

1. Go to the Storage tab
2. Tap the edit button (✏️) on any item
3. Modify item details, category, or storage location
4. Save changes

## Technical Details

### Architecture

- **Frontend**: React Native with Expo
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Image Handling**: expo-image-picker and expo-media-library
- **Navigation**: Custom tab navigator

### Database Schema

- **items**: Stores inventory item information (Firestore collection)
- **storage_locations**: Manages storage location groups (Firestore collection)
- **users**: User authentication and data isolation

### Key Components

- `InventoryList`: Main home screen with search functionality
- `AddItem`: Form for creating new inventory items
- `Storage`: Organized view of items by storage location
- `StorageLocationManager`: CRUD operations for storage locations
- `DatabaseService`: Firebase Firestore operations
- `PhotoService`: Camera and gallery integration

## Dependencies

- `expo`: ~53.0.0
- `firebase`: ^12.1.0
- `expo-image-picker`: ~16.1.4
- `expo-media-library`: ~17.1.7
- `react`: 19.0.0
- `react-native`: 0.79.5
- `@expo/vector-icons`: ^14.1.0
- `react-native-gesture-handler`: ^2.28.0

## Permissions

The app requires the following permissions:
- Camera access for taking photos
- Photo library access for selecting images
- Media library access for saving photos

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

