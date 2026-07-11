/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License – EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import type { ComponentType, ReactNode } from "react";
import { createContext, useMemo } from "react";

import type {
	DataFormats,
	Locale,
	Localizer,
	ValueConversion
} from "@com.mgmtp.a12.utils/utils-localization";
import {
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultValueConversion
} from "@com.mgmtp.a12.utils/utils-localization";
/**
 * A React context that can be used to pass a common localization configuration to all child components.
 * This configuration consists of a locale, data formats for data conversion and a `Localizer` function.
 *
 * The context can either be used with the {@link DefaultLocalizerContextProvider} or directly with the standard provider.
 * If the A12-default `Localizer` does not fit your use case, use the standard provider to pass a fully custom `Localizer` implementation.
 */
export const LocalizerContext = createContext<LocalizerContextProps>({
	dataFormats: {},
	locale: { language: "en", country: "US" },
	localizer: () => undefined,
	conversion: {
		parseValue: () => ({ value: undefined }),
		formatValue: () => ""
	}
});

export interface LocalizerContextProps {
	readonly dataFormats: Partial<DataFormats>;
	readonly locale: Locale;
	readonly localizer: Localizer;
	readonly conversion: ValueConversion;
}

export interface DefaultLocalizerContextProviderProps {
	readonly locale: Locale;
	readonly valueConversion?: ValueConversion;
	readonly dataFormats?: Partial<DataFormats>;
	readonly children?: ReactNode;
}

/**
 * Provides the {@link LocalizerContext} based on the given locale.
 * Optionally, a value conversion object and data formats can passed as well to configure
 * the `Localizer` function that will be provided with the context.
 */
export const DefaultLocalizerContextProvider: ComponentType<
	DefaultLocalizerContextProviderProps
> = props => {
	const { locale, valueConversion, dataFormats } = props;
	const defaults = useMemo(
		() => getLocalizerContextDefaults({ locale, valueConversion, dataFormats }),
		[locale, dataFormats, valueConversion]
	);
	return <LocalizerContext.Provider value={defaults}>{props.children}</LocalizerContext.Provider>;
};

/**
 * @internal
 *
 * note: only exported for tests!
 */
export function getLocalizerContextDefaults(
	props: Omit<DefaultLocalizerContextProviderProps, "children">
): LocalizerContextProps {
	const { locale, valueConversion, dataFormats } = props;

	const df = dataFormats ?? defaultDataFormats(locale);
	const conversion = valueConversion ?? defaultValueConversion(df);
	const localizer = defaultLocalizerFactory({
		locale,
		conversion,
		dataFormats: df
	});

	return {
		locale,
		localizer,
		dataFormats: df,
		conversion
	};
}
