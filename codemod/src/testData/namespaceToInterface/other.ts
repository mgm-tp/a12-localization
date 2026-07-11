namespace DefaultLocalizerContextProvider {
	export type Props = string;
}

namespace LocalizerContext {
	export type Type = number;
}

namespace ValueConversion {
	export type ParseError = {
		key: string;
	};
}

const contextValue: LocalizerContext.Type = {
	dataFormats: {},
	locale: { language: "en", country: "US" },
	localizer: () => undefined,
	conversion: {
		parseValue: () => ({ value: undefined }),
		formatValue: () => ""
	}
};

function MyComponent(props: DefaultLocalizerContextProvider.Props): void {
	console.log(props.locale);
}

function useLocalizerContext(): LocalizerContext.Type {
	return contextValue;
}

function handleParseError(error: ValueConversion.ParseError): void {
	console.error(error.key);
}
