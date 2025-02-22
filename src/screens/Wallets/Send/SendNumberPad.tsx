import React, { memo, ReactElement, useCallback, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';

import NumberPad from '../../../components/NumberPad';
import { btcToSats } from '../../../utils/helpers';
import { useExchangeRate } from '../../../hooks/displayValues';
import { EBitcoinUnit } from '../../../store/types/wallet';
import {
	getTransactionOutputValue,
	updateAmount,
} from '../../../utils/wallet/transactions';
import {
	fiatToBitcoinUnit,
	getDisplayValues,
} from '../../../utils/exchange-rate';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
	transactionSelector,
} from '../../../store/reselect/wallet';
import {
	bitcoinUnitSelector,
	selectedCurrencySelector,
	unitPreferenceSelector,
} from '../../../store/reselect/settings';

/**
 * Handles the number pad logic (add/remove/clear) for on-chain transactions.
 */
const SendNumberPad = ({
	style,
}: {
	style?: StyleProp<ViewStyle>;
}): ReactElement => {
	const [decimalMode, setDecimalMode] = useState(false);
	const [prefixZeros, setPrefixZeros] = useState(0);

	const selectedWallet = useSelector(selectedWalletSelector);
	const selectedNetwork = useSelector(selectedNetworkSelector);
	const bitcoinUnit = useSelector(bitcoinUnitSelector);
	const unitPreference = useSelector(unitPreferenceSelector);
	const currency = useSelector(selectedCurrencySelector);
	const transaction = useSelector(transactionSelector);
	const exchangeRate = useExchangeRate(currency);

	/*
	 * Retrieves total value of all outputs. Excludes change address.
	 */
	const getAmountToSend = useCallback((): number => {
		try {
			return getTransactionOutputValue({
				selectedWallet,
				selectedNetwork,
			});
		} catch {
			return 0;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transaction.outputs, selectedNetwork, selectedWallet]);

	// Add, shift and update the current transaction amount based on the provided fiat value or bitcoin unit.
	const onPress = (key: number | string): void => {
		let amount = '0';

		if (key === '.') {
			setDecimalMode(true);
			return;
		} else {
			setDecimalMode(false);
		}

		if ((decimalMode || prefixZeros !== 0) && key === 0) {
			setPrefixZeros((prevValue) => prevValue + 1);
			return;
		} else {
			setPrefixZeros(0);
		}

		if (unitPreference === 'asset') {
			if (bitcoinUnit === 'BTC') {
				const displayValue = getDisplayValues({ satoshis: getAmountToSend() });
				amount = displayValue.bitcoinFormatted;
				amount = String(parseFloat(amount));

				const [, decimals] = amount.split('.');
				if (decimals?.length > 7) {
					return;
				}

				if (decimals?.length > 0 && key === 0) {
					setPrefixZeros((prevValue) => prevValue + 1);
					return;
				}

				if (prefixZeros !== 0) {
					if (decimals?.length > 0) {
						amount = `${amount}${'0'.repeat(prefixZeros)}${key}`;
					} else {
						amount = `${amount}.${'0'.repeat(prefixZeros)}${key}`;
					}
				} else {
					if (decimalMode) {
						amount = `${amount}.${key}`;
					} else {
						amount = `${amount}${key}`;
					}
				}

				amount = String(btcToSats(Number(amount)));
			} else {
				amount = String(getAmountToSend());
				amount = `${amount}${key}`;
			}
		} else {
			const displayValue = getDisplayValues({ satoshis: getAmountToSend() });
			amount = displayValue.fiatValue.toString();

			const [, decimals] = amount.split('.');
			if (decimals?.length > 1) {
				return;
			}

			if (decimals?.length > 0 && key === 0) {
				setPrefixZeros((prevValue) => prevValue + 1);
				return;
			}

			if (prefixZeros !== 0) {
				if (decimals?.length > 0) {
					amount = `${amount}${'0'.repeat(prefixZeros)}${key}`;
				} else {
					amount = `${amount}.${'0'.repeat(prefixZeros)}${key}`;
				}
			} else {
				if (decimalMode) {
					amount = `${amount}.${key}`;
				} else {
					amount = `${amount}${key}`;
				}
			}

			// Convert new fiat amount to satoshis.
			amount = String(
				fiatToBitcoinUnit({
					fiatValue: amount,
					bitcoinUnit: EBitcoinUnit.satoshi,
					currency,
					exchangeRate,
				}),
			);
		}
		updateAmount({
			amount,
			selectedWallet,
			selectedNetwork,
			index: 0,
		});
	};

	// Shift, remove and update the current transaction amount based on the provided fiat value or bitcoin unit.
	const onRemove = (): void => {
		let amount = '0';
		let newAmount = '0';
		if (unitPreference === 'asset') {
			if (bitcoinUnit === 'BTC') {
				const displayValue = getDisplayValues({ satoshis: getAmountToSend() });
				amount = displayValue.bitcoinFormatted;
				amount = String(parseFloat(amount));

				// remove last character
				newAmount = amount.replace(/.$/, '');

				newAmount = String(btcToSats(Number(newAmount)));
			} else {
				amount = String(getAmountToSend());
				newAmount = amount.substring(0, amount.length - 1);
			}
		} else {
			const displayValue = getDisplayValues({ satoshis: getAmountToSend() });
			amount = displayValue.fiatValue.toString();

			// remove last character
			newAmount = amount.replace(/.$/, '');

			const fiatAmount = fiatToBitcoinUnit({
				fiatValue: newAmount,
				bitcoinUnit: EBitcoinUnit.satoshi,
				exchangeRate,
				currency,
			});

			newAmount = String(fiatAmount);
		}
		updateAmount({
			amount: newAmount,
			selectedWallet,
			selectedNetwork,
			index: 0,
			max: false,
		});
	};

	const numberPadType =
		unitPreference === 'asset' && bitcoinUnit === EBitcoinUnit.satoshi
			? 'integer'
			: 'decimal';

	return (
		<NumberPad
			style={style}
			type={numberPadType}
			onPress={onPress}
			onRemove={onRemove}
		/>
	);
};

export default memo(SendNumberPad);
