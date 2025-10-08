import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const AuthNavigator = ({ onAuthenticationSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleAuthenticationSuccess = (user) => {
    onAuthenticationSuccess(user);
  };

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen
          onLoginSuccess={handleAuthenticationSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      ) : (
        <RegisterScreen
          onRegisterSuccess={handleAuthenticationSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthNavigator;
