import React, {
	memo,
	ReactElement,
	ReactNode,
	useCallback,
	useMemo,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Subtitle, Text02M } from '../../styles/text';
import { groupActivityItems } from '../../utils/activity';
import { showBottomSheet } from '../../store/actions/ui';
import { IActivityItemFormatted } from '../../store/types/activity';
import { activityItemsSelector } from '../../store/reselect/activity';
import Button from '../../components/Button';
import ListItem, { EmptyItem } from './ListItem';
import type { RootNavigationProp } from '../../navigation/types';

const MAX_ACTIVITY_ITEMS = 3;

const ActivityListShort = (): ReactElement => {
	const { t } = useTranslation('wallet');
	const navigation = useNavigation<RootNavigationProp>();
	const items = useSelector(activityItemsSelector);

	const groupedItems = useMemo(() => {
		const activityItems = items.slice(0, MAX_ACTIVITY_ITEMS);
		return groupActivityItems(activityItems);
	}, [items]);

	const renderItem = useCallback(
		// eslint-disable-next-line react/no-unused-prop-types
		({ item }: { item: string | IActivityItemFormatted }): ReactNode => {
			if (typeof item === 'string') {
				return;
			}

			return (
				<ListItem
					key={item.id}
					item={item}
					onPress={(): void =>
						navigation.navigate('ActivityDetail', { id: item.id })
					}
				/>
			);
		},
		[navigation],
	);

	const navigateToReceive = useCallback((): void => {
		showBottomSheet('receiveNavigation');
	}, []);

	const navigateToActivityFiltered = useCallback((): void => {
		navigation.navigate('Wallet', { screen: 'ActivityFiltered' });
	}, [navigation]);

	return (
		<View style={styles.content}>
			<Subtitle style={styles.title}>{t('activity')}</Subtitle>

			{groupedItems.length === 0 ? (
				<EmptyItem onPress={navigateToReceive} />
			) : (
				<>
					{groupedItems.map((item) => renderItem({ item }))}
					<Button
						style={styles.button}
						text={<Text02M color="white8">{t('activity_show_all')}</Text02M>}
						size="large"
						variant="transparent"
						onPress={navigateToActivityFiltered}
					/>
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingTop: 30,
		marginBottom: 16,
	},
	title: {
		marginBottom: 23,
	},
	button: {
		marginTop: -16,
	},
});

export default memo(ActivityListShort);
