import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  Linking,
  StyleSheet,
  PanResponder,
} from 'react-native';
import DeepARView, {
  IDeepARHandle,
  TextureSourceTypes,
  CameraPermissionRequestResult,
  Camera,
  ErrorTypes,
  CameraPositions,
} from 'react-native-deepar';
import RNFetchBlob from 'rn-fetch-blob';

import { Button } from '../components';
import { Config, Images, Effects, Computed, Enums } from '../constants';

const CameraScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const deepARRef = useRef<IDeepARHandle>(null);
  const { filterName } = route.params;

  const [permsGranted, setPermsGranted] = useState(false);
  const [switchCameraInProgress, setSwitchCameraInProgress] = useState(false);
  const [currEffectIndex, setCurrEffectIndex] = useState(0);
  const [videoMode, setVideoMode] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isVideoRecordingPaused, setIsVideoRecordingPaused] = useState(false);
  const [cameraPosition, setCameraPosition] = useState(CameraPositions.FRONT);

  const isCurrEffectSupported = useMemo(
    () => Effects[currEffectIndex as number]?.platforms.includes(Platform.OS),
    [currEffectIndex]
  );

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      const microphonePermission = await Camera.requestMicrophonePermission();

      const isCameraAllowed =
        cameraPermission === CameraPermissionRequestResult.AUTHORIZED;
      const isMicrophoneAllowed =
        microphonePermission === CameraPermissionRequestResult.AUTHORIZED;

      if (isCameraAllowed && isMicrophoneAllowed) {
        setPermsGranted(true);
      } else {
        Linking.openSettings();
      }
    };

    requestPermissions();

    // if filterName is passed in, set the effect to that filter
    if (filterName) {
      const filterIndex = Effects.findIndex(
        (effect) => effect.name === filterName
      );
      setCurrEffectIndex(filterIndex);
    }
  }, [filterName]);

  const switchCamera = () => {
    if (deepARRef && switchCameraInProgress === false) {
      setCameraPosition(
        cameraPosition === CameraPositions.FRONT
          ? CameraPositions.BACK
          : CameraPositions.FRONT
      );
      setSwitchCameraInProgress(true);
    }
  };

  const changeEffect = (direction: number) => {
    if (!deepARRef) {
      return;
    }

    let newIndex = direction > 0 ? currEffectIndex + 1 : currEffectIndex - 1;

    if (newIndex >= Effects.length) {
      newIndex = 0;
    }

    if (newIndex < 0) {
      newIndex = Effects.length - 1;
    }

    const newEffect = Effects[newIndex];

    if (newEffect?.platforms.includes(Platform.OS)) {
      deepARRef?.current?.switchEffect({
        mask: newEffect?.name as string,
        slot: 'effect',
      });
    } else {
      deepARRef?.current?.switchEffect({
        mask: Effects[0]?.name as string,
        slot: 'effect',
      });
    }

    setCurrEffectIndex(newIndex);
  };

  const takeScreenshot = () => {
    if (deepARRef) {
      deepARRef?.current?.takeScreenshot();
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderEnd: (e, gestureState) => {
      if (gestureState.dx > 50) {
        changeEffect(-1); // Swipe right
      } else if (gestureState.dx < -50) {
        changeEffect(1); // Swipe left
      }
    },
  });

  const renderPhotoViewButtons = () => {
    if (videoMode) {
      return null;
    }

    return (
      <>
        <View style={styles.upLeftButtons}>
          <Button
            style={styles.upLeftButton}
            disabled={
              Effects[currEffectIndex]?.name !== 'background_segmentation'
            }
            text="Random Background Image"
            onPress={() => {
              console.log('random background image');
              RNFetchBlob.config({})
                .fetch('GET', 'https://random.imagecdn.app/450/800')
                .then((res) => {
                  deepARRef?.current?.changeParameterTexture({
                    gameObject: 'Background',
                    component: 'MeshRenderer',
                    parameter: 's_texColor',
                    type: TextureSourceTypes.BASE64,
                    value: res.base64(),
                  });
                });
            }}
          />
          <Button
            style={styles.upLeftButton}
            text="Switch Video Mode"
            onPress={() => {
              setVideoMode(true);
            }}
          />
        </View>
        <Button
          style={styles.switchCameraButton}
          image={() => (
            <Image style={styles.cameraIcon} source={Images.CAMERA} />
          )}
          onPress={switchCamera}
        />
        <View style={styles.bottomButtonContainer}>
          <Button text="Previous" onPress={() => changeEffect(-1)} />

          <Button
            image={() => (
              <Image style={styles.screenshotIcon} source={Images.SCREENSHOT} />
            )}
            disabled={!Effects[currEffectIndex]?.isFree}
            onPress={takeScreenshot}
          />

          <Button text="Next" onPress={() => changeEffect(1)} />
        </View>
      </>
    );
  };

  const renderVideoViewButtons = () => {
    if (videoMode === false) {
      return null;
    }

    return (
      <View style={styles.upLeftButtons}>
        <Button
          style={styles.upLeftButton}
          disabled={!Effects[currEffectIndex]?.isFree}
          text={isVideoRecording ? 'Stop Recording' : 'Start Recording'}
          onPress={() => {
            if (isVideoRecording) {
              deepARRef?.current?.finishRecording();
            } else {
              deepARRef?.current?.startRecording();
            }
          }}
        />
        <Button
          style={styles.upLeftButton}
          disabled={!isVideoRecording}
          text={isVideoRecordingPaused ? 'Resume Recording' : 'Pause Recording'}
          onPress={() => {
            if (isVideoRecordingPaused) {
              setIsVideoRecordingPaused(false);
              deepARRef?.current?.resumeRecording();
            } else {
              setIsVideoRecordingPaused(true);
              deepARRef?.current?.pauseRecording();
            }
          }}
        />
        <Button
          style={styles.upLeftButton}
          text="Switch Photo View"
          disabled={isVideoRecording}
          onPress={() => setVideoMode(false)}
        />
      </View>
    );
  };

  const renderEffectName = () => {
    if (isCurrEffectSupported === false) {
      return (
        <Text style={[styles.title, styles.notSupportedEffectName]}>
          {Effects[currEffectIndex]?.title}
        </Text>
      );
    }

    return <Text style={styles.title}>{Effects[currEffectIndex]?.title}</Text>;
  };

  const renderDeepARView = () => {
    if (permsGranted === false) {
      return null;
    }

    return (
      <View {...panResponder.panHandlers} style={styles.container}>
        <DeepARView
          ref={deepARRef}
          apiKey={Config.DEEPAR.API_KEY || ''}
          position={cameraPosition}
          videoWarmup={false}
          onCameraSwitched={() => {
            setSwitchCameraInProgress(false);
          }}
          onScreenshotTaken={(screenshotPath: String) => {
            const path = 'file://' + screenshotPath;
            navigation.navigate('Preview', {
              path,
              type: Enums.PREVIEW_TYPES.PHOTO,
            });
          }}
          onVideoRecordingPrepared={() => {
            console.log('onVideoRecordingPrepared');
          }}
          onVideoRecordingStarted={() => {
            console.log('onVideoRecordingStarted');
            setIsVideoRecording(true);
          }}
          onVideoRecordingFinished={(videoPath: String) => {
            setIsVideoRecording(false);
            console.log('onVideoRecordingFinished =>', videoPath);
            const path = 'file://' + videoPath;
            navigation.navigate('Preview', {
              path,
              type: Enums.PREVIEW_TYPES.VIDEO,
              EffectName: Effects[currEffectIndex]?.name,
            });
          }}
          onError={(text: String, type: ErrorTypes) => {
            console.log('onError =>', text, 'type =>', type);
          }}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: Computed.SCREEN_WIDTH,
            height: '100%',
          }}
        />
        {renderPhotoViewButtons()}
        {renderVideoViewButtons()}
        {renderEffectName()}
      </View>
    );
  };

  return <View style={styles.container}>{renderDeepARView()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upLeftButtons: {
    position: 'absolute',
    alignItems: 'flex-start',
    left: 20,
    top: 40,
  },
  upLeftButton: {
    marginBottom: 10,
  },
  switchCameraButton: {
    position: 'absolute',
    top: 40,
    right: 40,
  },
  cameraIcon: {
    width: 50,
    height: 40,
  },
  bottomButtonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    bottom: 60,
    height: 50,
  },
  screenshotIcon: {
    width: 70,
    height: 70,
  },
  title: {
    position: 'absolute',
    bottom: 10,
    fontSize: 20,
    color: '#FFF',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  notSupportedEffectName: {
    color: '#F00',
  },
});

export default CameraScreen;
