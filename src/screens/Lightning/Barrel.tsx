import React, { memo, ReactElement, useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

import useColors from '../../hooks/colors';
import useDisplayValues from '../../hooks/displayValues';
import { TouchableOpacity } from '../../styles/components';
import { Subtitle } from '../../styles/text';
import { TPackages } from './CustomSetup';

const Barrel = ({
	active,
	id,
	amount,
	img,
	onPress,
}: {
	active: boolean;
	id: TPackages['id'];
	amount: number;
	img: ImageSourcePropType;
	onPress: (id: TPackages['id']) => void;
}): ReactElement => {
	const colors = useColors();
	const style = useMemo(
		() =>
			active ? [styles.bRoot, { borderColor: colors.purple }] : styles.bRoot,
		[active, colors.purple],
	);
	const dp = useDisplayValues(Number(amount));

	return (
		<TouchableOpacity
			color="purple16"
			style={style}
			onPress={(): void => onPress(id)}>
			<Image style={styles.bImage} source={img} />
			<Subtitle style={styles.bAmount}>
				{dp.fiatSymbol} {dp.fiatWhole}
			</Subtitle>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	bRoot: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		marginHorizontal: 8,
		borderRadius: 8,
		borderWidth: 1,
	},
	bImage: {
		margin: 8,
		height: 100,
		width: 100,
		resizeMode: 'contain',
	},
	bAmount: {
		marginTop: 8,
		marginBottom: 16,
		textAlign: 'center',
	},
});

export default memo(Barrel);
