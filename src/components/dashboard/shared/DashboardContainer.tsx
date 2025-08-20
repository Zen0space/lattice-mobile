import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

interface DashboardContainerProps {
  children: React.ReactNode;
  showsVerticalScrollIndicator?: boolean;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  showsVerticalScrollIndicator = false,
}) => {
  return (
    <ScrollView 
      className="flex-1 bg-white" 
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </ScrollView>
  );
};

export default DashboardContainer;
