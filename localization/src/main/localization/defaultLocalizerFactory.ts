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

import type { ValueConversion } from "../conversion.js";
import { defaultValueConversion } from "../conversion.js";

import type { DataFormats } from "./DataFormats.js";
import { defaultDataFormats } from "./DataFormats.js";
import type { TranslationFinder } from "./defaultTranslationFinder.js";
import {
	createTextResolverForTreeMap,
	defaultTranslationFinderFactory
} from "./defaultTranslationFinder.js";
import type { PartialLocale } from "./Locale.js";
import { Locale } from "./Locale.js";
import type { Localizable } from "./Localizable.js";
import type { LocalizationTreeMap } from "./LocalizationTree.js";
import type { Localizer } from "./Localizer.js";
import { defaultLocalizer } from "./Localizer.js";

/**
 * Factory function for {@link Localizer} functions that implement the A12-default localization strategy.
 *
 * @param options configuration object that specifies {@link Locale}(s) to be considered, translation search strategy
 * (via translationFinder), formatting etc.
 *
 * If no fallbackLocales are passed, a list of fallback locales will be derived from the given locale.
 *
 * The translationSource parameter is handled as follows:
 * - if a translation finder is passed, it will be used for resolving translations
 * - if a localization tree map is passed, it will be used to parameterize the default translation finder
 * - if nothing is passed, the default translationFinder without external sources is used
 *
 * The search algorithm of the default translation finder works as follows:
 * - loop over all localizables
 * - (nested) loop over all locales (first current, then fallbacks)
 * - if a translation exists in this localizable for this locale, return it
 * - if no translation has been found after both loops returned, return undefined
 *
 * @returns a {@link Localizer} instance that can be used to turn {@link Localizable}s into the correct translation
 */
export function defaultLocalizerFactory(options: {
	locale: PartialLocale | Locale;
	fallbackLocales?: (PartialLocale | Locale)[];
	translationSource?: TranslationFinder | LocalizationTreeMap;
	conversion?: ValueConversion;
	dataFormats?: Partial<DataFormats>;
}): Localizer {
	const { locale, fallbackLocales, translationSource, conversion, dataFormats } = options;

	// if a localization tree map is passed, use it to parameterize the default translation finder
	// if a translation finder is passed, use that
	// if nothing is passed, use the default translationFinder without external sources
	const translationFinder = translationSource
		? typeof translationSource === "object"
			? defaultTranslationFinderFactory(createTextResolverForTreeMap(translationSource))
			: translationSource
		: defaultTranslationFinderFactory();

	const df = dataFormats ?? defaultDataFormats(locale);

	return (...localizables: Localizable[]) =>
		defaultLocalizer(
			locale,
			fallbackLocales ?? defaultFallbackLocales(locale),
			translationFinder,
			conversion ?? defaultValueConversion(df),
			df,
			...localizables
		);
}

function defaultFallbackLocales(locale: PartialLocale): PartialLocale[] {
	if (Locale.isLocale(locale)) {
		if (locale.language === "en") {
			return [{ language: "en" }];
		} else {
			return [{ language: locale.language }];
		}
	}
	return [];
}
