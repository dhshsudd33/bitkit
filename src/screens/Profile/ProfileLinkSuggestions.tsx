import React, { ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';

import NavigationHeader from '../../components/NavigationHeader';
import { View as ThemedView } from '../../styles/components';
import Button from '../../components/Button';
import { updateProfileLink } from '../../store/actions/ui';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import type { RootStackScreenProps } from '../../navigation/types';

export const suggestions = {
	Email: { prefix: 'mailto:' },
	Phone: { prefix: 'tel:' },
	Website: { prefix: 'https://' },
	Twitter: { prefix: 'https://twitter.com/' },
	Telegram: { prefix: 'https://t.me/' },
	Instagram: { prefix: 'https://instagram.com/' },
	Facebook: { prefix: 'https://facebook.com/' },
	LinkedIn: { prefix: 'https://linkedin.com/in/' },
	Github: { prefix: 'https://github.com/' },
	Calendly: { prefix: 'https://calendly.com/' },
	Vimeo: { prefix: 'https://vimeo.com/' },
	Youtube: { prefix: 'https://www.youtube.com/@' },
	Twitch: { prefix: 'https://www.twitch.tv/' },
	Pinterest: { prefix: 'https://pinterest.com/' },
	TikTok: { prefix: 'https://tiktok.com/@' },
	Spotify: { prefix: 'https://open.spotify.com/' },
};

export const ProfileLinkSuggestions = ({
	navigation,
}: RootStackScreenProps<'ProfileLinkSuggestions'>): ReactElement => {
	const handleChoose = (suggestion: string): void => {
		updateProfileLink({ title: suggestion, url: '' });
		navigation.goBack();
	};

	return (
		<ThemedView style={styles.container}>
			<SafeAreaInsets type="top" />
			<NavigationHeader title="Suggestions To Add" />
			<View style={styles.buttons}>
				{Object.keys(suggestions).map((suggestion) => (
					<Button
						key={suggestion}
						text={suggestion}
						style={styles.button}
						color="white32"
						onPress={(): void => handleChoose(suggestion)}
					/>
				))}
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	buttons: {
		paddingHorizontal: 16,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
	},
	button: {
		marginRight: 8,
		marginTop: 8,
		minWidth: 50,
	},
});

export default ProfileLinkSuggestions;
