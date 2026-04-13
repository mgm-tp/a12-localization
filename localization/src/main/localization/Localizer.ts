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

import type { SupportedType, ValueConversion } from "../conversion.js";

import type { DataFormats } from "./DataFormats.js";
import {
	localizeDateFormat,
	localizeDateRangeFormat,
	localizeDecimalSeparator
} from "./DataFormats.js";

import type { TranslationFinder, TranslationWithArgs } from "./defaultTranslationFinder.js";
import type { PartialLocale } from "./Locale.js";
import type { Localizable, LocalizableArgs } from "./Localizable.js";
import { resolvePlaceholders } from "./resolvePlaceholders.js";

/**
 * The central localizer function which turns {@link Localizable}s into fully-translated and formatted string outputs.
 *
 * This function can be called with a single or multiple {@link Localizable}s depending on the use case.
 * Multiple {@link Localizable}s will be passed whenever a translation can be derived from different {@link Localizable}s
 * that can act as fallback sources.
 */
export type Localizer = (...localizable: Localizable[]) => string | undefined;

/** @internal */
export function defaultLocalizer(
	locale: PartialLocale,
	fallbackLocales: PartialLocale[],
	localizationFinder: TranslationFinder,
	conversion: ValueConversion,
	dataFormats: Partial<DataFormats>,
	...localizables: Localizable[]
): string | undefined {
	if (localizables.length === 0) {
		return undefined;
	}

	const parameters = localizationFinder([locale, ...fallbackLocales], localizables);
	if (!parameters) {
		return undefined;
	}

	return applyArgs(parameters, conversion, dataFormats, (...localizables: Localizable[]) =>
		defaultLocalizer(
			locale,
			fallbackLocales,
			localizationFinder,
			conversion,
			dataFormats,
			...localizables
		)
	);
}

function applyArgs(
	parameters: TranslationWithArgs,
	conversion: ValueConversion,
	dataFormats: Partial<DataFormats>,
	localizer: Localizer
): string {
	const placeholdersInTemplate = determinePlaceholders(parameters.text);

	const applicableArgs = processArgs(
		placeholdersInTemplate,
		conversion,
		dataFormats,
		localizer,
		parameters.args
	);

	return resolvePlaceholders(parameters.text, applicableArgs);
}

function determinePlaceholders(template: string): string[] {
	const parts: string[] = template.split("$");
	const placeholders: string[] = [];
	// only every 2nd occurrence is actually a parameter since $ is the start and end delimiter
	for (let i = 1; i < parts.length; i = i + 2) {
		// if the amount of $ are uneven, the last occurrence should not be treated as placeholder
		if (i !== parts.length - 1) {
			placeholders.push(parts[i]);
		}
	}
	return placeholders;
}

function processArgs(
	placeholders: string[],
	conversion: ValueConversion,
	dataFormats: Partial<DataFormats>,
	localizer: Localizer,
	args?: LocalizableArgs
): { [key: string]: string | undefined } {
	if (!args) {
		return {};
	}
	return Object.entries(args).reduce(
		(acc: { [key: string]: string | undefined }, [key, placeholder]) => {
			// we only want to calculate the placeholders that will actually be inserted!
			if (!placeholders.includes(key)) {
				return acc;
			}
			switch (placeholder.type) {
				case "plain": {
					acc[key] = `${placeholder.value}`;
					break;
				}
				case "localizable": {
					acc[key] = localizer(...placeholder.properties);
					break;
				}
				case "formattable": {
					acc[key] =
						conversion.formatValue(
							placeholder.value as SupportedType,
							placeholder.properties.formattingConfig
						) ?? undefined;
					break;
				}
				case "dataFormat": {
					if ("decimalSeparator" === placeholder.properties.type) {
						acc[key] = localizeDecimalSeparator(placeholder.value, dataFormats);
					} else if ("date" === placeholder.properties.type) {
						acc[key] = localizeDateFormat(placeholder.value, dataFormats);
					} else if ("dateRange" === placeholder.properties.type) {
						acc[key] = localizeDateRangeFormat(placeholder.value, dataFormats);
					}
					break;
				}
				default: {
					throw new Error(`Unexpected localizable placeholder type encountered!`);
				}
			}

			return acc;
		},
		{}
	);
}
