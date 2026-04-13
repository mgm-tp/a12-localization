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

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility class for string types.
 */
export class StringUtil {
	/**
	 * Counts how many *separate non-overlapping* times `match` appears in `s`
	 *
	 * Examples:
	 *
	 * | s        | match | count |
	 * |----------|-------|-------|
	 * | xyzy     | y     | 2     |
	 * | xyzy     | xy    | 1     |
	 * | xyxyx    | xyx   | 1     |
	 * | foo      | bar   | 0     |
	 * | ""       | foo   | 0     |
	 * | foo      | ""    | 0     |
	 *
	 * @param s    the string to check
	 * @param match  the substring
	 * @return the number of occurrences, `0` if either string is empty
	 */
	public static countMatches(s: string, match: string): number {
		if (!s || !match) {
			return 0;
		}
		let count = 0;
		let idx = 0;
		while ((idx = s.indexOf(match, idx)) !== -1) {
			count++;
			idx += match.length;
		}
		return count;
	}

	/**
	 * Returns an implementation of the String.format(String format, Object... args) method. <br>
	 * The method replaces substrings of the passed string that match the regular expression "{(\d+)}"
	 * from left to right with the string representation of the passed arguments. Too many arguments are ignored.
	 * If too few arguments were passed, the "superfluous" substrings are not replaced.
	 *
	 * @param format String with placeholders to be replaced, e.g. "{0}, {1}, {2}"
	 * @param args Objects whose string representation replaces the placeholders
	 * @return String in which the individual elements were replaced.
	 */
	public static stringFormat(format: string, ...args: any[]): string {
		return format.replace(/{(\d+)}/g, (match, num) => {
			return args[num] !== undefined ? args[num] : match;
		});
	}
}
