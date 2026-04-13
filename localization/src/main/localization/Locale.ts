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

import { isRecord } from "../utils.js";

/**
 * A locale without a country/region specification
 *
 * Constraints:
 * - language: 2-8 lower case letters
 */
export interface PartialLocale {
	language: string;
}

/**
 * A Locale represents a specific geographical, political, or cultural region.
 * It consists of a language and a country specification to support a differentiation
 * between multiple regions that share the same language but differ in certain aspects
 * like e.g. words, phrases, abbreviations, data formats etc.
 *
 * Constraints:
 * - language: 2-8 lower case letters
 * - country : either 2 upper case letters or 3 digits
 */
export interface Locale extends PartialLocale {
	country: string;
}

export namespace Locale {
	export function isLocale(object: unknown): object is Locale {
		return isRecord(object) && object.language !== undefined && object.country !== undefined;
	}

	export function isPartialLocale(object: unknown): object is PartialLocale {
		return isRecord(object) && object.language !== undefined;
	}

	/**
	 * Converts a locale from string representation into a Locale or PartialLocale object
	 *
	 * The locale string must consist of
	 * - 2-8 lower case letters for the language
	 * - and optionally an underscore character _ followed by either 2 upper case letters or 3 digits for the country
	 *
	 * @param localeString
	 * @returns the deserialized {@link Locale} or {@link PartialLocale} object
	 */
	export function fromString(localeString: string): PartialLocale | Locale {
		const PARTIAL_LOCALE_REGEX = /^[a-z]{2,8}$/g;
		const LOCALE_REGEX = /^([a-z]{2,8})_([A-Z]{2}|[0-9]{3})$/g;

		if (localeString.length === 0) {
			throw new Error("Cannot deserialize locale from empty string.");
		}

		const regexArray = LOCALE_REGEX.exec(localeString);
		if (regexArray && regexArray.length === 3) {
			return {
				language: regexArray[1],
				country: regexArray[2]
			};
		}

		if (PARTIAL_LOCALE_REGEX.test(localeString)) {
			return {
				language: localeString
			};
		}

		throw new Error(`Cannot deserialize locale from '${localeString}'.`);
	}

	/**
	 * Converts a {@link Locale}/{@link PartialLocale} object into its string representation
	 * @param locale the locale object to convert
	 * @returns the string representation of the given locale object
	 */
	export function toString(locale: PartialLocale | Locale): string {
		if (isLocale(locale)) {
			return `${locale.language}_${locale.country}`;
		}
		return locale.language;
	}
}
