import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw, AlertCircle } from 'react-native-feather';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorBoundaryId: string;
}

/**
 * Development-focused Error Boundary with enhanced debugging features
 * Based on 2025 React Native best practices for development stability
 */
class DevelopmentErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private prevResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorBoundaryId: Math.random().toString(36).substr(2, 9),
    };
    this.prevResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Development-only enhanced error logging
    if (__DEV__) {
      console.group(`🚨 Error Boundary Caught Error - ID: ${this.state.errorBoundaryId}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.groupEnd();
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-recovery in development after 5 seconds
    if (__DEV__) {
      this.resetTimeoutId = setTimeout(() => {
        if (__DEV__) {
          console.log(`🔄 Auto-recovering from error boundary ${this.state.errorBoundaryId}`);
        }
        this.resetErrorBoundary();
      }, 5000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => this.prevResetKeys[index] !== key
        );
        if (hasResetKeyChanged) {
          if (__DEV__) {
            console.log(`🔄 Resetting error boundary due to resetKeys change:`, {
              prev: this.prevResetKeys,
              current: resetKeys,
            });
          }
          this.resetErrorBoundary();
        }
      }
    }

    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      if (__DEV__) {
        if (__DEV__) {
          console.log(`🔄 Resetting error boundary due to props change`);
        }
      }
      this.resetErrorBoundary();
    }

    this.prevResetKeys = resetKeys || [];
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorBoundaryId: Math.random().toString(36).substr(2, 9),
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI if provided
      if (fallback) {
        return fallback;
      }

      // Development-focused error UI
      if (__DEV__) {
        return (
          <View className="flex-1 bg-red-50 p-4">
            <ScrollView className="flex-1">
              {/* Header */}
              <View className="bg-red-100 rounded-lg p-4 mb-4 flex-row items-center">
                <AlertTriangle width={24} height={24} stroke="#dc2626" />
                <View className="ml-3 flex-1">
                  <Text className="text-red-800 font-bold text-lg">Development Error</Text>
                  <Text className="text-red-600 text-sm">
                    Error Boundary ID: {this.state.errorBoundaryId}
                  </Text>
                </View>
              </View>

              {/* Error Details */}
              <View className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                <Text className="text-gray-800 font-semibold mb-2">Error Message:</Text>
                <Text className="text-red-600 font-mono text-sm mb-4">
                  {error?.message || 'Unknown error'}
                </Text>

                {error?.stack && (
                  <>
                    <Text className="text-gray-800 font-semibold mb-2">Stack Trace:</Text>
                    <ScrollView
                      horizontal
                      className="bg-gray-100 p-3 rounded mb-4"
                      style={{ maxHeight: 200 }}
                    >
                      <Text className="text-gray-700 font-mono text-xs">{error.stack}</Text>
                    </ScrollView>
                  </>
                )}

                {errorInfo?.componentStack && (
                  <>
                    <Text className="text-gray-800 font-semibold mb-2">Component Stack:</Text>
                    <ScrollView
                      horizontal
                      className="bg-gray-100 p-3 rounded"
                      style={{ maxHeight: 200 }}
                    >
                      <Text className="text-gray-700 font-mono text-xs">
                        {errorInfo.componentStack}
                      </Text>
                    </ScrollView>
                  </>
                )}
              </View>

              {/* Development Tips */}
              <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <View className="flex-row items-center mb-2">
                  <AlertCircle width={20} height={20} stroke="#2563eb" />
                  <Text className="text-blue-800 font-semibold ml-2">Development Tips:</Text>
                </View>
                <Text className="text-blue-700 text-sm leading-5">
                  • Check the console for additional error details{'\n'}• This error boundary will
                  auto-recover in 5 seconds{'\n'}• Use the Reset button to manually recover{'\n'}•
                  Enable Fast Refresh for better hot reload stability{'\n'}• Check if state is
                  properly initialized before rendering
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={this.resetErrorBoundary}
                  className="flex-1 bg-red-600 rounded-lg py-3 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <RefreshCw width={18} height={18} stroke="#ffffff" />
                  <Text className="text-white font-semibold ml-2">Reset Component</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (__DEV__) {
                      if (__DEV__) {
                        console.log('🔄 Triggering Fast Refresh...');
                      }
                      // In development, this will trigger a fast refresh
                      if ((global as any).HermesInternal?.enableDebugger) {
                        (global as any).HermesInternal.enableDebugger();
                      }
                    }
                  }}
                  className="flex-1 bg-blue-600 rounded-lg py-3 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <AlertCircle width={18} height={18} stroke="#ffffff" />
                  <Text className="text-white font-semibold ml-2">Debug Mode</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        );
      }

      // Production fallback (minimal)
      return (
        <View className="flex-1 items-center justify-center p-4 bg-gray-50">
          <AlertTriangle width={48} height={48} stroke="#6b7280" />
          <Text className="text-gray-900 font-semibold text-lg mt-4 mb-2">
            Something went wrong
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            We're sorry, but something unexpected happened.
          </Text>
          <TouchableOpacity
            onPress={this.resetErrorBoundary}
            className="bg-blue-500 px-6 py-3 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return children;
  }
}

export default DevelopmentErrorBoundary;
