import React from 'react';
import type { PropsWithChildren } from 'react';
import {
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	useColorScheme,
	View,
} from 'react-native';
import {
	Colors,
	DebugInstructions,
	Header,
	LearnMoreLinks,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import GlowingBackground from './GlowingBackground';
type SectionProps = PropsWithChildren<{
	title: string;
}>;
//import i18n from 'src/utils/i18n/index';

function Section({ children, title }: SectionProps): JSX.Element {
	const isDarkMode = useColorScheme() === 'dark';

	const fiatValue = 4.5;

	const locale = 'en-US';
	const currencyFormat = 'USD';
	const fiatFormattedIntl = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyFormat,
	});

	let fiatSymbol = '$';
	let fiatWhole = '';
	let fiatDecimalValue = '';
	let fiatDecimal = '';
	let fiatFormatted = '';
	let currencySymbol = '$';
	fiatFormattedIntl.formatToParts(fiatValue).forEach((part) => {
		if (part.type === 'currency') {
			fiatSymbol = currencySymbol ?? part.value;
		} else if (part.type === 'integer' || part.type === 'group') {
			fiatWhole = `${fiatWhole}${part.value}`;
		} else if (part.type === 'fraction') {
			fiatDecimalValue = part.value;
		} else if (part.type === 'decimal') {
			fiatDecimal = part.value;
		}

		if (part.type !== 'currency') {
			fiatFormatted = `${fiatFormatted}${part.value}`;
		}
	});

	fiatFormatted = fiatFormatted.trim();
	return (
		<GlowingBackground>
			<View style={styles.sectionContainer}>
				<Text
					style={[
						styles.sectionTitle,
						{
							color: isDarkMode ? Colors.white : Colors.black,
						},
					]}>
					`${title} Number: ${fiatFormatted}`
				</Text>
				<Text
					style={[
						styles.sectionDescription,
						{
							color: isDarkMode ? Colors.light : Colors.dark,
						},
					]}>
					{children}
				</Text>
			</View>
		</GlowingBackground>
	);
}

function App(): JSX.Element {
	const isDarkMode = useColorScheme() === 'dark';

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
	};

	return (
		<SafeAreaView style={backgroundStyle}>
			<StatusBar
				barStyle={isDarkMode ? 'light-content' : 'dark-content'}
				backgroundColor={backgroundStyle.backgroundColor}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={backgroundStyle}>
				<Header />
				<View
					style={{
						backgroundColor: isDarkMode ? Colors.black : Colors.white,
					}}>
					<Section title="Step One">
						Edit <Text style={styles.highlight}>App.tsx</Text> to change this
						screen and then come back to see your edits.
					</Section>
					<Section title="See Your Changes">
						<ReloadInstructions />
					</Section>
					<Section title="Debug">
						<DebugInstructions />
					</Section>
					<Section title="Learn More">
						Read the docs to discover what to do next:
					</Section>
					<LearnMoreLinks />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	sectionContainer: {
		marginTop: 32,
		paddingHorizontal: 24,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: '600',
	},
	sectionDescription: {
		marginTop: 8,
		fontSize: 18,
		fontWeight: '400',
	},
	highlight: {
		fontWeight: '700',
	},
});

export default App;
