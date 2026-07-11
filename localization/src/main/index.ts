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

import type { DataFormats } from "./localization/DataFormats.js";
import { defaultDataFormats } from "./localization/DataFormats.js";
import { defaultLocalizerFactory } from "./localization/defaultLocalizerFactory.js";
import type {
	TextResolver,
	TranslationFinder,
	TranslationWithArgs
} from "./localization/defaultTranslationFinder.js";
import {
	createTextResolverForTreeMap,
	defaultTranslationFinderFactory
} from "./localization/defaultTranslationFinder.js";
import type { PartialLocale } from "./localization/Locale.js";
import { Locale } from "./localization/Locale.js";
import type {
	DataFormatPlaceholder,
	DataFormatProperties,
	FormatProperties,
	FormattablePlaceholder,
	Localizable,
	LocalizableArgs,
	LocalizablePlaceholder,
	Placeholder,
	PlainPlaceholder
} from "./localization/Localizable.js";
import {
	localizableFromLocalizationTreeMap,
	localizableFromModel
} from "./localization/LocalizableFactory.js";
import {
	addDotEscaping,
	localizableKeyFromSegments,
	removeDotEscaping,
	segmentsFromLocalizableKey
} from "./localization/LocalizableKeyFactory.js";
import type {
	LocalizationKeyTree,
	LocalizationTree,
	LocalizationTreeMap
} from "./localization/LocalizationTree.js";
import { initializeKeys, resolveLocalizationText } from "./localization/LocalizationTree.js";
import type { LocalizedModelText, LocalizedText } from "./localization/LocalizedModelText.js";
import type { Localizer } from "./localization/Localizer.js";
import { resolvePlaceholders } from "./localization/resolvePlaceholders.js";

export {
	addDotEscaping,
	createTextResolverForTreeMap,
	defaultDataFormats,
	defaultLocalizerFactory,
	defaultTranslationFinderFactory,
	initializeKeys,
	Locale,
	localizableFromLocalizationTreeMap,
	localizableFromModel,
	localizableKeyFromSegments,
	removeDotEscaping,
	resolveLocalizationText,
	resolvePlaceholders,
	segmentsFromLocalizableKey
};
export type {
	DataFormatPlaceholder,
	DataFormatProperties,
	DataFormats,
	FormatProperties,
	FormattablePlaceholder,
	Localizable,
	LocalizableArgs,
	LocalizablePlaceholder,
	LocalizationKeyTree,
	LocalizationTree,
	LocalizationTreeMap,
	LocalizedModelText,
	LocalizedText,
	Localizer,
	PartialLocale,
	Placeholder,
	PlainPlaceholder,
	TextResolver,
	TranslationFinder,
	TranslationWithArgs
};

export * from "./conversion.js";
