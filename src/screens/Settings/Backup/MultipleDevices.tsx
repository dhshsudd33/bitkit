import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text01S } from '../../../styles/text';
import GradientView from '../../../components/GradientView';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import GlowImage from '../../../components/GlowImage';
import Button from '../../../components/Button';
import type { BackupScreenProps } from '../../../navigation/types';

const imageSrc = require('../../../assets/illustrations/phone.png');

const MultipleDevices = ({
	navigation,
}: BackupScreenProps<'MultipleDevices'>): ReactElement => {
	const { t } = useTranslation('security');
	const insets = useSafeAreaInsets();
	const buttonContainerStyles = useMemo(
		() => ({
			...styles.buttonContainer,
			paddingBottom: insets.bottom + 16,
		}),
		[insets.bottom],
	);

	const handleButtonPress = (): void => {
		navigation.navigate('Metadata');
	};

	return (
		<GradientView style={styles.container}>
			<BottomSheetNavigationHeader title={t('mnemonic_multiple_header')} />

			<Text01S color="gray1" style={styles.text}>
				{t('mnemonic_multiple_text')}
			</Text01S>

			<GlowImage image={imageSrc} imageSize={200} glowColor="yellow" />

			<View style={buttonContainerStyles}>
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
	text: {
		paddingHorizontal: 32,
	},
	buttonContainer: {
		marginTop: 'auto',
		paddingHorizontal: 32,
		width: '100%',
	},
});

export default memo(MultipleDevices);
