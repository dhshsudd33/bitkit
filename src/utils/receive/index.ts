import bitcoinUnits from 'bitcoin-units';

/**
 * Creates a BIP21 URI w/ Lightning PaymentRequest
 */
export const getUnifiedUri = ({
	bitcoin,
	amount,
	label,
	message,
	lightning,
}: {
	bitcoin: string;
	amount: number | string;
	label: string;
	message: string;
	lightning: string;
}): string => {
	const amountBTC = bitcoinUnits(amount, 'satoshi').to('btc').value();
	const params = new URLSearchParams({
		amount: amountBTC,
		...(label !== '' ? { label } : {}),
		// do wallet apps still use "message"?
		...(message !== '' ? { message } : {}),
		...(lightning !== '' ? { lightning: lightning.toUpperCase() } : {}),
	});

	return `bitcoin:${bitcoin}?${params.toString()}`;
};
