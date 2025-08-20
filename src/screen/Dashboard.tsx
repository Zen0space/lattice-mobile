import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DashboardManager } from '../components/dashboard';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DashboardProps {
  onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const navigation = useNavigation<DashboardNavigationProp>();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return <DashboardManager onBack={handleBack} />;
};

export default Dashboard;
