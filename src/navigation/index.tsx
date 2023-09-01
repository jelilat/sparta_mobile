import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createAccount,
  getAccount,
  // RlyMumbaiNetwork,
  // Network,
} from '@rly-network/mobile-sdk';
import { Alert, Button, StyleSheet, View } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Screens from '../screens';

const Tab = createBottomTabNavigator();

export default () => {
  const [account, setAccount] = useState<string | null>(null);
  //   await rlyNetwork.claimRly();

  useEffect(() => {
    const getUserAccount = async () => {
      try {
        const userAccount = await getAccount();
        setAccount(userAccount!);
      } catch (e: any) {
        Alert.alert('Error', e);
      }
    };
    getUserAccount();
  }, []);

  const createUserAccount = async () => {
    try {
      const newAccount = await createAccount();
      setAccount(newAccount);
    } catch (e: any) {
      Alert.alert('Error', e);
    }
  };

  return !account ? (
    <View style={styles.centeredView}>
      <Button title="Create account" onPress={createUserAccount} />
    </View>
  ) : (
    <Tab.Navigator
    // screenOptions={({ route }) => ({
    //   tabBarIcon: ({ focused, color, size }) => {
    //     let iconName;

    //     switch (route.name) {
    //       case 'Home':
    //         iconName = focused ? 'home' : 'home';
    //         break;
    //       case 'Wallet':
    //         iconName = focused
    //           ? 'account-balance-wallet'
    //           : 'account-balance-wallet';
    //         break;
    //       case 'Profile':
    //         iconName = focused ? 'person' : 'person';
    //         break;
    //       case 'Settings':
    //         iconName = focused ? 'settings' : 'settings';
    //         break;
    //       case 'Create':
    //         iconName = focused ? 'add-circle' : 'add-circle-outline';
    //         break;
    //       default:
    //         iconName = 'circle';
    //     }

    // return <MaterialIcons name={iconName} size={size} color={color} />;
    //   },
    // })}
    >
      <Tab.Screen name="Home" component={Screens.HomeScreen} />
      <Tab.Screen name="Create" component={Screens.CameraScreen} />
      <Tab.Screen name="Preview" component={Screens.PreviewScreen} />
      {/* <Tab.Screen name="Wallet" component={Screens.Wallet} />
      <Tab.Screen name="Profile" component={Screens.Profile} />
      <Tab.Screen name="Settings" component={Screens.Settings} /> */}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
