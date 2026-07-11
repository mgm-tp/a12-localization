import type { ValueConversion } from "@com.mgmtp.a12.utils/utils-localization";
import type {
	DefaultLocalizerContextProvider,
	LocalizerContext
} from "@com.mgmtp.a12.utils/utils-localization-react";

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
