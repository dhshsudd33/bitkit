import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { Feather, View } from '../../styles/components';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

const Header = (): ReactElement => {
	const navigation = useNavigation<DrawerNavigationProp<any>>();

	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				<Feather
					style={styles.rightIcon}
					onPress={(): void => navigation.navigate('ChainReactor')}
					name="shopping-cart"
					size={30}
				/>
			</View>
			<View style={styles.middleColumn} />
			<View style={styles.rightColumn}>
				<Feather
					style={styles.rightIcon}
					onPress={navigation.openDrawer}
					name="menu"
					size={30}
				/>
			</View>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginTop: 15,
		marginHorizontal: 10,
		marginBottom: 20,
	},
	rightIcon: {},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
	},
	middleColumn: {
		flex: 1.5,
		justifyContent: 'center',
	},
	rightColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
});

export default memo(Header);
