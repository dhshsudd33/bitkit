import React, { useEffect } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	Platform,
	NativeModules,
	Button,
} from 'react-native';
import Lottie from 'lottie-react-native';
import { material } from 'react-native-typography';
import Icon from 'react-native-vector-icons/Entypo';
import colors from './src/styles/colors';
import BitkitLogo from './src/assets/bitkit-logo.svg';
import RNQRGenerator from 'rn-qr-generator';
import QRCode from 'react-native-qrcode-svg';
import { MMKV } from 'react-native-mmkv';
import nodejs from 'nodejs-mobile-react-native';
import * as Keychain from 'react-native-keychain';
import { getKeychainValue, setKeychainValue } from './src/utils/helpers';

const storage = new MMKV();
storage.set('user.name', 'Name');
storage.set('user.age', 100);
const username = storage.getString('user.name');

if (Platform.OS === 'android') {
	setTimeout(NativeModules.SplashScreenModule.hide, 100);
}
function App(): JSX.Element {
	useEffect(() => {
		nodejs.start('main.js');
		nodejs.channel.addListener('message', (msg) => {
			alert('From node: ' + msg);
		});
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<Button
				title="Message Node"
				onPress={() => nodejs.channel.send('A message!')}
			/>
			<Button
				title={'Keychain'}
				onPress={async () => {
					const username = 'zuck';
					const password = 'poniesRgr8';

					await setKeychainValue({ key: password, value: username });
					// Store the credentials
					await Keychain.setGenericPassword(username, password);

					try {
						// Retrieve the credentials
						const credentials = await Keychain.getGenericPassword();
						if (credentials) {
							console.log(
								'Credentials successfully loaded for user ' +
									credentials.username,
							);
						} else {
							console.log('No credentials stored');
						}
					} catch (error) {
						console.log("Keychain couldn't be accessed!", error);
					}
					const res = await getKeychainValue({ key: password });
					alert(JSON.stringify(res));
					await Keychain.resetGenericPassword();
				}}
			/>
			<View style={styles.content}>
				<Lottie
					source={require('./src/assets/animations/boost.json')}
					autoPlay
					loop
				/>
				<Icon name="circle" size={80} color={colors.orange} />
				<BitkitLogo height={64} width={184} />
				<QRCode value="Some QR value" />
				<Text style={material.display1}>
					{Platform.OS === 'android'
						? `V8 version is ${global._v8runtime().version}`
						: 'Hello'}
				</Text>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'green',
	},
});

export default App;
