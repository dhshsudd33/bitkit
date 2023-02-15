import React, { memo, ReactElement, useMemo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caption13Up } from '../../../styles/text';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import GradientView from '../../../components/GradientView';
import Button from '../../../components/Button';
import Store from '../../../store/types';
import { EFeeId } from '../../../store/types/fees';
import { useBalance } from '../../../hooks/wallet';
import { showErrorNotification } from '../../../utils/notifications';
import {
	getTotalFee,
	getTransactionOutputValue,
	updateFee,
} from '../../../utils/wallet/transactions';
import FeeItem from './FeeItem';
import type { SendScreenProps } from '../../../navigation/types';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
	transactionSelector,
} from '../../../store/reselect/wallet';

const FeeRate = ({ navigation }: SendScreenProps<'FeeRate'>): ReactElement => {
	const insets = useSafeAreaInsets();
	const selectedWallet = useSelector(selectedWalletSelector);
	const selectedNetwork = useSelector(selectedNetworkSelector);
	const transaction = useSelector(transactionSelector);
	const feeEstimates = useSelector((store: Store) => store.fees.onchain);
	const balance = useBalance({ onchain: true });

	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 16,
		}),
		[insets.bottom],
	);

	const selectedFeeId = useMemo(
		() => transaction.selectedFeeId,
		[transaction.selectedFeeId],
	);

	const transactionTotal = useCallback(() => {
		return getTransactionOutputValue({
			selectedWallet,
			selectedNetwork,
			outputs: transaction.outputs,
		});
	}, [selectedNetwork, selectedWallet, transaction.outputs]);

	const satsPerByte = useMemo(
		(): number => transaction.satsPerByte ?? 1,
		[transaction.satsPerByte],
	);

	const getFee = useCallback(
		(_satsPerByte: number) => {
			const message = transaction.message;
			return getTotalFee({
				satsPerByte: _satsPerByte,
				message,
				selectedWallet,
				selectedNetwork,
			});
		},
		[selectedNetwork, selectedWallet, transaction.message],
	);

	const _updateFee = useCallback(
		(feeId: EFeeId, _satsPerByte: number) => {
			const res = updateFee({
				selectedWallet,
				selectedNetwork,
				transaction,
				satsPerByte: _satsPerByte,
				selectedFeeId: feeId,
			});
			if (res.isErr()) {
				showErrorNotification({
					title: 'Error Updating Fee',
					message: res.error.message,
				});
			}
		},
		[selectedNetwork, selectedWallet, transaction],
	);

	const displayFast = useMemo(() => {
		return balance.satoshis >= transactionTotal() + getFee(feeEstimates.fast);
	}, [balance.satoshis, feeEstimates.fast, getFee, transactionTotal]);
	const displayNormal = useMemo(
		() => balance.satoshis >= transactionTotal() + getFee(feeEstimates.normal),
		[balance.satoshis, feeEstimates.normal, getFee, transactionTotal],
	);
	const displaySlow = useMemo(
		() => balance.satoshis >= transactionTotal() + getFee(feeEstimates.slow),
		[balance.satoshis, feeEstimates.slow, getFee, transactionTotal],
	);
	const displayCustom = useMemo(
		() => balance.satoshis >= transactionTotal() + getFee(1),
		[balance.satoshis, getFee, transactionTotal],
	);

	const isSelected = useCallback(
		(id: EFeeId) => id === selectedFeeId,
		[selectedFeeId],
	);

	const onCardPress = useCallback(
		(feeId: EFeeId, fee: number) => {
			_updateFee(feeId, fee);
			navigation.goBack();
		},
		[_updateFee, navigation],
	);

	const onCustomPress = useCallback(() => {
		onCardPress(EFeeId.custom, satsPerByte);
		navigation.navigate('FeeCustom');
	}, [satsPerByte, navigation, onCardPress]);

	return (
		<GradientView style={styles.container}>
			<BottomSheetNavigationHeader title="Speed" />
			<View style={styles.content}>
				<Caption13Up color="gray1" style={styles.title}>
					Speed and fee
				</Caption13Up>

				{displayFast && (
					<FeeItem
						id={EFeeId.fast}
						sats={getFee(feeEstimates.fast)}
						isSelected={isSelected(EFeeId.fast)}
						onPress={(): void => {
							onCardPress(EFeeId.fast, feeEstimates.fast);
						}}
					/>
				)}
				{displayNormal && (
					<FeeItem
						id={EFeeId.normal}
						sats={getFee(feeEstimates.normal)}
						isSelected={isSelected(EFeeId.normal)}
						onPress={(): void => {
							onCardPress(EFeeId.normal, feeEstimates.normal);
						}}
					/>
				)}
				{displaySlow && (
					<FeeItem
						id={EFeeId.slow}
						sats={getFee(feeEstimates.slow)}
						isSelected={isSelected(EFeeId.slow)}
						onPress={(): void => {
							onCardPress(EFeeId.slow, feeEstimates.slow);
						}}
					/>
				)}
				{displayCustom && (
					<FeeItem
						id={EFeeId.custom}
						sats={selectedFeeId === EFeeId.custom ? getFee(satsPerByte) : 0}
						isSelected={isSelected(EFeeId.custom)}
						onPress={onCustomPress}
					/>
				)}
				<View style={nextButtonContainer}>
					<Button
						size="large"
						text="Continue"
						disabled={selectedFeeId === EFeeId.none}
						onPress={(): void => navigation.navigate('ReviewAndSend')}
					/>
				</View>
			</View>
		</GradientView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	title: {
		marginBottom: 16,
		marginLeft: 16,
	},
	nextButtonContainer: {
		marginTop: 'auto',
		paddingHorizontal: 16,
	},
});

export default memo(FeeRate);
