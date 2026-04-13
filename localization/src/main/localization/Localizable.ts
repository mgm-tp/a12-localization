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

import type { ValueConversionConfig } from "../conversion.js";

/** Defines a localizable entity */
export interface Localizable {
	/**
	 * Key of the localizable
	 *
	 * The key is a string which is made up of segments of strings joined by the '.' character.
	 * For example: "documentModel.label.MyTestModel.groupA.groupB.fieldC"
	 *
	 * This structure requires that no segment may itself contain the '.' or '\\' characters since the '.' is used for
	 * structuring and the '\\' is used to be able to escape the '.' (and '\\' itself).
	 *
	 * In order to still allow passing arbitrary segment values, an escaping and unescaping is available with the
	 * following functions:
	 * * for localizable keys
	 *   - localizableKeyFromSegments(segments: string[]): string
	 *   - segmentsFromLocalizableKey(key: string): string[]
	 * * for key segments
	 *   - addDotEscaping(input: string): string
	 *   - removeDotEscaping(input: string): string
	 */
	readonly key: string;

	/** Placeholder values */
	readonly args?: LocalizableArgs;

	/** Default text map that maps (partial) locale to text */
	readonly defaults?: { readonly [locale: string]: string | undefined };
}

/** The arguments that will be used for placeholder resolving in a {@link Localizable} */
export interface LocalizableArgs {
	/**
	 * placeholder key -> value mapping
	 *
	 * Note: The value can either be
	 * 1. plain       -> it will just be inserted for the placeholder
	 * 2. formattable -> it will be formatted depending on the locale before insertion
	 * 3. localizable -> it will itself be localized depending on the locale before insertion
	 * 4. dataFormat  -> it will be formatted using the DataFormats specified for the locale
	 * Depending on its type, corresponding properties will be attached to allow proper processing.
	 *
	 * For formattable args, a FormatProperties object is required to configure the formatting of the
	 * given value. This configuration is designed to be used with the respective conversion API that
	 * is part of this library. See {@link ValueConversionConfig} for more details.
	 *
	 * Custom localizer implementations can use the provided value property as a fallback and ignore
	 * the additional configuration or use them to delegate to the conversion function(s).
	 */
	readonly [placeholder: string]: Placeholder;
}

export type Placeholder =
	| PlainPlaceholder
	| FormattablePlaceholder
	| LocalizablePlaceholder
	| DataFormatPlaceholder;

interface BasePlaceholder {
	readonly value: unknown;
}

export interface PlainPlaceholder extends BasePlaceholder {
	readonly type: "plain";
}

export interface FormattablePlaceholder extends BasePlaceholder {
	readonly type: "formattable";
	readonly properties: FormatProperties;
}

export interface FormatProperties {
	readonly formattingConfig: ValueConversionConfig;
}

export interface LocalizablePlaceholder extends BasePlaceholder {
	readonly type: "localizable";
	readonly properties: Localizable[];
}

export interface DataFormatPlaceholder extends BasePlaceholder {
	readonly type: "dataFormat";
	readonly properties: DataFormatProperties;
}

export interface DataFormatProperties {
	readonly type: "date" | "dateRange" | "decimalSeparator";
}
