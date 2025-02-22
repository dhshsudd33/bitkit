import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Switch } from '../../../styles/components';
import { Text01S, Text01M } from '../../../styles/text';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import GradientView from '../../../components/GradientView';
import GlowImage from '../../../components/GlowImage';
import Button from '../../../components/Button';
import { closeBottomSheet } from '../../../store/actions/ui';
import { updateSettings } from '../../../store/actions/settings';
import { pinForPaymentsSelector } from '../../../store/reselect/settings';
import type { PinScreenProps } from '../../../navigation/types';

const imageSrc = require('../../../assets/illustrations/check.png');

const Result = ({ route }: PinScreenProps<'Result'>): ReactElement => {
	const { bio, type } = route.params;
	const { t } = useTranslation('security');
	const insets = useSafeAreaInsets();
	const pinForPayments = useSelector(pinForPaymentsSelector);

	const biometricsName = useMemo(
		() =>
			type === 'TouchID'
				? t('bio_touch_id')
				: type === 'FaceID'
				? t('bio_face_id')
				: type ?? t('bio'),
		[type, t],
	);

	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 16,
		}),
		[insets.bottom],
	);

	const handleTogglePress = (): void => {
		updateSettings({ pinForPayments: !pinForPayments });
	};

	const handleButtonPress = (): void => {
		closeBottomSheet('PINNavigation');
	};

	return (
		<GradientView style={styles.container}>
			<BottomSheetNavigationHeader
				title={t('success_title')}
				displayBackButton={false}
			/>

			<View style={styles.message}>
				{bio ? (
					<Text01S color="gray1">
						{t('success_bio', { biometricsName })}
					</Text01S>
				) : (
					<Text01S color="gray1">{t('success_no_bio')}</Text01S>
				)}
			</View>

			<GlowImage image={imageSrc} imageSize={200} glowColor="green" />

			<Pressable
				style={styles.toggle}
				onPress={handleTogglePress}
				testID="ToggleBioForPayments">
				<Text01M>{t('success_payments')}</Text01M>
				<Switch onValueChange={handleTogglePress} value={pinForPayments} />
			</Pressable>

			<View style={nextButtonContainer}>
				<Button
					size="large"
					text={t('ok')}
					onPress={handleButtonPress}
					testID="OK"
				/>
			</View>
		</GradientView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	message: {
		marginHorizontal: 32,
		alignSelf: 'flex-start',
	},
	toggle: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 32,
		marginBottom: 32,
	},
	nextButtonContainer: {
		marginTop: 'auto',
		paddingHorizontal: 32,
		width: '100%',
	},
});

export default memo(Result);
