import React, {
	memo,
	PropsWithChildren,
	ReactElement,
	useEffect,
	useState,
} from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import lnd from '@synonymdev/react-native-lightning';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
} from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import { IActivityItem } from '../../../store/types/activity';
import { lnrpc } from '@synonymdev/react-native-lightning';
import useDisplayValues from '../../../utils/exchange-rate/useDisplayValues';

interface Props extends PropsWithChildren<any> {
	route: { params: { channel: lnrpc.IChannel } };
}

const LightningChannelDetails = (props: Props): ReactElement => {
	const {
		chanId,
		active,
		remoteBalance,
		localBalance,
		capacity,
		closeAddress,
		private: channelPrivate,
		totalSatoshisReceived,
		totalSatoshisSent,
		uptime,
	} = props.route.params.channel;

	const capacityDisplay = useDisplayValues(Number(capacity));
	const remoteBalanceDisplay = useDisplayValues(Number(remoteBalance));
	const localBalanceDisplay = useDisplayValues(Number(localBalance));
	const totalSatoshisReceivedDisplay = useDisplayValues(
		Number(totalSatoshisReceived),
	);
	const totalSatoshisSentDisplay = useDisplayValues(Number(totalSatoshisSent));

	let output = [['Channel ID', chanId]];

	output.push(['Active', `${active ? '✅' : '❌'}`]);
	output.push(['Private', `${channelPrivate ? '✅' : '❌'}`]);
	output.push([
		'Capacity',
		`${capacityDisplay.bitcoinSymbol}${capacityDisplay.bitcoinFormatted} (${capacityDisplay.fiatSymbol}${capacityDisplay.fiatFormatted})`,
	]);
	output.push([
		'Uptime',
		new Date(Number(uptime) * 1000).toISOString().substr(11, 8),
	]);
	output.push([
		'Can receive',
		`${remoteBalanceDisplay.bitcoinSymbol}${remoteBalanceDisplay.bitcoinFormatted} (${remoteBalanceDisplay.fiatSymbol}${remoteBalanceDisplay.fiatFormatted})`,
	]);
	output.push([
		'Can send',
		`${localBalanceDisplay.bitcoinSymbol}${localBalanceDisplay.bitcoinFormatted} (${localBalanceDisplay.fiatSymbol}${localBalanceDisplay.fiatFormatted})`,
	]);
	output.push([
		'Total received',
		`${totalSatoshisReceivedDisplay.bitcoinSymbol}${totalSatoshisReceivedDisplay.bitcoinFormatted} (${totalSatoshisReceivedDisplay.fiatSymbol}${totalSatoshisReceivedDisplay.fiatFormatted})`,
	]);
	output.push([
		'Total sent',
		`${totalSatoshisSentDisplay.bitcoinSymbol}${totalSatoshisSentDisplay.bitcoinFormatted} (${totalSatoshisSentDisplay.fiatSymbol}${totalSatoshisSentDisplay.fiatFormatted})`,
	]);
	output.push(['Close address', closeAddress]);

	return (
		<View style={styles.container}>
			<NavigationHeader title={'Channel'} />
			<ScrollView>
				<View style={styles.content}>
					{output.map(([title, value]) => (
						<View style={styles.item} key={title}>
							<Text style={styles.itemTitle}>{title}:</Text>
							<Text style={styles.itemValue}>{value}</Text>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		margin: 20,
	},
	item: {
		marginBottom: 20,
	},
	itemTitle: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	itemValue: {
		fontWeight: '300',
		marginTop: 5,
		fontSize: 14,
	},
});

export default memo(LightningChannelDetails);
