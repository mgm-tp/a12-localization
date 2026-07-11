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

import type { ValueConversionParseError } from "../../../conversion.js";
import type { LocalizableArgs } from "../../../localization/Localizable.js";

import type { Localizable } from "../../../localization/Localizable.js";

/**
 * Type for localizable default texts.
 */
export type LocalizableDefaults = {
	readonly [locale: string]: string | undefined;
};

/**
 * Utility class for handling {@link Localizable}s.
 */
export class LocalizableUtil {
	/**
	 * @returns a formal error key ('kernel.formalErrors.${key}').
	 */
	public static createFormalErrorKeyFromString(key: string): string {
		return `kernel.formalErrors.${key}`;
	}

	/**
	 * @returns a {@link ValueConversionParseError} with the given error key, error code,
	 * {@link LocalizableArgs} and localizable default error texts.
	 */
	public static createParseError(
		errorKey: string,
		errorCode: string,
		args: LocalizableArgs,
		errorTextDefaults: LocalizableDefaults
	): ValueConversionParseError {
		const formalErrorKey = LocalizableUtil.createFormalErrorKeyFromString(errorKey);
		const localizableErrorText = {
			key: formalErrorKey,
			args,
			defaults: errorTextDefaults
		};
		return {
			errorKey: formalErrorKey,
			errorText: localizableErrorText,
			errorCode: errorCode,
			severity: "ERROR"
		};
	}
}
