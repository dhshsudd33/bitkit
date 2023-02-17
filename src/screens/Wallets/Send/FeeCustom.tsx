import React, {
	ReactElement,
	memo,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caption13Up, Text01S } from '../../../styles/text';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import GradientView from '../../../components/GradientView';
import Button from '../../../components/Button';
import FeeCustomToggle from './FeeCustomToggle';
import FeeNumberPad from './FeeNumberPad';
import { getTotalFee } from '../../../utils/wallet/transactions';
import useDisplayValues from '../../../hooks/displayValues';
import { transactionSelector } from '../../../store/reselect/wallet';
import type { SendScreenProps } from '../../../navigation/types';
import { onChainFeesSelector } from '../../../store/reselect/fees';
import Dialog from '../../../components/Dialog';

const FeeCustom = ({
	navigation,
}: SendScreenProps<'FeeCustom'>): ReactElement => {
	const insets = useSafeAreaInsets();
	const transaction = useSelector(transactionSelector);
	const feeEstimates = useSelector(onChainFeesSelector);

	const [displayFeeDialog, setDisplayFeeDialog] = useState(false);

	const buttonContainerStyles = useMemo(
		() => ({
			...styles.buttonContainer,
			paddingBottom: insets.bottom + 16,
		}),
		[insets.bottom],
	);

	const getFee = useCallback(
		(_satsPerByte = 1) => {
			const message = transaction?.message;
			return getTotalFee({
				satsPerByte: _satsPerByte,
				message,
			});
		},
		[transaction?.message],
	);

	const feeSats = useMemo(
		() => getFee(transaction.satsPerByte),
		[getFee, transaction.satsPerByte],
	);
	const totalFeeDisplay = useDisplayValues(feeSats);
	const feeAmount = useMemo(
		() =>
			totalFeeDisplay.fiatFormatted !== '—'
				? ` (${totalFeeDisplay.fiatSymbol} ${totalFeeDisplay.fiatFormatted})`
				: '',
		[totalFeeDisplay.fiatFormatted, totalFeeDisplay.fiatSymbol],
	);

	const isValid = transaction.satsPerByte !== 0;

	const onContinue = (): void => {
		// Check if the user is setting the minimum relay fee given the current fee environment.
		if (
			transaction?.satsPerByte &&
			// This check is to prevent situations where all values are set to 1sat/vbyte. Where setting 1sat/vbyte is perfectly fine.
			feeEstimates.minimum < feeEstimates.slow &&
			transaction.satsPerByte <= feeEstimates.minimum
		) {
			setDisplayFeeDialog(true);
		} else {
			navigation.goBack();
		}
	};

	return (
		<GradientView style={styles.container}>
			<BottomSheetNavigationHeader
				title="Set Custom Fee"
				displayBackButton={isValid}
			/>
			<View style={styles.content}>
				<Caption13Up color="gray1" style={styles.title}>
					Sat / vbyte
				</Caption13Up>
				<FeeCustomToggle />
				<Text01S style={styles.text} color="white5">
					{feeSats} sats for this transaction{feeAmount}
				</Text01S>

				<FeeNumberPad style={styles.numberPad} />

				<View style={buttonContainerStyles}>
					<Button
						size="large"
						text="Continue"
						disabled={!isValid}
						onPress={onContinue}
					/>
				</View>
			</View>
			<Dialog
				visible={displayFeeDialog}
				title="Fee is potentially too low"
				description={`The fee you are trying to set is below ${feeEstimates.minimum} sats and may be too low due to current network conditions. This transaction may fail, take a while to confirm, or get trimmed from the mempool. Do you wish to proceed?`}
				onCancel={(): void => {
					setDisplayFeeDialog(false);
				}}
				onConfirm={async (): Promise<void> => {
					setDisplayFeeDialog(false);
					navigation.goBack();
				}}
			/>
		</GradientView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 16,
	},
	title: {
		marginBottom: 16,
	},
	text: {
		marginTop: 8,
	},
	numberPad: {
		flex: 1,
		marginTop: 'auto',
		maxHeight: 360,
	},
	buttonContainer: {
		justifyContent: 'flex-end',
	},
});

export default memo(FeeCustom);
