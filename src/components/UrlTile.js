import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Linking,
  Alert,
} from 'react-native';

import designLanguage from '../../designLanguage.json';

class UrlTile extends React.Component {
  state = {}

  onPress = (url) => {
    Linking.openURL(url).catch(err => Alert.alert('ページを開ませんでした。', err));
  }

  render() {
    const {
      title,
      url,
      show,
    } = this.props;

    if (!show) { return null; }

    return (
      <View style={styles.container} >
        <View style={styles.title}>
          <Text style={styles.titleText}>
            {title}
          </Text>
        </View>
        <View style={styles.tips}>
          <TouchableHighlight style={styles.container} onPress={() => this.onPress(url)} underlayColor="transparent">
            <Text style={styles.tipsItem}>
              {url}
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  title: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: designLanguage.color900,
  },
  tips: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  titleText: {
    color: designLanguage.color50,
    fontSize: 18,
    fontWeight: '600',
  },
  tipsItem: {
    color: designLanguage.color900,
    fontSize: 18,
  },
});

export default UrlTile;
