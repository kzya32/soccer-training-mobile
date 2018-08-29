import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {
  Constants,
  FileSystem,
} from 'expo';
import firebase from 'firebase';
import * as Animatable from 'react-native-animatable';

import designLanguage from '../../designLanguage.json';
import defaultMovie from '../../defaultMovie.json';
import DownloadButton from '../elements/DownloadButton.js';

class ContentTile extends React.Component {
  state = {
    hasLocalDocument: false,
    localUri: null,
    isLoading: false,
  }

  componentDidMount() {
    this.fetchSession();
    this.checkLocalDocument();
  }

  // eslint-disable-next-line
  fetchSession = () => {
    const { video } = this.props;
    const { id } = video;
    const db = firebase.firestore();
    const sessionRef = db.collection('sessions').doc(Constants.sessionId);
    sessionRef.onSnapshot((doc) => {
      if (doc.exists) {
        const currentVideoId = doc.data().currentVideo && doc.data().currentVideo.id;
        if (currentVideoId) {
          this.setState({ active: (currentVideoId === id) });
        } else {
          this.setState({ active: (defaultMovie.id === id) });
        }
      }
    });
  }

  checkLocalDocument = () => {
    const { video } = this.props;
    const youtubeId = video.data.youtubeData.id.videoId;
    // const path = `videos/withComment/${youtubeId}.mp4`;
    const localUri = `${FileSystem.documentDirectory}${youtubeId}.mp4`;
    FileSystem.getInfoAsync(localUri)
      .then(({ exists }) => {
        this.setState({ hasLocalDocument: exists, localUri });
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      });
  }

  updateSession = (videoUrl, video) => {
    const db = firebase.firestore();
    const sessionRef = db.collection('sessions').doc(Constants.sessionId);
    sessionRef.set({
      currentVideoUrl: videoUrl,
      currentVideo: video,
    }, { merge: true });
  }

  setProgress = (downloadProgress) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    // eslint-disable-next-line
    console.log(progress);
    this.setState({
      downloadProgress: progress,
    });
  };

  writeDocument = async (remoteUri) => {
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUri,
      this.state.localUri,
      {},
      this.setProgress,
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      // eslint-disable-next-line
      console.log('Finished downloading to ', uri);
      this.setState({ hasLocalDocument: true, isLoading: false });
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }

  getRemoteUri = (toDownload) => {
    const { video } = this.props;

    const storage = firebase.storage();
    const storageRef = storage.ref();
    const withoutCommentRef = storageRef.child(`video/withoutComment/${video.id}.mp4`);
    withoutCommentRef.getDownloadURL()
      .then((videoUrl) => {
        if (toDownload) {
          this.writeDocument(videoUrl);
        } else {
          this.updateSession(videoUrl, video);
        }
      })
      .catch(() => {
        const withCommentRef = storageRef.child(`video/withComment/${video.id}.mp4`);
        withCommentRef.getDownloadURL()
          .then((videoUrl) => {
            if (toDownload) {
              this.writeDocument(videoUrl);
            } else {
              this.updateSession(videoUrl, video);
            }
          })
          .catch((error) => {
            // eslint-disable-next-line
            console.log(error);
            Alert.alert('この動画は現在ダウンロードできません。');
          });
      });
  }

  deleteLocalVideo = async () => {
    FileSystem.deleteAsync(this.state.localUri)
      .then(() => {
        this.setState({ hasLocalDocument: false });
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      });
  }

  confirmDelete = async () => {
    Alert.alert(
      '選択した動画をアプリから削除してもよろしいですか？',
      undefined,
      [
        // eslint-disable-next-line
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: 'OK',
          onPress: this.deleteLocalVideo,
        },
      ],
      { cancelable: false },
    );
  }

  playLocalVideo = async () => {
    this.updateSession(this.state.localUri, this.props.video);
  }

  // eslint-disable-next-line
  onPressDownload = () => {
    if (this.state.hasLocalDocument) {
      this.confirmDelete();
    } else if (!this.state.isLoading) {
      this.setState({ isLoading: true });
      const toDownload = true;
      this.getRemoteUri(toDownload);
    }
  }

  // eslint-disable-next-line
  onPressTile = () => {
    // this.view.bounce(800);
    if (this.state.hasLocalDocument) {
      this.playLocalVideo();
    } else if (!this.state.active) {
      const toDownload = false;
      this.getRemoteUri(toDownload);
    }
  }

  // handleViewtRef = ref => this.view = ref;

  render() {
    const {
      video,
      index,
    } = this.props;

    const thumbnailUrl = video.data.youtubeData.snippet.thumbnails.high.url;
    // const { title } = video.data.youtubeData.snippet;
    // const desc = video.data.youtubeData.snippet.description;
    const { player } = video.data.tags;
    const tags = video.data.tags.desc;

    // const animation = index % 2 === 0 ? 'fadeInRightBig' : 'fadeInLeftBig';
    const animationAndroid = index % 2 === 0 ? 'zoomInLeft' : 'zoomInRight';
    const animationIOS = index % 2 === 0 ? 'flipInX' : 'flipInX';
    const delay = (index + 1) * 300;
    const isDefault = video.id === defaultMovie.id;

    const animation = Platform.OS === 'android' ? animationAndroid : animationIOS;

    return (
      <Animatable.View
        // ref={this.handleViewtRef}
        animation={animation}
        // animation="flipInX"
        iterationCount={1}
        direction="alternate"
        duration={1000}
        delay={delay}
        easing="ease"
      >
        <TouchableHighlight
          style={[
            styles.container,
            // eslint-disable-next-line
            this.state.active && { backgroundColor: designLanguage.color700 },
          ]}
          onPress={this.onPressTile}
          underlayColor="transparent"
        >
          <View>
            <View
              style={[styles.tile]}
            >
              <Image
                style={styles.thumbnail}
                source={{ uri: thumbnailUrl }}
                resizeMode="cover"
              />
              <View style={[styles.caption]}>
                <Text style={[styles.skill, this.state.active && styles.skillActive]}>
                  {tags.join('の')}
                </Text>
                <Text style={[styles.player, this.state.active && styles.playerActive]}>
                  {player.join(', ').replace('選手', '')}
                </Text>
              </View>
              <DownloadButton
                show={!isDefault}
                style={styles.downloadButton}
                onPress={this.onPressDownload}
                hasLocalDocument={this.state.hasLocalDocument}
                downloadProgress={this.state.downloadProgress}
                isLoading={this.state.isLoading}
                active={this.state.active}
              />
            </View>
          </View>
        </TouchableHighlight>
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 4,
    // paddingRight: 4,
  },
  tile: {
    flexDirection: 'row',
  },
  thumbnail: {
    flex: 2,
  },
  caption: {
    flex: 4,
    padding: 8,
    justifyContent: 'center',
  },
  player: {
    color: designLanguage.color800,
  },
  playerActive: {
    color: designLanguage.color100,
  },
  skill: {
    color: designLanguage.color900,
    fontWeight: '500',
    fontSize: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  skillActive: {
    color: designLanguage.color50,
  },
  downloadButton: {
    flex:1,
  },
});

export default ContentTile;
