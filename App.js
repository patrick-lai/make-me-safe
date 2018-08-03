import React from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  AlertIOS,
  AsyncStorage,
  Dimensions,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Constants, Location, Permissions, LinearGradient } from 'expo';
import LottieView from 'lottie-react-native';
import _get from 'lodash/get';
import _capitalize from 'lodash/capitalize';
import axios from 'axios';
import { iOSUIKit } from 'react-native-typography';
import lottieLocation from './lottie/location.json';
import lottieMsg from './lottie/send_message_done.json';
// import { Stream } from 'react-native-video-stream';

console.disableYellowBox = true;

const config = {
  // baseUrl: 'http://192.168.1.135:3000',
  baseUrl: 'http://172.20.10.10:3000',
  pollInterval: 1000 * 5
};

const { height, width } = Dimensions.get('window');

export default class App extends React.Component {
  state = {
    location: null,
    errorMessage: null,
    lottie: 'msg'
  };

  async componentDidMount() {
    this.animation.play();
    const username = await AsyncStorage.getItem('USERNAME');
    this.setState({ username });
    if (!username) this.updateName();

    // Make it cool...
    setTimeout(() => {
      this.setState({ lottie: 'location' });
    }, 1900);
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

  sendSms = () => {
    try {
      axios.post(config.baseUrl + '/help', {
        username: this.state.username,
        location: this.state.location
      });
    } catch (e) {
      // Maybe some logging
    }
  };

  sendSocketEvent = () => {
    // console.log(this.state.location);
  };

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      });
    }

    let location = await Location.getCurrentPositionAsync({
      timeInterval: 5000
    });

    this.setState({ location });
    this.sendSms();
  };

  updateName = () => {
    AlertIOS.prompt(
      'What is your name',
      null,
      async username =>
        await AsyncStorage.setItem('USERNAME', username, () => {
          this.setState({ username });
        })
    );
  };

  renderLottie = () => {
    if (this.state.lottie === 'msg') {
      return (
        <LottieView
          style={{ marginTop: 30, width: 200, height: 200 }}
          ref={animation => {
            this.animation = animation;
          }}
          source={lottieMsg}
          loop={false}
        />
      );
    }

    return (
      <LottieView
        style={{ marginTop: 20, width: 250, height: 210 }}
        ref={animation => {
          this.animation = animation;
          // Hacky but its fine
          this.animation.play();
        }}
        source={lottieLocation}
        loop={true}
      />
    );
  };
  render() {
    let text = 'Waiting..';
    let _lng = _get(this.state, 'location.coords.longitude');
    let _lat = _get(this.state, 'location.coords.latitude');

    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location, null, 2);
    }

    const { latitude, longitude } = text;
    const lat = parseFloat(_lat).toFixed(2);
    const lng = parseFloat(_lng).toFixed(2);

    const ready = _lng && _lat;

    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <LinearGradient
          colors={['#582c82', '#582c82', 'black']}
          style={{
            height: '100%',
            width: '100%',
            alignItems: 'center'
          }}
        >
          <View style={{ marginTop: height / 6, padding: 20, zIndex: 10 }}>
            <Text
              style={iOSUIKit.largeTitleEmphasizedWhite}
              onPress={this.updateName}
            >
              Stay calm {_capitalize(this.state.username)}!
            </Text>
          </View>
          <Text style={iOSUIKit.title3White}>
            Your friends and family are notified
          </Text>
          {this.renderLottie()}
          <View style={{ top: 100 }}>
            {ready && (
              <Text style={iOSUIKit.bodyWhite}>
                {lat}, {lng}
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }
}

// <Stream
//   started={false} // start your stream
//   cameraFronted={false} // camera front or back
//   url="rtmp://13.55.196.50:1935/overwatch/b" // your rtmp publish url
//   landscape={false} // landscape mode
//   onReady={() => {
//     console.log('I AM READY');
//   }} // streaming ready
//   onPending={() => {
//     console.log('I AM PENDING');
//   }} // streaming ready to start
//   onStart={() => {
//     console.log('I HAVE STARTED');
//   }} // streaming start
//   onError={e => {
//     console.log('@@ ERROR', e);
//   }} // straming error
//   onStop={() => {
//     console.log('I HAVE STOPPED');
//   }} // streaming stop
// />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
