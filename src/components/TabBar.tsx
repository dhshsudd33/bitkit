import React, { ReactElement, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { receiveIcon, sendIcon } from '../assets/icons/tabs';
import { showBottomSheet } from '../store/actions/ui';
import useColors from '../hooks/colors';
import { useAppSelector } from '../hooks/redux';
import { Text02M } from '../styles/text';
import { ScanIcon } from '../styles/icons';
import BlurView from '../components/BlurView';
import type { RootNavigationProp } from '../navigation/types';
import { betaRiskAcceptedSelector } from '../store/reselect/user';

const TabBar = ({
	navigation,
}: {
	navigation: RootNavigationProp;
}): ReactElement => {
	const { white08 } = useColors();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation('wallet');
	const betaRiskAccepted = useAppSelector(betaRiskAcceptedSelector);

	const onReceivePress = useCallback((): void => {
		if (betaRiskAccepted) {
			showBottomSheet('receiveNavigation');
		} else {
			navigation.navigate('BetaRisk');
		}
	}, [betaRiskAccepted, navigation]);

	const onSendPress = useCallback((): void => {
		showBottomSheet('sendNavigation');
	}, []);

	const openScanner = useCallback(
		() => navigation.navigate('Scanner'),
		[navigation],
	);

	const borderStyles = useMemo(() => {
		const androidStyles = {
			borderColor: white08,
			borderTopColor: '#272727',
			borderBottomColor: '#272727',
		};

		const iosStyles = {
			borderColor: white08,
		};
		return Platform.OS === 'android' ? androidStyles : iosStyles;
	}, [white08]);

	const bottom = useMemo(() => Math.max(insets.bottom, 16), [insets.bottom]);

	const sendXml = useMemo(() => sendIcon('white'), []);
	const receiveXml = useMemo(() => receiveIcon('white'), []);

	return (
		<View style={[styles.tabRoot, { bottom }]}>
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={onSendPress}
				style={styles.blurContainer}
				testID="Send">
				<BlurView style={styles.send}>
					<SvgXml xml={sendXml} width={13} height={13} />
					<Text02M style={styles.tabText}>{t('send')}</Text02M>
				</BlurView>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={openScanner}
				activeOpacity={0.8}
				style={[styles.tabScan, borderStyles]}>
				<ScanIcon width={32} height={32} />
			</TouchableOpacity>
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={onReceivePress}
				style={styles.blurContainer}
				testID="Receive">
				<BlurView style={styles.receive}>
					<SvgXml xml={receiveXml} width={13} height={13} />
					<Text02M style={styles.tabText}>{t('receive')}</Text02M>
				</BlurView>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	tabRoot: {
		position: 'absolute',
		left: 16,
		right: 16,
		height: 80,
		flexDirection: 'row',
		alignItems: 'center',
		// fix TabBar zIndex on Android
		zIndex: 0,
	},
	blurContainer: {
		height: 56,
		flex: 1,
	},
	send: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingRight: 30,
		borderRadius: 30,
	},
	receive: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingLeft: 30,
		borderRadius: 30,
	},
	tabScan: {
		height: 80,
		width: 80,
		backgroundColor: '#101010',
		borderRadius: 40,
		borderWidth: 2,
		marginHorizontal: -40,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
	},
	tabText: {
		marginLeft: 6,
	},
});

export default TabBar;
