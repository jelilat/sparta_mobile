import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Button,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RlyMumbaiNetwork, Network } from "@rly-network/mobile-sdk";
import { createAccount, getAccount } from "@rly-network/mobile-sdk";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ARFeedScreen = () => {
  // This is a placeholder data array. In a real app, this would be fetched from an API or database.
  const posts = [
    { id: 1, imageUrl: "https://example.com/image1.jpg" },
    { id: 2, imageUrl: "https://example.com/image2.jpg" },
    // ... Add more dummy posts
  ];

  return (
    <ScrollView contentContainerStyle={styles.feedContainer}>
      {posts.map((post) => (
        <View key={post.id} style={styles.postContainer}>
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          {/* Add more post details/components if needed */}
        </View>
      ))}
    </ScrollView>
  );
};

const WalletScreen = () => (
  <View>
    <Text>Wallet Screen</Text>
  </View>
);
const ProfileScreen = () => (
  <View>
    <Text>Profile Screen</Text>
  </View>
);
const SettingsScreen = () => (
  <View>
    <Text>Settings Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const App = () => {
  const [account, setAccount] = useState<string | null>(null);
  //   await rlyNetwork.claimRly();

  useEffect(() => {
    const getUserAccount = async () => {
      try {
        const account = await getAccount();
        setAccount(account!);
      } catch (e: any) {
        Alert.alert("Error", e);
      }
    };
    getUserAccount();
  }, []);

  const createUserAccount = async () => {
    try {
      const newAccount = await createAccount();
      setAccount(newAccount);
    } catch (e: any) {
      Alert.alert("Error", e);
    }
  };
  return (
    <NavigationContainer>
      {!account ? (
        <>
          {/* <Text>Please connect your wallet to continue</Text> */}
          <Button title="Create account" onPress={createUserAccount} />
        </>
      ) : (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              switch (route.name) {
                case "Home":
                  iconName = focused ? "home" : "home";
                  break;
                case "Wallet":
                  iconName = focused
                    ? "account-balance-wallet"
                    : "account-balance-wallet";
                  break;
                case "Profile":
                  iconName = focused ? "person" : "person";
                  break;
                case "Settings":
                  iconName = focused ? "settings" : "settings";
                  break;
                default:
                  iconName = "circle";
              }

              return (
                <MaterialIcons name={iconName} size={size} color={color} />
              );
            },
          })}
        >
          <Tab.Screen name="Home" component={ARFeedScreen} />
          <Tab.Screen name="Wallet" component={WalletScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    alignItems: "center",
  },
  postContainer: {
    width: "90%",
    marginTop: 20,
  },
  postImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
});

export default App;
