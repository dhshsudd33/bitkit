import React, { ReactElement, useState } from 'react';
import {
	View,
	Alert,
	StyleSheet,
	Platform,
	useWindowDimensions,
	ViewProps,
} from 'react-native';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';

import {
	ClipboardTextIcon,
	PictureIcon,
	FlashlightIcon,
	AnimatedView,
	Text02M,
} from '../../styles/components';
import useColors from '../../hooks/colors';
import Camera from '../../components/Camera';
import { decodeQRData, handleData } from '../../utils/scanner';
import Store from '../../store/types';
import SafeAreaView from '../../components/SafeAreaView';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';

const Blur = (props: ViewProps): ReactElement =>
	Platform.OS === 'ios' ? <BlurView {...props} /> : <View {...props} />;

const ScannerScreen = ({ navigation }): ReactElement => {
	const { white08, white5 } = useColors();
	const dimensions = useWindowDimensions();
	const [flashMode, setFlashMode] = useState(false);
	const [error, setError] = useState('');

	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const showError = (text: string): void => {
		setError(text);
		setTimeout(() => setError(''), 5000);
	};

	const onRead = async (data): Promise<void> => {
		const res = await decodeQRData(data, selectedNetwork);

		if (res.isErr() || (res.isOk() && res.value.length === 0)) {
			showError('Sorry. Bitkit can’t read this QR code.');
			return;
		}

		navigation.pop();

		const qrData = res.value;
		if (qrData.length === 1) {
			return await handleData({
				data: qrData[0],
				selectedNetwork,
				selectedWallet,
			});
		} else {
			//Multiple payment requests, like bitcoin and lightning in on QR. Show them the options they have and then handle the selected one.
			Alert.alert('How would you like to pay?', '', [
				{
					text: 'Cancel',
					onPress: (): void => {},
					style: 'cancel',
				},
				...qrData.map((selectedOption) => ({
					text: selectedOption.qrDataType,
					onPress: async (): Promise<void> =>
						await handleData({
							data: selectedOption,
							selectedNetwork,
							selectedWallet,
						}),
				})),
			]);
		}
	};

	const onPickFile = async (): Promise<void> => {
		try {
			const result = await launchImageLibrary({
				// Use 'mixed' so the user can search folders other than "Photos"
				mediaType: 'mixed',
				includeBase64: true,
				quality: 0.1,
			});

			if (result.assets?.[0]) {
				const { uri } = result.assets?.[0];

				try {
					// Read QR from image
					const { values } = await RNQRGenerator.detect({ uri });

					if (values.length === 0) {
						showError(
							'Sorry. Bitkit wasn’t able to detect a QR code in this image.',
						);
						return;
					}

					onRead(values[0]);
				} catch {
					showError(
						'Sorry. Bitkit wasn’t able to detect a QR code in this image.',
					);
				}
			}
		} catch (err) {
			console.error('Failed to open image file: ', err);
			showError('Sorry. An error occured when trying to open this image file.');
		}
	};

	return (
		<SafeAreaView>
			<Camera
				onBarCodeRead={onRead}
				onClose={(): void => {}}
				flashMode={flashMode}>
				<>
					<SafeAreaInsets type="top" />
					<NavigationHeader
						style={styles.navigationHeader}
						title={'Scan any QR code'}
						displayBackButton
					/>

					<View style={StyleSheet.absoluteFill}>
						<Blur style={styles.mask} />
						<View style={styles.maskCenter}>
							<Blur style={styles.mask} />
							<View
								style={{
									height: dimensions.height / 2.4,
									width: dimensions.width - 16 * 2,
								}}>
								<View style={styles.actionsRow}>
									<TouchableOpacity
										style={[styles.actionButton, { backgroundColor: white08 }]}
										activeOpacity={1}
										onPress={onPickFile}>
										<PictureIcon width={24} height={24} />
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											styles.actionButton,
											{ backgroundColor: flashMode ? white5 : white08 },
										]}
										activeOpacity={1}
										onPress={(): void =>
											setFlashMode((prevState) => !prevState)
										}>
										<FlashlightIcon width={24} height={24} />
									</TouchableOpacity>
								</View>
							</View>
							<Blur style={styles.mask} />
						</View>
						<Blur style={[styles.mask, styles.bottom]}>
							<Button
								style={styles.pasteButton}
								icon={<ClipboardTextIcon width={16} height={16} />}
								text={'Paste QR Code'}
								size="large"
								onPress={async (): Promise<void> => {
									let url = await Clipboard.getString();
									onRead(url);
								}}
							/>

							{!!error && (
								<AnimatedView
									color="transparent"
									entering={FadeIn}
									exiting={FadeOut}>
									<Text02M style={styles.error} color="brand">
										{error}
									</Text02M>
								</AnimatedView>
							)}
						</Blur>
					</View>
				</>
			</Camera>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	navigationHeader: {
		zIndex: 100,
	},
	mask: {
		backgroundColor: 'rgba(0, 0, 0, 0.64)',
		flex: 1,
		alignItems: 'center',
	},
	maskCenter: {
		flexDirection: 'row',
	},
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 16,
	},
	actionButton: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 32,
		minWidth: 32,
		borderRadius: 50,
		padding: 13,
	},
	bottom: {
		paddingHorizontal: 16,
	},
	pasteButton: {
		marginHorizontal: 16,
		marginTop: 16,
		width: '100%',
	},
	error: {
		marginHorizontal: 16,
		marginTop: 32,
		textAlign: 'center',
	},
});

export default ScannerScreen;
