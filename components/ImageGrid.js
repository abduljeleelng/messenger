import {Image, StyleSheet,TouchableOpacity,} from 'react-native';
import * as Permissions from 'expo-permissions';
import CameraRoll from "@react-native-community/cameraroll";
import PropTypes from 'prop-types';
import React from 'react';

import Grid from './Grid';

const keyExtractor = ({ uri }) => uri;

export default class ImageGrid extends React.Component {
  static propTypes = {
    onPressImage: PropTypes.func,
  };

  static defaultProps = {
    onPressImage: () => {},
  };

  // eslint-disable-next-line react/sort-comp
  loading = false;
  cursor = null;

  state = {
    images: [],
    photos:[],
  };

  componentDidMount() {
    this.getImages();
  }

  getImages = async after => {
    if (this.loading) return;
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL, );
    if (status == 'granted') {
      console.log('Camera roll permission denied');
      return;
    }

    this.loading = true;

    const results = await CameraRoll.getPhotos({first: 20, assetType:'Photos', after,});

    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Photos',
    })
    .then(r => {
      console.log(JSON.stringify(r))
      this.setState({ photos: r.edges });
    })
    .catch((err) => {
       //Error Loading Images
       console.log("Errors in loading images"+err);
    });
    
    
    console.log(JSON.stringify(results));

    const { edges,page_info: { has_next_page, end_cursor },} = results;
    ///console the data 
    console.log(edges);
    const loadedImages = this.state.photos.map(item => item.node.image);
    //const loadedImages = edges.map(item => item.node.image);

    this.setState(
      {
        images: this.state.images.concat(loadedImages),
      },
      () => {
        this.loading = false;
        this.cursor = has_next_page ? end_cursor : null;
      },
    );
  };

  getNextImages = () => {
    // Prevent loading the initial page after we've reached the end
    if (!this.cursor) return;

    this.getImages(this.cursor);
  };

  renderItem = ({ item: { uri }, size, marginTop, marginLeft }) => {
    const { onPressImage } = this.props;

    const style = {
      width: size,
      height: size,
      marginLeft,
      marginTop,
    };

    return (
      <TouchableOpacity
        key={uri}
        activeOpacity={0.75}
        onPress={() => onPressImage(uri)}
        style={style}
      >
        <Image source={{ uri }} style={styles.image} />
      </TouchableOpacity>
    );
  };

  render() {
    const { images } = this.state;

    return (
      <Grid
        data={images}
        renderItem={this.renderItem}
        keyExtractor={keyExtractor}
        onEndReached={this.getNextImages}
      />
    );
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
});
