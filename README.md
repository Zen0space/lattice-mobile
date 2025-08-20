# 📊 Lattice Mobile - Advanced Financial Dashboard App

<div align="center">
  <img src="./assets/icon.png" alt="Lattice Mobile" width="120" height="120" />
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-~53.0.20-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-~5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-Private-red.svg)]()

  *A sophisticated React Native financial dashboard application with drag-and-drop widgets, real-time data visualization, and comprehensive portfolio management.*
</div>

---

## 🌟 **Key Features**

### 📱 **Multi-Dashboard Management**
- **6 Specialized Dashboard Types**: Overview, Stocks, Portfolio, Watchlist, Analytics, Trading
- **Dynamic Dashboard Creation**: Create custom dashboards with personalized settings
- **Smart Dashboard Switching**: Automatic fallback and smooth transitions
- **Persistent Storage**: All dashboards and configurations saved locally

### 🎯 **Advanced Widget System**
- **Drag-and-Drop Interface**: Smooth reordering with `react-native-draggable-flatlist`
- **Multiple Widget Types**: Chart widgets, Crypto price trackers, Market data displays

### 📈 **Chart & Data Visualization**
- **Interactive Charts**: Line, area, curved, and step charts with `react-native-gifted-charts`
- **TradingView Integration**: Professional trading charts with `react-native-webview`
- **Real-Time Updates**: Animated chart transitions and live data feeds
- **Multiple Timeframes**: 1D, 1W, 1M, 3M, 1Y data visualization

### 💬 **AI-Powered Chat Interface**
- **Financial Assistant**: AI-powered responses to financial queries
- **Chat History**: Persistent conversation storage with `AsyncStorage`
- **Smart Responses**: Context-aware financial advice and market insights
- **Floating Input**: Modern chat interface with typing animations

### 🎨 **Modern UI/UX**
- **NativeWind/Tailwind CSS**: Utility-first styling with responsive design
- **Smooth Animations**: `react-native-reanimated` for fluid transitions
- **Gesture Handling**: Advanced touch interactions with `react-native-gesture-handler`
- **Safe Area Support**: Proper handling of device notches and navigation bars

---

## 🏗️ **Architecture Overview**

### **Project Structure**
```
lattice-mobile/
├── src/
│   ├── components/
│   │   ├── dashboard/           # Dashboard management system
│   │   │   ├── DashboardManager.tsx    # Main dashboard controller
│   │   │   ├── PortfolioDashboard.tsx  # Widget drag-and-drop interface
│   │   │   ├── DashboardTemplates.ts   # Dashboard configurations
│   │   │   └── shared/                 # Reusable dashboard components
│   │   ├── widget/              # Widget system
│   │   │   ├── ChartWidget.tsx         # Chart visualization widgets
│   │   │   ├── CryptoWidget.tsx        # Cryptocurrency data widgets
│   │   │   ├── WidgetManager.tsx       # Widget creation and management
│   │   │   └── types.ts               # Widget type definitions
│   │   └── ui/                  # UI components
│   │       ├── FloatingChatInput.tsx   # Chat interface
│   │       ├── SidePanel.tsx          # Navigation panel
│   │       └── TradingViewChart.tsx   # Trading chart integration
│   ├── navigation/              # App navigation
│   ├── screen/                  # Main screens
│   └── utils/                   # Utilities and storage
│       ├── DashboardStorage.ts         # Dashboard persistence
│       └── ChatStorage.ts             # Chat data management
├── assets/                      # App icons and images
└── financial-responses.json     # AI response templates
```

### **Core Technologies**

#### **Framework & Runtime**
- **React Native 0.79.5**: Latest stable React Native with New Architecture support
- **Expo ~53.0.20**: Managed workflow for rapid development and deployment
- **TypeScript ~5.8.3**: Type-safe development with modern TypeScript features

#### **State Management & Storage**
- **AsyncStorage**: Persistent local storage for dashboards and user data
- **React Hooks**: Modern state management with useState, useEffect, useRef
- **Custom Storage Classes**: Specialized storage utilities for different data types

#### **UI & Animations**
- **NativeWind 4.1.23**: Tailwind CSS for React Native with utility-first styling
- **React Native Reanimated ~3.17.4**: High-performance animations and transitions
- **React Native Gesture Handler ^2.28.0**: Advanced touch and gesture recognition
- **React Native Draggable FlatList ^4.0.3**: Smooth drag-and-drop functionality

#### **Charts & Visualization**
- **React Native Gifted Charts ^1.4.63**: Beautiful and customizable chart library
- **React Native SVG ^15.12.1**: Vector graphics for icons and custom visualizations
- **React Native Linear Gradient ^2.8.3**: Gradient backgrounds and effects

#### **Navigation & Routing**
- **React Navigation 7.x**: Stack navigation with custom transitions
- **Type-Safe Navigation**: TypeScript-powered route definitions and params

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone git@github.com:Zen0space/lattice-mobile.git
   cd lattice-mobile
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web Browser
   npm run web
   ```

### **Development Scripts**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
```

---

## 📱 **App Screens & Features**

### **1. Home Screen**
- **AI Chat Interface**: Financial assistant with intelligent responses
- **Side Navigation Panel**: Quick access to all app sections
- **Chat History**: Persistent conversation storage and retrieval
- **Floating Input**: Modern chat input with gesture support

### **2. Dashboard Management**
- **Dashboard Gallery**: Visual dashboard selection with templates
- **Create Dashboard**: Custom dashboard creation with type selection
- **Dashboard Settings**: Theme, refresh intervals, and display preferences
- **Safe Deletion**: Protected deletion with automatic widget cleanup

### **3. Portfolio Dashboard**
- **Widget Management**: Drag-and-drop widget reordering
- **Add Widget Button**: Easy widget creation and customization
- **Real-Time Updates**: Live data synchronization and display
- **Quick Actions**: Fast access to common portfolio operations

### **4. Widget System**
- **Chart Widgets**: Customizable financial charts with multiple types
- **Crypto Widgets**: Real-time cryptocurrency data and price tracking
- **Widget Gallery**: Pre-built widget templates and configurations
- **Widget Customization**: Color themes, data sources, and display options

---

## 🔧 **Key Technical Implementations**

### **Dashboard Management System**
```typescript
interface DashboardConfig {
  id: string;
  name: string;
  type: DashboardType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  lastAccessed: Date;
  settings?: DashboardSettings;
  widgets?: Widget[];
}
```

### **Widget Architecture**
```typescript
interface Widget {
  id: string;
  type: 'chart' | 'crypto-price' | 'crypto-market' | 'crypto-gainers' | 'crypto-portfolio';
  title: string;
  config: ChartConfig | CryptoWidgetConfig;
  createdAt: Date;
  updatedAt: Date;
  position: { row: number; col: number; };
  size: { width: number; height: number; };
}
```

### **Advanced Features**

#### **🛡️ Crash Prevention System**
- **Active Dashboard Protection**: Automatic dashboard switching before deletion
- **Widget-First Deletion**: Systematic widget cleanup before dashboard removal
- **Race Condition Prevention**: Atomic state updates and proper error handling
- **Data Validation**: Comprehensive input validation and sanitization

#### **🎯 Drag-and-Drop Implementation**
- **Smooth Animations**: 60fps drag operations with optimized rendering
- **Constraint-Based Dragging**: Widgets can only be reordered within widget areas
- **Visual Feedback**: Real-time drag indicators and drop zones
- **Auto-Save**: Immediate persistence of widget positions

#### **💾 Persistent Storage Strategy**
- **Atomic Operations**: Safe concurrent read/write operations
- **Data Integrity**: JSON validation and error recovery
- **Migration Support**: Backward compatibility for data structure changes
- **Performance Optimization**: Lazy loading and efficient data structures

---

## 🎨 **UI/UX Design Principles**

### **Design System**
- **Color Palette**: Carefully selected colors for financial data visualization
- **Typography**: Clear, readable fonts optimized for financial information
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Accessibility**: WCAG-compliant color contrasts and touch targets

### **Responsive Design**
- **Multi-Device Support**: Optimized for phones and tablets
- **Orientation Support**: Portrait and landscape layout adaptations
- **Safe Areas**: Proper handling of notches, navigation bars, and status bars
- **Gesture-Friendly**: Touch targets sized for comfortable interaction

### **Animation Philosophy**
- **Purposeful Motion**: Animations that enhance understanding and flow
- **Performance First**: Hardware-accelerated animations with 60fps targets
- **Accessibility**: Respectful of motion sensitivity preferences
- **Feedback-Driven**: Visual feedback for all user interactions

---

## 🔐 **Data Management & Security**

### **Local Storage Strategy**
- **AsyncStorage**: Secure local storage for sensitive financial data
- **Data Encryption**: Sensitive information stored with appropriate security
- **Backup & Recovery**: Robust data recovery mechanisms
- **Cache Management**: Efficient data caching for offline functionality

### **Error Handling**
- **Graceful Degradation**: App continues functioning even with partial data loss
- **User Feedback**: Clear error messages and recovery suggestions
- **Logging**: Comprehensive error logging for debugging and improvement
- **Fallback Systems**: Multiple fallback options for critical operations

---

## 🧪 **Testing & Quality Assurance**

### **Code Quality**
- **TypeScript**: Full type coverage for enhanced code reliability
- **ESLint**: Consistent code style and error prevention
- **Component Testing**: Individual component validation and testing
- **Integration Testing**: End-to-end user flow validation

### **Performance Monitoring**
- **Memory Management**: Efficient memory usage and leak prevention
- **Render Optimization**: Minimized re-renders and optimized component trees
- **Bundle Size**: Optimized app bundle for faster loading
- **Animation Performance**: 60fps animation targets with performance monitoring

---

## 🚀 **Deployment & Distribution**

### **Build Configuration**
- **Expo EAS**: Production builds with Expo Application Services
- **Platform-Specific**: iOS and Android optimized builds
- **Code Signing**: Proper code signing for app store distribution
- **Environment Management**: Separate development, staging, and production environments

### **Release Management**
- **Version Control**: Semantic versioning with automated release notes
- **Testing Pipeline**: Automated testing before production releases
- **Rollback Strategy**: Quick rollback capabilities for critical issues
- **Analytics Integration**: User behavior tracking and performance monitoring

---

## 🤝 **Contributing**

This is a private repository. For internal development:

1. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
2. **Follow Code Standards**: Maintain TypeScript types and ESLint compliance
3. **Test Thoroughly**: Ensure all features work on both iOS and Android
4. **Update Documentation**: Keep README and code comments current
5. **Submit Pull Request**: Detailed description of changes and testing performed

---

## 📄 **License**

This project is private and proprietary. All rights reserved.

---

## 🔗 **Links & Resources**

- **Repository**: [github.com/Zen0space/lattice-mobile](https://github.com/Zen0space/lattice-mobile)
- **React Native**: [reactnative.dev](https://reactnative.dev/)
- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev/)
- **NativeWind**: [nativewind.dev](https://www.nativewind.dev/)
- **React Navigation**: [reactnavigation.org](https://reactnavigation.org/)

---

## 📞 **Support**

For technical support or questions about this project, please contact the development team or create an issue in the repository.

---

<div align="center">
  <p><strong>Built with ❤️ using React Native & Expo</strong></p>
  <p><em>© 2025 Zen0space. All rights reserved.</em></p>
</div>
