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
 * Utility class for handling number types.
 */
export class NumberUtil {
	/**
	 * Regular Expression which should be matched for numbers (optional minus sign and dot or comma as decimal separator).
	 * Plus signs are not allowed.
	 */
	public static readonly NUMBER_PATTERN: RegExp[] = [
		new RegExp("^(?:[-]?[0-9]+(\\.[0-9]+)?)$"),
		new RegExp("^(?:[-]?[0-9]+(,[0-9]+)?)$")
	];

	public static readonly DECIMAL_PLACES_OPTIONAL_PRECHECK_PATTERN: RegExp[] = [
		new RegExp("^(?:[-]?[0-9]+(\\.[0-9]*)?)$"),
		new RegExp("^(?:[-]?[0-9]+(,[0-9]*)?)$")
	];

	/**
	 * @param value value to check and enhance if necessary.
	 * @param decimalSeparator decimal separator which the value could contain.
	 * @param index the index representing the dot notation (0) or the comma notation (1).
	 * @param minFractionalDigits the minimum number of fractional digits.
	 * @returns the given value with added zeros as decimal places, if the specified minimum of fractional digits is > 0.
	 */
	public static addDecimalPlacesIfNecessary(
		value: string,
		decimalSeparator: string,
		index: number,
		minFractionalDigits: number
	): string {
		// If the input is not a valid number before adding zeroes it will also not be valid afterwards.
		// Hence we should just return the original input s.t. the resulting error message does not change.
		const regexp: RegExp = NumberUtil.DECIMAL_PLACES_OPTIONAL_PRECHECK_PATTERN[index];
		if (!regexp.test(value)) {
			return value;
		}

		// Difference to Java-Code: no escape of '.' needed
		const parts: string[] = value.split(decimalSeparator);
		if (parts.length === 2) {
			// If the given number has a decimal separator, we add zeroes if necessary.
			const fractionalDigits = parts[1];
			if (minFractionalDigits > 0 && minFractionalDigits > fractionalDigits.length) {
				return value + "0".repeat(minFractionalDigits - fractionalDigits.length);
			}
		} else if (parts.length === 1) {
			// If there is no decimal separator so far we need to add one before adding zeroes.
			if (minFractionalDigits > 0) {
				return parts[0] + decimalSeparator + "0".repeat(minFractionalDigits);
			}
		}
		// If we did not return anything yet, there is no need to add additional decimal places
		// (or there is something seriously wrong with the input string, but this case should be handled by validiereFormat)
		return value;
	}

	/**
	 * @param value value to check and enhance if necessary.
	 * @param thousandsSeparator thousands separator which the returned value should contain.
	 * @param decimalSeparator decimal separator which the value could contain.
	 * @returns the given value with the given thousands separators added to it.
	 */
	public static addThousandsSeparator(
		value: string,
		thousandsSeparator: string,
		decimalSeparator: string
	): string {
		const decimalIndex = value.includes(decimalSeparator)
			? value.indexOf(decimalSeparator)
			: value.length;
		// here we determine where the number starts (without minus)
		const numberStart = value.indexOf("-") + 1;
		const charArray: string[] = value.split("");
		// Add the separators from back to front to not shuffle the places
		for (let i = decimalIndex - 3; i > numberStart; i -= 3) {
			charArray.splice(i, 0, thousandsSeparator);
		}
		return charArray.join("");
	}

	/**
	 *
	 * @param value
	 *            value to check
	 * @param decimalSeparator
	 *            decimal separator which the value could contain
	 * @returns <code>true</code> if <b>all</b> following conditions are met:
	 *         <ol>
	 *         <li>the character after the sign (if present) is <code>0</code></li>
	 *         <li>there are more characters after the <code>0</code> found in the previous step</li>
	 *         <li>the character right after the <code>0</code> from the first step is not the decimal
	 *         separator</li>
	 *         </ol>
	 *         Otherwise <code>false</code>
	 */
	public static containsLeadingZeros(value: string, decimalSeparator: string): boolean {
		const indexAfterSign: number = value.startsWith("+") || value.startsWith("-") ? 1 : 0;
		return (
			value.charAt(indexAfterSign) === "0" &&
			value.length > indexAfterSign + 1 &&
			value.charAt(indexAfterSign + 1) !== decimalSeparator.charAt(0)
		);
	}

	/**
	 * @returns <code>true</code> if leading zeros are allowed and the value contains leading zeros (see
	 *         also {@link containsLeadingZeros}, otherwise <code>false</code>.
	 */
	public static areAllowedLeadingZerosPresent(
		leadingZerosAllowed: boolean,
		value: string,
		decimalSeparator: string
	): boolean {
		return leadingZerosAllowed && NumberUtil.containsLeadingZeros(value, decimalSeparator);
	}

	/**
	 * @returns the corresponding number taking into account the decimal set
	 * or <code>null</code> if the given value is empty.
	 */
	public static createBigDecimal(value: string, decimalSeparator: string): number | null {
		if (!value) {
			return null;
		}
		const valueWithDot: string = value.replace(decimalSeparator, ".");
		return +valueWithDot;
	}

	/**
	 * @returns the given value with "." as decimal separator, if the value is not empty or null and leading zeros are sepcified as not allowed.
	 */
	public static createBigDecimalIfPossible(
		leadingZerosAllowed: boolean,
		value: string,
		decimalSeparator: string
	): number | string | null {
		/*
		 * first we try to convert the given value to ensure that it is a valid number,
		 * we have to intercept inputs like "000test" which would be a wrong input
		 */
		const result = NumberUtil.createBigDecimal(value, decimalSeparator);
		if (
			result != null &&
			NumberUtil.areAllowedLeadingZerosPresent(leadingZerosAllowed, value, decimalSeparator)
		) {
			// If leading zeros are allowed and present, we will return the given string value.
			// We still need to make sure that the decimalSeparator is always ".".
			return value.replace(decimalSeparator, ".");
		} else {
			return result;
		}
	}
}
