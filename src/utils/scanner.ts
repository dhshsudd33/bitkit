/**
 * Helper functions that allow for any possible bitcoin related QR to be scanned
 */

import bip21 from 'bip21';
import { err, ok, Result } from './result';
import { availableNetworks, networks, TAvailableNetworks } from './networks';
import { address as bitcoinJSAddress } from 'bitcoinjs-lib';
import { parseOnChainPaymentRequest } from './wallet/transactions';
import { getStore } from '../store/helpers';
import {
	getLNURLParams,
	LNURLAuthParams,
	LNURLWithdrawParams,
	LNURLChannelParams,
	LNURLPayParams,
	LNURLResponse,
} from '@synonymdev/react-native-lnurl';

const availableNetworksList = availableNetworks();

export const validateAddress = ({
	address = '',
	selectedNetwork = undefined,
}: {
	address: string;
	selectedNetwork?: TAvailableNetworks | undefined;
}): {
	isValid: boolean;
	network: TAvailableNetworks;
} => {
	try {
		//Validate address for a specific network
		if (selectedNetwork !== undefined) {
			bitcoinJSAddress.toOutputScript(address, networks[selectedNetwork]);
		} else {
			//Validate address for all available networks
			let isValid = false;
			let network: TAvailableNetworks | undefined;
			for (let i = 0; i < availableNetworksList.length; i++) {
				if (
					validateAddress({
						address,
						selectedNetwork: availableNetworksList[i],
					}).isValid
				) {
					isValid = true;
					network = availableNetworksList[i];
					break;
				}
			}
			if (!network) {
				network = 'bitcoin';
			}
			return { isValid, network };
		}

		return { isValid: true, network: selectedNetwork };
	} catch (e) {
		return { isValid: false, network: 'bitcoin' };
	}
};

export enum EQRDataType {
	bitcoinAddress = 'bitcoinAddress',
	lightningPaymentRequest = 'lightningPaymentRequest',
	lnurlAuth = 'lnurlAuth',
	lnurlWithdraw = 'lnurlWithdraw',
	slashtagUrl = 'slashtagUrl',
	//TODO add rgb, xpub, lightning node peer etc
}

export interface QRData {
	network?: TAvailableNetworks;
	qrDataType: EQRDataType;
	sats?: number;
	address?: string;
	lightningPaymentRequest?: string;
	message?: string;
	lnUrlParams?:
		| LNURLAuthParams
		| LNURLWithdrawParams
		| LNURLChannelParams
		| LNURLPayParams
		| LNURLResponse;
	url?: string;
}

/**
 * Return all networks and their payment request details if found in QR data.
 * Can also be used to read clipboard data for any addresses or payment requests.
 * @param data
 * @returns {string}
 */
export const decodeQRData = async (data: string): Promise<Result<QRData[]>> => {
	let foundNetworksInQR: QRData[] = [];
	let lightningInvoice = '';

	//Lightning URI or plain lightning payment request
	if (
		data.toLowerCase().indexOf('lightning:') > -1 ||
		data.toLowerCase().startsWith('lntb') ||
		data.toLowerCase().startsWith('lnbc') ||
		data.toLowerCase().startsWith('lnurl')
	) {
		//If it's a lightning URI
		let invoice = data.replace('lightning:', '').toLowerCase();

		if (data.startsWith('lnurl')) {
			//LNURL-auth
			const res = await getLNURLParams(data);
			if (res.isErr()) {
				return err(res.error);
			}

			const params = res.value;
			let tag = '';
			if ('tag' in params) {
				tag = params.tag;
			}

			let qrDataType: EQRDataType | undefined;

			switch (tag) {
				case 'login': {
					qrDataType = EQRDataType.lnurlAuth;
					break;
				}
				case 'withdrawRequest': {
					qrDataType = EQRDataType.lnurlWithdraw;
					break;
				}
			}

			if (qrDataType) {
				foundNetworksInQR.push({
					qrDataType,
					//No real difference between networks for lnurl, all keys are derived the same way so assuming current network
					network: getStore().wallet.selectedNetwork,
					lnUrlParams: params,
				});
			}
		} else {
			//Assume invoice
			//Ignore params if there are any, all details can be derived from invoice
			if (invoice.indexOf('?') > -1) {
				invoice = invoice.split('?')[0];
			}

			lightningInvoice = invoice;
		}
	}

	//Plain bitcoin address or Bitcoin address URI
	try {
		const onChainParseResponse = parseOnChainPaymentRequest(data);
		if (onChainParseResponse.isOk()) {
			const { address, sats, message, network } = onChainParseResponse.value;
			foundNetworksInQR.push({
				qrDataType: EQRDataType.bitcoinAddress,
				address,
				network,
				sats,
				message,
			});
		}

		const { options } = bip21.decode(data);

		//If a lightning invoice was passed as a param
		if (options.lightning) {
			lightningInvoice = options.lightning;
		}
	} catch (e) {}

	if (data.startsWith('slashauth://')) {
		return ok([{ qrDataType: 'slashtagUrl', url: data }]);
	}

	if (lightningInvoice) {
		// TODO: Decode Lightning Invoice
	}

	// If we've found any of the above bitcoin QR data don't decode for other networks
	if (foundNetworksInQR.length > 0) {
		return ok(foundNetworksInQR);
	}

	return ok(foundNetworksInQR);
};
