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

// tag::imports[]
import { useMemo, type JSX } from "react";

import type {
	Localizable,
	LocalizationTree,
	Localizer,
	ValueConversion
} from "@com.mgmtp.a12.utils/utils-localization";
import {
	createTextResolverForTreeMap,
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultTranslationFinderFactory,
	defaultValueConversion,
	Locale
} from "@com.mgmtp.a12.utils/utils-localization";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";

// end::imports[]

// tag::ex1[]
interface CustomTranslationsProps {
	readonly locale: Locale;
	readonly translations: LocalizationTree;
}

export function CustomTranslations(props: CustomTranslationsProps): JSX.Element {
	const { locale, translations } = props;

	const localizerContext = useMemo(() => {
		const customLocalizer = defaultLocalizerFactory({
			locale, // fr_CA
			fallbackLocales: [{ language: "fr" }], // default: "fr", "en"
			translationSource: defaultTranslationFinderFactory(
				createTextResolverForTreeMap({
					[Locale.toString(locale)]: translations
				})
			)
		});
		return {
			locale: locale,
			dataFormats: defaultDataFormats(locale),
			localizer: customLocalizer,
			conversion: defaultValueConversion(defaultDataFormats(locale))
		};
	}, [locale, translations]);

	return (
		<LocalizerContext.Provider value={localizerContext}>
			<LocalizerContext.Consumer>
				{context =>
					context.localizer({
						key: "abc",
						args: {},
						defaults: {}
					})
				}
			</LocalizerContext.Consumer>
		</LocalizerContext.Provider>
	);
}
// end::ex1[]

// tag::ex2[]
interface ModelDependent {
	readonly model: { header: { id: string } };
	readonly locale: Locale;

	readonly translations: LocalizationTree[];
}

export function ModelDependent(props: ModelDependent): JSX.Element {
	const { locale, model } = props;

	const localizerContext = useMemo(() => {
		const localizer =
			model.header.id === "foo"
				? // e.g. do something with props.translations, or:
					(...localizables: Localizable[]) => localizables[0].key
				: defaultLocalizerFactory({ locale });
		return {
			locale,
			dataFormats: defaultDataFormats(locale),
			localizer,
			conversion: defaultValueConversion(defaultDataFormats(locale))
		};
	}, [locale, model.header.id]);

	return (
		<LocalizerContext.Provider value={localizerContext}>
			<LocalizerContext.Consumer>
				{context =>
					context.localizer({
						key: "abc",
						args: { fieldValue: { type: "plain", value: 123 } },
						defaults: {}
					})
				}
			</LocalizerContext.Consumer>
		</LocalizerContext.Provider>
	);
}
// end::ex2[]

// tag::ex3[]
const myValueConversion: ValueConversion = {
	parseValue: (_value, _inputFormat) => {
		// implement your string -> SupportedType parsing logic here
		return {
			value: undefined,
			parseError: undefined
		};
	},
	formatValue: (_value, _outputFormat) => {
		// implement your SupportedType -> string formatting logic here
		// you can match specific cases by e.g.
		// - identifying document model fields based on outputFormat.modelId & outputFormat.modelPath
		// - identifying specific field data types based on outputFormat.type
		// - identifying specific values that shall be formatted in a certain way
		// - a combination of the above
		return "formatted-example-value";
	}
};

function myComplexLocalizerFactory(_locale: Locale, _valueConversion: ValueConversion): Localizer {
	// implement custom localizer approach
	// you might need to use your custom conversion logic as well in here in case the localizables contain formattable placeholders
	return (..._localizables) => "foo";
}

export function MyExampleComponent2(props: { locale: Locale }): JSX.Element {
	const { locale } = props;

	const localizerContext = useMemo(() => {
		const localizer = myComplexLocalizerFactory(locale, myValueConversion);
		return {
			locale,
			dataFormats: defaultDataFormats(locale),
			localizer,
			conversion: myValueConversion
		};
	}, [locale]);

	return (
		<LocalizerContext.Provider value={localizerContext}>
			<LocalizerContext.Consumer>
				{context =>
					context.localizer({
						key: "abc $replaceMe$",
						args: {
							replaceMe: {
								type: "formattable",
								value: "example-value",
								properties: {
									formattingConfig: {
										type: "StringType",
										modelId: "sampleModel",
										modelPath: [{ elementName: "rootGroupName" }, { elementName: "fieldName" }]
									}
								}
							}
						},
						defaults: {}
					})
				}
			</LocalizerContext.Consumer>
		</LocalizerContext.Provider>
	);
}
// end::ex3[]
