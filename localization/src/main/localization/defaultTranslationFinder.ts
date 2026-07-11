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

import type { PartialLocale } from "./Locale.js";
import { Locale } from "./Locale.js";
import type { Localizable, LocalizableArgs } from "./Localizable.js";
import { localizableFromLocalizationTreeMap } from "./LocalizableFactory.js";
import type { LocalizationTreeMap } from "./LocalizationTree.js";

import type { defaultLocalizerFactory } from "./defaultLocalizerFactory.js";

/**
 * A function to determine a translation (string) from a given list of {@link Localizable}s and {@link Locale}s.
 * I.e. the function selects the most suitable localizable based on the given arguments and returns the translation that
 * shall be used.
 * The returned object may contain the translation as a "template" string since it can contain placeholders.
 * That is why the respective {@link LocalizableArgs} must be passed as well - if they exist.
 * Placeholder resolving is only applied afterwards.
 *
 * Note: Both function arguments can be considered to be sorted in order of precedence.
 * I.e. locales are sorted in order of current locale, then fallback locales (if they exist).
 * Localizables are sorted in the order that the caller of the localizer function used. I.e. the component that requests
 * a localization specifies the precedence of the localizables.
 */
export type TranslationFinder = (
	locales: (PartialLocale | Locale)[],
	localizables: Localizable[]
) => TranslationWithArgs | undefined;

/**
 * Holds a translation (template) string and the {@link LocalizableArgs} that will be used for placeholder replacement
 */
export interface TranslationWithArgs {
	readonly text: string;
	readonly args?: LocalizableArgs;
}

/**
 * Factory function to create a {@link TranslationFinder} that searches translations in localizables and uses the given
 * {@link TextResolver} to look for external translations. For each localizable, first the external translations are
 * searched and only if they do not contain a text, the default texts of the localizable are considered.
 *
 * The given {@link TextResolver} should return undefined for all inputs that cannot be resolved to a translation.
 *
 * @returns a {@link TranslationFinder} which can be passed to the {@link defaultLocalizerFactory}
 */
export function defaultTranslationFinderFactory(
	externalTranslationResolver: TextResolver = () => undefined
): TranslationFinder {
	return (locales: (PartialLocale | Locale)[], localizables: Localizable[]) => {
		for (const localizable of localizables) {
			for (const locale of locales) {
				// search in given translations as 1st option
				const externalTranslation = externalTranslationResolver(localizable.key, locale);
				if (externalTranslation !== undefined) {
					return {
						text: externalTranslation,
						args: localizable.args
					};
				}
				// search in given localizables as 2nd option
				const localeString = Locale.toString(locale);
				if (localizable.defaults?.[localeString] !== undefined) {
					return {
						text: localizable.defaults[localeString] ?? "",
						args: localizable.args
					};
				}
			}
		}
		return undefined;
	};
}

/**
 * A function to resolve a localized (template) text based on a {@link Localizable} key and a {@link Locale}.
 *
 * If no text can be resolved, the function should return undefined.
 */
export type TextResolver = (
	localizableKey: string,
	locale: PartialLocale | Locale
) => string | undefined;

/**
 * Factory function that creates a {@link TextResolver} which works on the given translations ({@link LocalizationTreeMap}).
 * @param translations the translation resources to search in when resolving a {@link Localizable}
 * @returns the {@link TextResolver}
 */
export const createTextResolverForTreeMap: (translations: LocalizationTreeMap) => TextResolver = (
	translations: LocalizationTreeMap
) => {
	return (key: string, locale: PartialLocale | Locale) => {
		const localizable = localizableFromLocalizationTreeMap(key, translations);
		return localizable.defaults ? localizable.defaults[Locale.toString(locale)] : undefined;
	};
};
