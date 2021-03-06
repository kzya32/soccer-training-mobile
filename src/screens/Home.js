import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  AsyncStorage,
} from 'react-native';
import {
  AdMobBanner,
  AdMobInterstitial,
  // PublisherBanner,
  AdMobRewarded,
  ScreenOrientation,
  FileSystem,
  Permissions,
  Notifications,
} from 'expo';
import firebase from 'firebase';
import { Circle } from 'react-native-progress';

import designLanguage from '../../designLanguage.json';
import defaultMovie from '../../defaultMovie.json';
import ENV from '../../env.json';
import UnderPane from '../components/UnderPane.js';
import VideoPane from '../components/VideoPane.js';

const desc = 'このアプリはプロのサッカー選手を目指すための技術を紹介しています。' +
  'サッカーの実践スキルを習得したい人や練習を指導する方のお役に立てると思います。\n\n' +
  '実践的なスキルを細かいポイントに分解することで' +
  'アクションを起こしやすくしています。\n\n' +
  'まずは好きなサッカー選手やスキルカテゴリの動画を選んで再生してみてください！';

// const ADUNITID = ENV.ADMOB_ADUNITID;
const BANNER_ID = ENV.ADMOB_BANNER_ID;
// const INTERSTITIAL_ID = ENV.ADMOB_INTERSTITIAL_ID;
// const REWARDED_ID = ENV.ADMOB_REWARDED_ID;


class Home extends React.Component {
  state = {
    initialized: false,
    introRemoteUri: defaultMovie.downloadURL,
    // introRemoteUri: defaultMovie.testURL,
  }

  componentWillMount() {
    this.fetchDefaultVideo();
    // eslint-disable-next-line
    ScreenOrientation.allowAsync(ScreenOrientation.Orientation.ALL_BUT_UPSIDE_DOWN).catch(error => console.log(error));
  }

  componentDidMount() {
    this.registerForPushNotificationsAsync();
  }

  // eslint-disable-next-line
  registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    this.setPushToken(token);
  }

  // eslint-disable-next-line
  setPushToken = async (token) => {
    const deviceId = await AsyncStorage.getItem('deviceId');

    const db = firebase.firestore();
    const ref = db.collection('devices').doc(deviceId);
    ref.set({
      pushToken: token,
      os: Platform.OS,
    }, { merge: true })
      .catch((error) => {
        // eslint-disable-next-line
        console.error('Error updating document: ', error);
      });
  }

  // eslint-disable-next-line
  initAdMob = () => {
    // AdMobInterstitial.setAdUnitID(INTERSTITIAL_ID);
    // AdMobInterstitial.setTestDeviceID('EMULATOR');
    // AdMobRewarded.setAdUnitID(REWARDED_ID);
    // AdMobRewarded.setTestDeviceID('EMULATOR');
  }

  fetchDefaultVideo = () => {
    const defaultYoutubeId = defaultMovie.youtubeId;
    const defaultUri = `${FileSystem.documentDirectory}${defaultYoutubeId}.mp4`;
    // const defaultUri = FileSystem.cacheDirectory + 'test2.mp4';
    FileSystem.getInfoAsync(defaultUri)
      .then(({ exists }) => {
        if (exists) {
          this.setState({ initialized: exists, defaultUri });
        } else {
          this.writeDocument(this.state.introRemoteUri, defaultUri);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      });
  }

  setProgress = (downloadProgress) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    // eslint-disable-next-line
    console.log(progress);
    this.setState({
      progress,
    });
  };

  writeDocument = async (remoteUri, localUri) => {
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUri,
      localUri,
      {},
      this.setProgress,
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      // eslint-disable-next-line
      console.log('Finished downloading to ', uri);
      this.setState({ initialized: true, defaultUri: uri });
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }

  openInterstitial = async () => {
    await AdMobInterstitial.requestAdAsync();
    await AdMobInterstitial.showAdAsync();
  };

  openRewarded = async () => {
    await AdMobRewarded.requestAdAsync();
    await AdMobRewarded.showAdAsync();
  };

  render() {
    const progressBar = this.state.progress ? (
      <Circle
        progress={this.state.progress}
        size={120}
        borderWidth={0}
        color={designLanguage.colorPrimary}
        style={{ alignSelf: 'center' }}
        textStyle={{ fontSize: 32 }}
        endAngle={1}
        showsText
        thickness={8}
        strokeCap="round"
      />
    ) : null;

    if (!this.state.initialized) {
      // if (true) {
      const loadingText = `Loading(${defaultMovie.fileSize})`;
      return (
        <View style={[styles.container, { justifyContent: 'center' }]} >
          <Text style={styles.loading}>
            {this.state.progress && loadingText}
          </Text>
          {progressBar}
          <Text style={styles.desc}>
            {this.state.progress && desc}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <VideoPane
          style={styles.videoPlayer}
          defaultUri={this.state.defaultUri}
        />
        <UnderPane />
      </View>
    );
  }
}

// <AdMobBanner
//   bannerSize="smartBannerPortrait"
//   adUnitID={BANNER_ID}
//   didFailToReceiveAdWithError={this.bannerError}
// />
// <PublisherBanner
//   bannerSize="fullBanner"
//   style={{ display: 'none' }}
//   adUnitID={BANNER_ID}
//   onDidFailToReceiveAdWithError={this.bannerError}
//   onAdMobDispatchAppEvent={this.adMobEvent}
// />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: designLanguage.color50,
  },
  loading: {
    padding: 32,
    color: designLanguage.colorPrimary,
    textAlign: 'center',
    fontSize: 24,
  },
  videoPlayer: {
    zIndex: 100,
  },
  desc: {
    paddingTop: 32,
    padding: 16,
    color: designLanguage.colorPrimary,
    fontSize: 16,
  },
});

export default Home;

// eslint-disable-next-line
// dangerous = () => {
//     const db = firebase.firestore();
//     videosRef = db.collection('videos');
//     videosRef.get()
//       .then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//           ref = db.collection('videos').doc(doc.id);
//           ref.update({
//               "advanced": [],
//               "failure": [],
//               "practice": [],
//               "point": [],
//               "advice": '',
//           })
//           .then(function() {
//               console.log("Document successfully updated!");
//           });
//         });
//       });
// }
