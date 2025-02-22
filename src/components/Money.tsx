import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import {
	Caption13M,
	Display,
	Headline,
	Text01M,
	Text01S,
	Text02M,
	Text02S,
	Title,
} from '../styles/text';
import { BIcon, LightningIcon } from '../styles/icons';
import useDisplayValues from '../hooks/displayValues';
import Store from '../store/types';
import { abbreviateNumber } from '../utils/helpers';
import { EBitcoinUnit } from '../store/types/wallet';
import { IColors } from '../styles/colors';

interface IMoney {
	sats: number;
	showFiat?: boolean; // if true shows value in fiat, if false shows value in settings.bitcoinUnit. Can be overwritten by unit prop
	unit?: 'fiat' | 'BTC' | 'satoshi'; // force value formatting
	size?:
		| 'display'
		| 'text01s'
		| 'text01m'
		| 'text02s'
		| 'text02m'
		| 'caption13M'
		| 'title'
		| 'headline';
	highlight?: boolean; // grey last 3 chars in sats/bitcoin or decimal in fiat
	symbol?: boolean; // show symbol icon
	color?: keyof IColors;
	enableHide?: boolean; // if true and settings.hideBalance === true it will replace number with dots
	style?: object;
	sign?: string;
}

const Money = (props: IMoney): ReactElement => {
	const bitcoinUnit = useSelector((state: Store) => state.settings.bitcoinUnit);
	const hideBalance = useSelector((state: Store) => state.settings.hideBalance);

	const sats = Math.abs(props.sats);
	const highlight = props.highlight ?? false;
	const size = props.size ?? 'display';
	const showFiat = props.showFiat ?? false;
	const unit = props.unit ?? (showFiat ? 'fiat' : bitcoinUnit);
	const showSymbol = props.symbol ?? (unit === 'fiat' ? true : false);
	const color = props.color;
	const hide = (props.enableHide ?? false) && hideBalance;
	const sign = props.sign;

	const dv = useDisplayValues(
		sats,
		unit === 'fiat' ? EBitcoinUnit.BTC : (unit as EBitcoinUnit),
	);

	const style = useMemo(
		() => StyleSheet.compose(styles.root, props.style),
		[props.style],
	);

	const [Text, lineHeight, iconHeight, iconWidth] = useMemo(() => {
		switch (size) {
			case 'headline':
				// Override lineHeight for Display font
				return [Headline, '41px', 40, 20];
			case 'title':
				return [Title, undefined, 26, 12];
			case 'text01s':
				return [Text01S, undefined, 21, 10];
			case 'text01m':
				return [Text01M, undefined, 21, 10];
			case 'text02s':
				return [Text02S, undefined, 18, 9];
			case 'text02m':
				return [Text02M, undefined, 18, 9];
			case 'caption13M':
				return [Caption13M, undefined, 16, 8];
			default:
				// Override lineHeight for Display font
				return [Display, '57px', 39, 25];
		}
	}, [size]);

	const symbol = useMemo(() => {
		switch (unit) {
			case 'fiat':
				return (
					<Text
						lineHeight={lineHeight}
						color={color ?? 'gray2'}
						style={styles.symbol}
						money={true}
						testID="MoneyCurrencySymbol">
						{dv.fiatSymbol}
					</Text>
				);
			case 'satoshi':
				return (
					<LightningIcon
						color={color ?? 'gray2'}
						height={iconHeight}
						width={iconWidth}
						style={styles.symbol}
						testID="MoneyLightningSymbol"
					/>
				);
			default:
				return (
					<BIcon
						color={color ?? 'gray2'}
						height={iconHeight}
						width={iconWidth}
						style={styles.symbol}
						testID="MoneyBitcoinSymbol"
					/>
				);
		}
	}, [unit, Text, lineHeight, color, dv.fiatSymbol, iconHeight, iconWidth]);

	let [prim = '', secd = ''] = useMemo(() => {
		switch (unit) {
			case 'fiat':
				if (dv.fiatWhole.length > 12) {
					const { newValue, abbreviation } = abbreviateNumber(dv.fiatWhole);
					return highlight
						? [newValue, abbreviation]
						: [newValue + abbreviation];
				}
				return highlight
					? [dv.fiatWhole, dv.fiatDecimal + dv.fiatDecimalValue]
					: [dv.fiatFormatted];
			case 'satoshi': {
				// No highlight effect for denomination in sats
				return [dv.bitcoinFormatted];
			}
			default: {
				const value = dv.bitcoinFormatted;
				if (!highlight || !value.includes(dv.fiatDecimal) || sats < 999999) {
					return [value];
				}
				return [value.slice(0, -3), value.slice(-3)];
			}
		}
	}, [highlight, dv, unit, sats]);

	if (hide) {
		if (size === 'display') {
			prim = ' • • • • • • • • • •';
		} else {
			prim = ' • • • • •';
		}

		secd = '';
	}

	return (
		<View style={style}>
			{sign && (
				<Text
					style={styles.sign}
					lineHeight={lineHeight}
					color={color ?? 'gray2'}
					money={true}
					testID="MoneySign">
					{sign}
				</Text>
			)}
			{showSymbol && symbol}
			<Text
				style={styles.integer}
				lineHeight={lineHeight}
				color={color}
				money={true}
				testID="MoneyPrimary">
				{prim}
			</Text>
			{secd !== '' && (
				<Text
					style={styles.decimal}
					lineHeight={lineHeight}
					color="gray2"
					money={true}
					testID="MoneySecondary">
					{secd}
				</Text>
			)}
		</View>
	);
};

export default memo(Money);

const styles = StyleSheet.create({
	root: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	sign: {
		marginRight: 3,
	},
	symbol: {
		marginRight: 4,
	},
	integer: {},
	decimal: {},
});
