import React, { ReactElement, memo, useMemo, useState, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import {
	View as ThemedView,
	Caption13S,
	TouchableOpacity as ThemedTouchableOpacity,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import SearchInput from '../../components/SearchInput';
import ActivityList from './ActivityList';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import Store from '../../store/types';
import {
	updateSearchFilter,
	updateTypesFilter,
	resetActivityFilterStore,
} from '../../store/actions/activity';
import { EActivityTypes } from '../../store/types/activity';

const Blur = Platform.OS === 'ios' ? BlurView : View;

const Tab = ({
	text,
	active = false,
	...props
}: {
	text: string;
	active?: boolean;
}): ReactElement => {
	return (
		<ThemedTouchableOpacity
			style={styles.tab}
			color={active ? 'gray3' : 'white08'}
			{...props}>
			<Caption13S color={active ? 'white' : 'gray1'}>{text}</Caption13S>
		</ThemedTouchableOpacity>
	);
};

const ActivityFiltered = (): ReactElement => {
	const { searchFilter, typesFilter } = useSelector(
		(state: Store) => state.activity,
	);
	const insets = useSafeAreaInsets();
	const [radiusContainerHeight, setRadiusContainerHeight] = useState(0);
	const activityPadding = useMemo(
		() => ({ paddingTop: radiusContainerHeight, paddingBottom: insets.bottom }),
		[radiusContainerHeight, insets.bottom],
	);

	useEffect(() => {
		return (): void => resetActivityFilterStore();
	}, []);

	const handleChangeTab = (tab): void => {
		updateTypesFilter([tab]);
	};

	return (
		<ThemedView style={styles.container}>
			<View style={styles.txListContainer}>
				<ActivityList
					// assetFilter={assetFilter}
					style={styles.txList}
					showTitle={false}
					contentContainerStyle={activityPadding}
					progressViewOffset={radiusContainerHeight + 10}
				/>
			</View>

			<View
				style={styles.radiusContainer}
				onLayout={(e): void => {
					const hh = e.nativeEvent.layout.height;
					setRadiusContainerHeight((h) => (h === 0 ? hh : h));
				}}>
				<Blur>
					<SafeAreaInsets type="top" />
					<NavigationHeader title="All Activity" />
					<View style={styles.formContainer}>
						<SearchInput
							style={styles.searchInput}
							value={searchFilter}
							onChangeText={updateSearchFilter}
						/>
						<View style={styles.tabContainer}>
							{Object.keys(EActivityTypes).map((i) => (
								<Tab
									key={i}
									text={i}
									active={typesFilter.includes(i)}
									onPress={(): void => handleChangeTab(i)}
								/>
							))}
						</View>
					</View>
				</Blur>
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	radiusContainer: {
		overflow: 'hidden',
		borderBottomRightRadius: 16,
		borderBottomLeftRadius: 16,
	},
	txListContainer: {
		flex: 1,
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	txList: {
		paddingHorizontal: 16,
	},
	formContainer: {
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	searchInput: {
		marginBottom: 16,
	},
	tabContainer: {
		marginHorizontal: -2,
		flexDirection: 'row',
	},
	tab: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 4,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 4,
	},
});

export default memo(ActivityFiltered);
