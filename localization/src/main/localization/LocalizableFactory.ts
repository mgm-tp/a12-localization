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

import type { Localizable, LocalizableArgs } from "./Localizable.js";
import type { LocalizationTreeMap } from "./LocalizationTree.js";
import { resolveLocalizationText } from "./LocalizationTree.js";
import type { LocalizedModelText } from "./LocalizedModelText.js";

/**
 * Creates a {@link Localizable} using a {@link LocalizedModelText} to fill in the default translations.
 *
 * @param key the key of the {@link Localizable}
 * @param modelTexts the translations specified in a model
 * @param args the arguments for placeholder resolving
 * @returns the {@link Localizable} that can be passed to the localizer
 */
export function localizableFromModel(
	key: string,
	modelTexts: LocalizedModelText = [],
	args?: LocalizableArgs
): Localizable {
	if (key.length === 0) {
		throw new Error("Cannot create a Localizable with an empty key");
	}
	return {
		key,
		args,
		defaults: modelTexts.reduce((acc, text) => {
			return {
				...acc,
				[text.locale]: text.text
			};
		}, {})
	};
}

/**
 * Creates a {@link Localizable} using a {@link LocalizationTreeMap} to fill in the default translations.
 *
 * @param key the key of the {@link Localizable}
 * @param localizationTreeMap the {@link LocalizationTreeMap} that contains the default translations
 * @param args the arguments for placeholder resolving
 * @returns the {@link Localizable} that can be passed to the localizer
 */
export function localizableFromLocalizationTreeMap(
	key: string,
	localizationTreeMap: LocalizationTreeMap,
	args?: LocalizableArgs
): Localizable {
	if (key.length === 0) {
		throw new Error("Cannot create a Localizable with an empty key");
	}
	return {
		key,
		args,
		defaults: Object.keys(localizationTreeMap).reduce((acc, locale) => {
			const localizationTree = localizationTreeMap[locale];
			if (localizationTree) {
				return {
					...acc,
					[locale]: resolveLocalizationText(localizationTree, key)
				};
			}
			return acc;
		}, {})
	};
}
