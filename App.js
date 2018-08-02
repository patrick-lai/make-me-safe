import React from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  AlertIOS,
  AsyncStorage
} from 'react-native';
import { Constants, Location, Permissions } from 'expo';
import LottieView from 'lottie-react-native';
import _get from 'lodash/get';

export default class App extends React.Component {
  state = {
    location: null,
    errorMessage: null
  };

  async componentDidMount() {
    this.animation.play();
    // Or set a specific startFrame and endFrame with:
    this.animation.play(30, 120);

    const username = await AsyncStorage.getItem('USERNAME');

    this.setState({ username });

    if (!username) {
      AlertIOS.prompt(
        'What is your name',
        null,
        async username =>
          await AsyncStorage.setItem('USERNAME', username, () => {
            this.setState({ username });
          })
      );
    }
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage:
          'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

  render() {
    let text = 'Waiting..';
    let long = _get(this.state, 'location.coords.longitude');
    let lat = _get(this.state, 'location.coords.latitude');

    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location, null, 2);
    }

    const { latitude, longitude } = text;

    const ready = long && lat;

    return (
      <View style={styles.container}>
        <Text>You are registered as {this.state.username}</Text>
        <View>
          {ready && (
            <Text>
              Long:{parseFloat(long).toFixed(2)}, Lat:
              {parseFloat(lat).toFixed(2)}
            </Text>
          )}
        </View>
        <LottieView
          style={{ marginTop: 100 }}
          ref={animation => {
            this.animation = animation;
          }}
          source={require('./lottie/location.json')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
