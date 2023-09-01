import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Image,
  View,
  StyleSheet,
  Text,
  Button,
} from 'react-native';
import api from '../utils/api';
import Effects from '../constants/Effects';

const ARFeedScreen = ({ navigation }: { navigation: any }) => {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/feed');
      setFeed(response.data);
      console.log('Feed:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  };

  function truncateAddress(address: string): string {
    if (address.length <= 10) return address;

    const start = address.substr(0, 4);
    const end = address.substr(-3);
    return `${start}...${end}`;
  }

  const handleCreateWithFilter = (filterName: string) => {
    console.log('Create with filter:', filterName);
    navigation.navigate('Create', { filterName });
  };

  const handleBuyFilter = (filterName: string) => {
    console.log('Buy filter:', filterName);
  };

  const isEffectFree = (filterName: string) => {
    return Effects.filter((effect) => effect.name === filterName)[0]?.isFree;
  };

  return (
    <ScrollView contentContainerStyle={styles.feedContainer}>
      {feed?.map((post: any) => (
        <View key={post.id} style={styles.postContainer}>
          <View style={styles.headerContainer}>
            {/* Placeholder for profile image */}
            <Image
              source={{ uri: 'https://placekitten.com/50/50' }}
              style={styles.profileImage}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorAddress}>
                {truncateAddress(post.creator_address)}
              </Text>
              <Text style={styles.filterName}>{post.filter_name}</Text>
            </View>
          </View>

          <Image source={{ uri: post.image }} style={styles.postImage} />

          {isEffectFree(post.filter_name) ? (
            <Button
              title="Create with Filter"
              onPress={() => handleCreateWithFilter(post.filterName)}
            />
          ) : (
            <Button
              title="Buy Filter"
              onPress={() => handleBuyFilter(post.filterName)}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    alignItems: 'center',
  },
  postContainer: {
    width: '90%',
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  creatorInfo: {
    flexDirection: 'column',
  },
  creatorAddress: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
  },
  filterName: {
    fontSize: 12,
    color: 'gray',
  },
  postImage: {
    width: '100%',
    height: 300,
  },
});

export default ARFeedScreen;
