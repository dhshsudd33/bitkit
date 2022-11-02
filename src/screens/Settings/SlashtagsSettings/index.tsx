import React, { memo, ReactElement, useState, useEffect, useMemo } from 'react';
import b4a from 'b4a';

import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { useSelectedSlashtag } from '../../../hooks/slashtags';
import { useSlashtagsSDK } from '../../../components/SlashtagsProvider';
import { closeDriveSession } from '../../../utils/slashtags';

const SlashtagsSettings = (): ReactElement => {
	const { slashtag } = useSelectedSlashtag();
	const sdk = useSlashtagsSDK();

	const [discoveryKey, setDiscoveryKey] = useState(
		b4a.from('a'.repeat(64), 'hex'),
	);

	const [driveVersion, setDriveVersion] = useState(1);
	const [profileError, setProfileError] = useState();

	const lastSeed = useSelector(
		(store: Store) => store.slashtags.seeder?.lastSent,
	);

	const [seederStatus, setSeederStatus] = useState({
		seeded: false,
		diff: 0,
	});

	useEffect(() => {
		let unmounted = false;

		(async (): Promise<void> => {
			const drive = slashtag.drivestore.get();

			try {
				await drive.update();
				setDriveVersion(drive.version);
				setDiscoveryKey(drive.discoveryKey);
				await drive.get('/profile.json');

				try {
					const key = b4a.toString(drive.key, 'hex');
					const firstResponse = await fetch(
						'https://blocktank.synonym.to/seeding/hypercore/' + key,
						{ method: 'GET' },
					);
					const status = await firstResponse.json();

					if (!unmounted) {
						setSeederStatus({
							seeded: status.statusCode !== 404,
							diff: status.length - drive.core.length,
						});
					}
				} catch (error) {}
			} catch (error) {
				if (!unmounted) {
					setProfileError(error.message);
				}
			} finally {
				closeDriveSession(drive);
			}
		})();

		return function cleanup() {
			unmounted = true;
		};
	}, [slashtag.drivestore]);

	const list: IListData[] = useMemo(
		() => [
			{
				title: 'PublicDrive',
				data: [
					{
						title: 'version',
						value: driveVersion,
						hide: false,
						type: 'button',
					},
					{
						title: 'last seeded',
						value: lastSeed && new Date(lastSeed).toLocaleString(),
						hide: false,
						type: 'button',
					},
					{
						title: 'seeder status',
						value: seederStatus.seeded
							? 'behind by ' + seederStatus.diff + ' blocks'
							: 'Not Found',
						hide: false,
						type: 'button',
					},
					{
						title: 'corrupt',
						value: profileError || 'false',
						hide: false,
						type: 'button',
					},
				],
			},
			{
				title: 'sdk corestore',
				data: [
					{
						title: 'open',
						value: !sdk.closed || 'false',
						type: 'button',
						hide: false,
					},
				],
			},
			{
				title: 'relay',
				data: [
					{
						title: 'open',
						value: sdk.swarm.dht._protocol._stream._socket.readyState === 1,
						hide: false,
						type: 'button',
					},
					{
						title: 'url',
						value: sdk.swarm.dht._protocol._stream._socket.url,
						hide: false,
						type: 'button',
					},
					{
						title: 'close relay socket',
						hide: false,
						type: 'button',
						onPress: () => sdk._relaySocket.close(),
					},
				],
			},
			{
				title: 'swarm topics',
				data: [
					{
						title: 'swarm NOT destroyed',
						value: !sdk.swarm.destroyed || 'false',
						hide: false,
						type: 'button',
					},
					{
						title: 'announced on publicDrive',
						value: discoveryKey ? sdk.swarm.status(discoveryKey)?.isServer : '',
						hide: false,
						type: 'button',
					},
				],
			},
		],
		[profileError, driveVersion, sdk, discoveryKey, lastSeed],
	);

	return (
		<SettingsView
			title={'Slashtags Settings'}
			listData={list}
			showBackNavigation
			showSearch
		/>
	);
};

export default memo(SlashtagsSettings);
