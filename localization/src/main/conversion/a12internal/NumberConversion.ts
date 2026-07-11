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

import type {
	NumberConversionConfig,
	SupportedTypeWithoutNull,
	ValueConversionParseError
} from "../../conversion.js";

import type { DataFormatPlaceholder, LocalizableArgs } from "../../localization/Localizable.js";

import type { DataFormats } from "../../localization/DataFormats.js";

import { BigDecimal } from "./util/BigDecimal.js";
import type { LocalizableDefaults } from "./util/LocalizableUtil.js";
import { LocalizableUtil } from "./util/LocalizableUtil.js";
import { NumberUtil } from "./util/NumberUtil.js";

/**
 * Conversion methods for number data types.
 */
export class NumberConversion {
	// List of valid separators
	private static readonly VALID_SEPARATORS: string[] = [".", ","];

	public static readonly MAX_ALLOWED_NUMBER_OF_DIGITS = 15;

	/**
	 * Converts the given value from one format to other format among the same data type.<br>
	 * <code>minFractionalDigits</code> from <code>inputFormat</code> is ignored.<br>
	 * <code>decimalPlacesOptional</code> and <code>minFractionalDigits</code> work together:
	 * Only if <code>decimalPlacesOptional==true</code> in <code>srcDataType</code> and <code>decimalPlacesOptional==false</code> in <code>destDataType</code>,
	 * missing zeroes are added in the decimal part in order to fulfill <code>minFractionalDigits</code> from <code>destDataType</code>.</li>
	 * @param value value to be converted
	 * @param srcDataType configuration which describes the given value
	 * @param destDataType configuration to which the given value should be converted
	 * @returns the converted string value
	 */
	public static convert(
		value: string,
		srcDataType: NumberConversionConfig & DataFormats,
		destDataType: NumberConversionConfig & DataFormats
	): string {
		if (value.length === 0) {
			return value;
		}
		const inputDecimalSeparator = NumberConversion._getDecimalSeparator(srcDataType);
		if (srcDataType.thousandsSeparator) {
			value = value.replaceAll(srcDataType.thousandsSeparator, "");
		}
		const outputDecimalSeparator = NumberConversion._getDecimalSeparator(destDataType);
		value = value.replace(inputDecimalSeparator, outputDecimalSeparator);
		// just in the case that in the source optional decimal places are allowed and in the destination not, we add missing 0's
		if (srcDataType.decimalPlacesOptional && !destDataType.decimalPlacesOptional) {
			const outputMinFractionalDigits = NumberConversion._getMinFractionalDigits(destDataType);
			value = NumberUtil.addDecimalPlacesIfNecessary(
				value,
				outputDecimalSeparator,
				NumberConversion._decimalIndexForValidation(outputDecimalSeparator),
				outputMinFractionalDigits
			);
		}
		if (destDataType.thousandsSeparator) {
			value = NumberUtil.addThousandsSeparator(
				value,
				destDataType.thousandsSeparator,
				outputDecimalSeparator
			);
		}
		return value;
	}

	/**
	 * See also the description of defaultValueConversion#parseValue.
	 */
	public static convertStringToNumber(
		value: string,
		srcDataType: NumberConversionConfig & DataFormats
	): number | string | null {
		const decimalSeparator = NumberConversion._getDecimalSeparator(srcDataType);
		const leadingZerosAllowed = NumberConversion._areLeadingZerosAllowed(srcDataType);
		return NumberUtil.createBigDecimalIfPossible(leadingZerosAllowed, value, decimalSeparator);
	}

	/**
	 * See also the description of defaultValueConversion#parseValue.
	 */
	public static parseNumber(
		value: string,
		srcDataType: NumberConversionConfig & DataFormats
	): {
		value?: number | string | null;
		parseError?: ValueConversionParseError;
	} {
		if (!value) {
			return { value: null };
		}
		const thousandsSeparator = srcDataType.thousandsSeparator;
		// the implementation in the sanity checks is based on the value without thousands separator
		if (thousandsSeparator) {
			value = value.replaceAll(thousandsSeparator, "");
		}
		const error = NumberConversion._sanityCheck(value, srcDataType);
		if (error === undefined) {
			return {
				value: NumberConversion.convertStringToNumber(value, srcDataType)
			};
		} else {
			return { parseError: error };
		}
	}

	/**
	 * See also the description of defaultValueConversion#formatValue.
	 */
	public static convertNumberToString(
		value: SupportedTypeWithoutNull,
		destDataType: NumberConversionConfig & DataFormats
	): string {
		// null is already handled
		const decimalSeparator = NumberConversion._getDecimalSeparator(destDataType);
		const leadingZerosAllowed = NumberConversion._areLeadingZerosAllowed(destDataType);
		if (
			typeof value === "string" &&
			NumberUtil.areAllowedLeadingZerosPresent(leadingZerosAllowed, value, decimalSeparator)
		) {
			return value;
		}
		if (typeof value !== "number") {
			throw new Error("The type of the value (" + typeof value + ") is not a number");
		}
		const thousandsSeparator = destDataType.thousandsSeparator;
		NumberConversion._checkSeparators(decimalSeparator, thousandsSeparator);
		const fractionalDigits = NumberConversion._determineFractionalDigits(value, destDataType);
		const resultWithDot: string = value.toFixed(fractionalDigits);
		let result = resultWithDot.replace(".", decimalSeparator);
		if (thousandsSeparator) {
			result = NumberUtil.addThousandsSeparator(result, thousandsSeparator, decimalSeparator);
		}
		return result;
	}

	private static _determineFractionalDigits(
		value: number,
		numberDataType: NumberConversionConfig & DataFormats
	): number {
		const bigDecimal: BigDecimal = new BigDecimal(value);
		const minScale: number = bigDecimal.scale();
		const minFractionalDigits: number = numberDataType.decimalPlacesOptional
			? 0
			: NumberConversion._getMinFractionalDigits(numberDataType);
		const currentFractionalDigits = Math.max(minScale, minFractionalDigits);
		// in case the number is too big (more than 15 digits)
		const maxAllowedFractionalDigits = Math.max(
			0,
			NumberConversion.MAX_ALLOWED_NUMBER_OF_DIGITS - bigDecimal.numberOfIntegerDigits()
		);
		return Math.min(currentFractionalDigits, maxAllowedFractionalDigits);
	}

	private static _sanityCheck(
		value: string,
		srcDataType: NumberConversionConfig & DataFormats
	): ValueConversionParseError | undefined {
		const decimalSeparator = NumberConversion._getDecimalSeparator(srcDataType);
		const thousandsSeparator = srcDataType.thousandsSeparator;
		NumberConversion._checkSeparators(decimalSeparator, thousandsSeparator);

		const index: number = NumberConversion._decimalIndexForValidation(decimalSeparator);
		if (!NumberUtil.DECIMAL_PLACES_OPTIONAL_PRECHECK_PATTERN[index].test(value)) {
			const errorTextDefaults: LocalizableDefaults = {
				de: "Es sind nur Zahlen erlaubt.",
				en: "Only numbers are allowed.",
				fr: "Seuls les nombres sont autorisés.",
				nl: "Gelieve een getal invullen."
			};
			return NumberConversion._createParseErrorForNumber(
				"ZAHL_MIT_UNGUELTIGEN_ZEICHEN",
				"zahlHatUngueltigeZeichen",
				errorTextDefaults,
				decimalSeparator
			);
		}

		// We just want to check the number of digits, 15 are the maximum allowed
		// Decimal separators and signs must be filtered out
		const digits: string = value.replace(decimalSeparator, "").replace(/-/g, "");
		if (digits.length > NumberConversion.MAX_ALLOWED_NUMBER_OF_DIGITS) {
			const errorTextDefaults: LocalizableDefaults = {
				de: "Es sind maximal 15 Stellen erlaubt.",
				en: "Only values with up to 15 digits are allowed.",
				fr: "Seules les valeurs contenant jusqu'à 15 chiffres sont autorisées.",
				nl: "Er mogen alleen waardes van maximaal 15 cijfers worden ingevuld."
			};
			return NumberConversion._createParseErrorForNumber(
				"STELLIGKEIT_ZU_LANG",
				"stelligkeitZuLang",
				errorTextDefaults,
				decimalSeparator
			);
		}
		return undefined;
	}

	private static _checkSeparators(
		decimalSeparator: string,
		thousandsSeparator: string | undefined
	): void {
		if (
			decimalSeparator !== undefined &&
			!NumberConversion.VALID_SEPARATORS.includes(decimalSeparator)
		) {
			throw new Error(
				"Invalid number conversion configuration: The decimal separator '" +
					decimalSeparator +
					"' is invalid."
			);
		}

		if (!!thousandsSeparator && !decimalSeparator) {
			throw new Error("If a thousands separator was defined, a decimal separator must be defined.");
		}

		if (thousandsSeparator !== undefined && thousandsSeparator === decimalSeparator) {
			throw new Error("Decimal separator and thousands separator must not be the same!");
		}
	}

	private static _getDecimalSeparator(dataType: NumberConversionConfig & DataFormats): string {
		return dataType.decimalSeparator ?? ".";
	}

	private static _getMinFractionalDigits(dataType: NumberConversionConfig): number {
		return dataType.minFractionalDigits ?? 0;
	}

	private static _areLeadingZerosAllowed(dataType: NumberConversionConfig): boolean {
		return dataType.leadingZerosAllowed ?? false;
	}

	/**
	 * Return the index (dot or comma) for validation.
	 * In the arrays the dot notation is always stored in value 0 and
	 * the comma notation in value 1.
	 *
	 * @return index that returns the relevant representation in the array.
	 */
	private static _decimalIndexForValidation(decimalSeparator: string): number {
		return decimalSeparator === "." ? 0 : 1;
	}

	private static _createParseErrorForNumber(
		errorKey: string, //statt RuntimeFormalErrorEnum,
		errorId: string,
		errorTextDefaults: LocalizableDefaults,
		decimalSeparator: string
	): ValueConversionParseError {
		const decimalSeparatorPlaceholder: DataFormatPlaceholder = {
			type: "dataFormat",
			value: decimalSeparator,
			properties: {
				type: "decimalSeparator"
			}
		};
		const args: LocalizableArgs = {
			decimalSeparator: decimalSeparatorPlaceholder
		};
		return LocalizableUtil.createParseError(errorKey, errorId, args, errorTextDefaults);
	}
}
