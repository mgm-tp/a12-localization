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

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Localizable } from "./Localizable.js";

/**
 * Creates a valid {@link Localizable} key from the given segments.
 * Any occurrence of '.' and '\\' characters in the given segments is escaped in the output string.
 * @param segments - the segments to join into the key string
 * @returns the complete string with escaping applied if required
 */
export function localizableKeyFromSegments(segments: string[]): string {
	return segments.map(addDotEscaping).join(".");
}

/**
 * Deconstructs the given {@link Localizable} key into its original segments.
 * Any escaping of '.' and '\\' characters in the given key is undone.
 * @param key - the {@link Localizable} key
 * @returns the list of individual segments for the given {@link Localizable} key
 */
export function segmentsFromLocalizableKey(key: string): string[] {
	return key.split(".").map(removeDotEscaping);
}

/**
 * @returns the given input string with an escaping of all occurrences of '.' and '\\'
 */
export function addDotEscaping(input: string): string {
	let result = "";
	for (const s of input) {
		if ("." === s) {
			result += "\\p";
		} else if ("\\" === s) {
			result += "\\\\";
		} else {
			result += s;
		}
	}
	return result;
}

/**
 * @returns the given input string with all escape characters for '.' and '\\' removed
 */
export function removeDotEscaping(input: string): string {
	let result = "";
	let escapeCharacterPassed = false;
	let position = 0;
	for (const s of input) {
		if ("\\" === s) {
			if (escapeCharacterPassed) {
				result += "\\";
			}
			escapeCharacterPassed = !escapeCharacterPassed;
		} else if ("p" === s) {
			if (escapeCharacterPassed) {
				result += ".";
				escapeCharacterPassed = false;
			} else {
				result += "p";
			}
		} else {
			if (escapeCharacterPassed) {
				throw new Error(
					`Invalid occurrence of '\\' encountered in input string '${input}' at position '${position}'`
				);
			}
			result += s;
		}
		position++;
	}
	return result;
}
