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
	BooleanConversionConfig,
	ConfirmConversionConfig,
	SupportedTypeWithoutNull,
	ValueConversionParseError
} from "../../conversion.js";

import type { DataFormats } from "../../localization/DataFormats.js";

/**
 * Conversion methods for boolean data types with three value logic (true/false/null).
 */
export class BooleanConversion {
	/**
	 * Converts the given value from one format to other format among the same data type.<br>
	 * If the given value cannot be assigned to either <code>trueValue</code> or <code>falseValue</code> from <code>inputFormat</code>,
	 * the original value is returned.
	 * @param value value to be converted
	 * @param srcDataType configuration which describes the given value
	 * @param destDataType configuration to which the given value should be converted
	 * @returns the converted string value
	 */
	public static convert(
		value: string,
		srcDataType: BooleanConversionConfig & DataFormats,
		destDataType: BooleanConversionConfig & DataFormats
	): string {
		if (value.length === 0) {
			return value;
		}
		const srcTrueValue = BooleanConversion.getTrueValue(srcDataType);
		if (srcTrueValue === value) {
			return BooleanConversion.getTrueValue(destDataType);
		}
		const srcFalseValue = BooleanConversion.getFalseValue(srcDataType);
		if (srcFalseValue === value) {
			return BooleanConversion.getFalseValue(destDataType);
		}
		return value;
	}

	/**
	 * See also the description of defaultValueConversion#parseValue.
	 */
	public static convertStringToBoolean(
		value: string,
		srcDataType: BooleanConversionConfig & DataFormats
	): { value?: boolean | null; parseValue?: ValueConversionParseError } {
		const srcTrueValue = BooleanConversion.getTrueValue(srcDataType);
		if (srcTrueValue === value) {
			return { value: true };
		}
		const srcFalseValue = BooleanConversion.getFalseValue(srcDataType);
		if (srcFalseValue === value) {
			return { value: false };
		}
		return { value: null };
	}

	/**
	 * See also the description of defaultValueConversion#formatValue.
	 */
	public static convertBooleanToString(
		value: SupportedTypeWithoutNull,
		destDataType: BooleanConversionConfig & DataFormats
	): string {
		// null is already handled
		if (typeof value !== "boolean") {
			throw new Error("The type of the value (" + typeof value + ") is not a boolean");
		}
		if (value) {
			return BooleanConversion.getTrueValue(destDataType);
		} else {
			return BooleanConversion.getFalseValue(destDataType);
		}
	}

	/**
	 * @returns the definition of the true value if defined, otherwise the default value <code>true</code>.
	 */
	public static getTrueValue(
		dataType: (BooleanConversionConfig | ConfirmConversionConfig) & DataFormats
	): string {
		return dataType.trueValue ? dataType.trueValue : "true";
	}

	/**
	 * @returns the definition of the false value if defined, otherwise the default value <code>false</code>.
	 */
	public static getFalseValue(dataType: BooleanConversionConfig & DataFormats): string {
		return dataType.falseValue ? dataType.falseValue : "false";
	}
}
