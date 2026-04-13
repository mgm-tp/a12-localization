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

/**
 * Replaces all placeholders in the given template string with their values as given by the 2nd parameter.
 *
 * @param template the template string that contains the placeholders
 * @param args the mapping of placeholder name to actual value
 * @returns a string with all placeholders replaced with their values
 */
export function resolvePlaceholders(
	template: string,
	args: { [key: string]: string | undefined }
): string {
	const parts: string[] = template.split("$");
	// only every 2nd occurrence is actually a parameter since $ is the start and end delimiter
	for (let i = 1; i < parts.length; i = i + 2) {
		if (i === parts.length - 1) {
			// if the amount of $ are uneven, the last occurrence should not be treated as placeholder
			parts[i] = `$${parts[i]}`;
		} else {
			parts[i] = fillInPlaceholderValue(parts[i], args);
		}
	}
	return parts.join("");
}

function fillInPlaceholderValue(
	placeholder: string,
	args: { [key: string]: string | undefined }
): string {
	// to allow for $ itself, an empty placeholder ($$) is treated as $
	if (placeholder.length === 0) {
		return "$";
	}
	// the empty string is a valid value
	// other than that: if no value is given for the placeholder, fall back to the placeholder itself
	const value = args[placeholder];
	if (value === "") {
		return "";
	}
	return value ?? `$${placeholder}$`;
}
