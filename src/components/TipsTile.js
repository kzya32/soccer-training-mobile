import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
} from 'react-native';

import designLanguage from '../../designLanguage.json';

class TipsTile extends React.Component {
  state = {}

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, index }) => (
    <View style={styles.tips}>
      <Text style={styles.tipsIndex}>
        {`${index + 1}`}
      </Text>
      <Text style={styles.tipsItem}>
        {item}
      </Text>
    </View>
  )

  render() {
    const {
      title,
      tipsArray,
    } = this.props;

    if (!(tipsArray && tipsArray.length)) { return null; }

    return (
      <View
        style={[
          styles.container,
        ]}
      >
        <View style={styles.title}>
          <Text style={styles.titleText}>
            {title}
          </Text>
        </View>
        <FlatList
          data={tipsArray}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          style={styles.tipsPane}
        />
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
  tipsPane: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  tips: {
    flexDirection: 'row',
  },
  titleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  tipsItem: {
    color: designLanguage.color900,
    fontSize: 18,
    paddingTop: 4,
    alignSelf: 'flex-start',
  },
  tipsIndex: {
    color: designLanguage.color900,
    fontSize: 18,
    alignSelf: 'flex-start',
    width: 16,
    paddingTop: 4,
  },
});

export default TipsTile;
