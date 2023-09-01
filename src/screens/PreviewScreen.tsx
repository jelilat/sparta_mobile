import React, { useState } from "react";
import { View, Image, Alert, StyleSheet } from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Video from "react-native-video";

import { getAccount } from "@rly-network/mobile-sdk";
import { Button } from "../components";
import { Enums, Computed } from "../constants";
import Utils from "../utils";
import api from "../utils/api";

import axios from "axios";

const uploadToIPFSInfura = async (uri: any) => {
  try {
    const data = new FormData();
    const file = {
      uri,
      type: "image/jpeg", // Adjust based on your image type
      name: "screenshot.jpg",
    };

    data.append("file", file);

    const response = await axios.post(
      "https://ipfs.infura.io:5001/api/v0/add",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        auth: {
          username: process.env.IPFS_USERNAME!,
          password: process.env.IPFS_PASSWORD!,
        },
      }
    );

    console.log(`Uploaded to IPFS: https://ipfs.io/ipfs/${response.data.Hash}`);
    return `https://ipfs.io/ipfs/${response.data.Hash}`;
  } catch (error) {
    console.error("Error uploading to IPFS via Infura:", error);
  }
};

const PreviewScreen = ({ navigation, route }: any) => {
  const [account, setAccount] = useState<string | null>(null);
  const { path, type, EffectName } = route.params;

  const getUserAccount = async () => {
    try {
      const userAccount = await getAccount();
      setAccount(userAccount!);
    } catch (e: any) {
      console.log("Error", e);
    }
  };
  getUserAccount();

  const renderContent = () => {
    if (type === Enums.PREVIEW_TYPES.PHOTO) {
      return <Image style={styles.image} source={{ uri: path }} />;
    }

    return (
      <Video
        resizeMode="contain"
        source={{ uri: path }}
        style={styles.video}
        controls
      />
    );
  };

  const share = async () => {
    try {
      const ipfsUrl = await uploadToIPFSInfura(path);
      console.log("IPFS URL:", ipfsUrl);
      const response = await api.post("/upload", {
        creatorAddress: account,
        filterName: EffectName,
        image: ipfsUrl,
      });
      console.log("Share response:", response.data);
      Alert.alert("Shared!", "Your content has been shared!");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttons}>
        <Button text="Back" onPress={() => navigation.goBack()} />
        <Button
          text="Save to Gallery"
          onPress={() => {
            CameraRoll.save(path, { type })
              .then(() => {
                Alert.alert(
                  `${Utils.capitalize(type)} Saved`,
                  `${Utils.capitalize(type)} saved to Gallery!`
                );
              })
              .catch((err) => {
                Alert.alert("Something Went Wrong", err.message);
              });
          }}
        />
        <Button
          text="Share"
          onPress={() => {
            share();
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      {renderButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    position: "absolute",
    flex: 1,
    width: "100%",
    height: "100%",
  },
  buttons: {
    position: "absolute",
    bottom: 20,
    height: 150,
  },
  video: {
    height: Computed.SCREEN_HEIGHT,
    width: Computed.SCREEN_WIDTH,
  },
});

export default PreviewScreen;
