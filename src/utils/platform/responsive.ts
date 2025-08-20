import { Dimensions } from 'react-native';

// Get current screen dimensions with fallback values
let screenWidth = 375; // Default iPhone width
let screenHeight = 667; // Default iPhone height

try {
  const dimensions = Dimensions.get('window');
  screenWidth = dimensions.width;
  screenHeight = dimensions.height;
} catch (error) {
  console.warn('ResponsiveUtils: Failed to get screen dimensions, using defaults:', error);
}

/**
 * Responsive utility functions for mobile app design
 * Uses percentage-based calculations for better cross-device compatibility
 */
export class ResponsiveUtils {
  /**
   * Get responsive width based on percentage of screen width
   * @param percentage - Percentage of screen width (0-100)
   * @returns Calculated width in pixels
   */
  static getResponsiveWidth(percentage: number): number {
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      console.warn(
        `ResponsiveUtils.getResponsiveWidth: Invalid percentage ${percentage}, using 90% as fallback`
      );
      percentage = 90;
    }
    return Math.round((screenWidth * percentage) / 100);
  }

  /**
   * Get responsive height based on percentage of screen height
   * @param percentage - Percentage of screen height (0-100)
   * @returns Calculated height in pixels
   */
  static getResponsiveHeight(percentage: number): number {
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      console.warn(
        `ResponsiveUtils.getResponsiveHeight: Invalid percentage ${percentage}, using 80% as fallback`
      );
      percentage = 80;
    }
    return Math.round((screenHeight * percentage) / 100);
  }

  /**
   * Get chart width based on container type
   * @param containerType - Type of container ('full', 'compact', 'gallery')
   * @returns Optimal chart width
   */
  static getChartWidth(containerType: 'full' | 'compact' | 'gallery' = 'full'): number {
    if (typeof containerType !== 'string') {
      console.warn(
        `ResponsiveUtils.getChartWidth: Invalid containerType ${containerType}, using 'full' as fallback`
      );
      containerType = 'full';
    }

    switch (containerType) {
      case 'full':
        return ResponsiveUtils.getResponsiveWidth(90); // 90% of screen width
      case 'compact':
        return ResponsiveUtils.getResponsiveWidth(85); // 85% of screen width
      case 'gallery':
        return ResponsiveUtils.getResponsiveWidth(47); // 47% for 2-column layout
      default:
        console.warn(
          `ResponsiveUtils.getChartWidth: Unknown containerType '${containerType}', using 'full' as fallback`
        );
        return ResponsiveUtils.getResponsiveWidth(90);
    }
  }

  /**
   * Get responsive spacing based on screen size
   * @param baseSpacing - Base spacing value
   * @param scaleFactor - Scale factor for different screen sizes
   * @returns Calculated spacing
   */
  static getResponsiveSpacing(baseSpacing: number, scaleFactor: number = 1): number {
    const screenScale = screenWidth / 375; // Base on iPhone 6/7/8 width
    return Math.round(baseSpacing * screenScale * scaleFactor);
  }

  /**
   * Get responsive font size
   * @param baseFontSize - Base font size
   * @returns Scaled font size for current screen
   */
  static getResponsiveFontSize(baseFontSize: number): number {
    const screenScale = screenWidth / 375; // Base on iPhone 6/7/8 width
    return Math.round(baseFontSize * screenScale);
  }

  /**
   * Check if device is considered small screen
   * @returns True if screen width is less than 375px
   */
  static isSmallScreen(): boolean {
    return screenWidth < 375;
  }

  /**
   * Check if device is considered large screen
   * @returns True if screen width is greater than 414px
   */
  static isLargeScreen(): boolean {
    return screenWidth > 414;
  }

  /**
   * Get current screen dimensions
   * @returns Object with width and height
   */
  static getScreenDimensions() {
    return {
      width: screenWidth,
      height: screenHeight,
    };
  }
}

// Export convenience functions
export const getResponsiveWidth = (percentage: number) =>
  ResponsiveUtils.getResponsiveWidth(percentage);
export const getResponsiveHeight = (percentage: number) =>
  ResponsiveUtils.getResponsiveHeight(percentage);
export const getChartWidth = (containerType: 'full' | 'compact' | 'gallery' = 'full') =>
  ResponsiveUtils.getChartWidth(containerType);
export const getResponsiveSpacing = (baseSpacing: number, scaleFactor: number = 1) =>
  ResponsiveUtils.getResponsiveSpacing(baseSpacing, scaleFactor);
export const getResponsiveFontSize = (baseFontSize: number) =>
  ResponsiveUtils.getResponsiveFontSize(baseFontSize);

// Export screen dimension constants
export const SCREEN_WIDTH = screenWidth;
export const SCREEN_HEIGHT = screenHeight;

export default ResponsiveUtils;
