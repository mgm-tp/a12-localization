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

import { BooleanConversion } from "./conversion/a12internal/BooleanConversion.js";
import { ConfirmConversion } from "./conversion/a12internal/ConfirmConversion.js";
import { DateConversion } from "./conversion/a12internal/DateConversion.js";
import { DateRangeConversion } from "./conversion/a12internal/DateRangeConversion.js";
import { NumberConversion } from "./conversion/a12internal/NumberConversion.js";
import { StringConversion } from "./conversion/internal/StringConversion.js";
import type { DataFormats } from "./localization/DataFormats.js";
import { InternalDefaultDataFormats } from "./localization/DataFormats.js";
import type { Localizable } from "./localization/Localizable.js";

export namespace ValueConversion {
	/**
	 * Data structure to define an error while parsing a value.
	 * This error can happen if the user input is invalid,
	 * e.g. the user input "test" should be parsed to a number.
	 */
	export interface ParseError {
		/**
		 * A key to identify the kind of error, e.g. for localization.
		 */
		readonly errorKey: string;

		/**
		 * A localizable error message.
		 */
		readonly errorText: Localizable;

		/**
		 * The error code of the syntactical validation.
		 */
		readonly errorCode: string;

		/**
		 * The severity of the error.
		 */
		readonly severity: "ERROR" | "WARNING" | "INFO";
	}
}

/**
 * Provides conversion logic:
 * <ul>
 * <li>parse string value to the corresponding typed value, see {@link ValueConversion.parseValue}</li>
 * <li>format typed value to the corresponding string representation, see {@link ValueConversion.formatValue}</li>
 * </ul>
 */
export interface ValueConversion {
	/**
	 * Parses the given string value to the corresponding typed value.
	 * @param value string value to be parsed
	 * @param inputFormat configuration which describes the given value
	 * @returns the corresponding typed value or a {@link ValueConversion.ParseError} occurred while parsing the given value
	 */
	parseValue(
		value: string,
		inputFormat: ValueConversionConfig
	): { value?: SupportedType; parseError?: ValueConversion.ParseError };

	/**
	 * Formats the given typed value.
	 * @param value typed value to be formatted
	 * @param outputFormat configuration based on which the given value should be formatted
	 * @returns the corresponding formatted value
	 */
	formatValue(value: SupportedType, outputFormat: ValueConversionConfig): string | undefined;
}

/**
 * This implementation <b>does not</b> support conversion between different types of {@link ValueConversionConfig},
 * e.g. from {@link NumberConversionConfig} to {@link DateConversionConfig},
 * or even from {@link DateConversionConfig} to {@link DateFragmentConversionConfig}.
 * <p>
 * <b>General notes:</b>
 * <ul>
 *   <li>In general the parsing (specially to a {@link Date} value) is a little more strict about checking the given value than the formatting.
 *       During formatting, a specific object is given and we don't expect this to be erroneous.</li>
 *   <li>Boolean (see also {@link BooleanConversionConfig})
 *   <ul>
 *     <li>If <code>trueValue</code> is not defined, the default value is used.</li>
 *     <li>If <code>falseValue</code> is not defined, the default value is used.</li>
 *   </ul>
 *   </li>
 *   <li>Confirm (see also {@link ConfirmConversionConfig})
 *   <ul>
 *     <li>If <code>trueValue</code> is not defined, the default value is used.</li>
 *   </ul>
 *   </li>
 *   <li>Common notes for date related types
 *   <ul>
 *     <li>Be aware how the configuration in {@link DataFormats} influence <code>format</code> in the corresponding <code>ConversionConfig</code>:
 *     <ul>
 *         <li>{@link DataFormats.dateTimeFormat} will be considered if {@link DateTimeConversionConfig.format} contains a date part (recognized by the month 'MM') and a time part (recognized by the hours 'HH' or 'hh').</li>
 *         <li>{@link DataFormats.timeFormat} will be considered if {@link TimeConversionConfig.format} contains a time part (recognized by the hours 'HH' or 'hh'), but no date part (recognized by the month 'MM').</li>
 *         <li>All other date configurations in {@link DataFormats} affect <code>format</code> in {@link DateConversionConfig}, {@link DateFragmentConversionConfig} and {@link DateRangeConversionConfig}.</li>
 *     </ul>
 *     </li>
 *     <li>If <code>baseYear</code> is not defined, the default value is used.
 *       This configuration is used when dealing with date formats which don't define the year, e.g. <code>MM-dd</code>.</li>
 *     <li>While parsing a value with only time, the value <code>1970-01-01</code> is used for the date part.</li>
 *     <li>If <code>timeZone</code> is not defined, the default value is used.</li>
 *     <li>We rely on the behavior of a third party library regarding the parsing and formatting of a date.</li>
 *   </ul>
 *   </li>
 *   <li>Date (see also {@link DateConversionConfig})
 *   <ul>
 *     <li>See also "Common notes for date related types".</li>
 *     <li>If <code>datePrecision</code> is not defined, the default value is used.</li>
 *   </ul>
 *   </li>
 *   <li>DateFragment, DateTime and Time (see also {@link DateFragmentConversionConfig}, {@link DateTimeConversionConfig}, {@link TimeConversionConfig})
 *   <ul>
 *     <li>See also "Common notes for date related types".</li>
 *   </ul>
 *   </li>
 *   <li>DateRange (see also {@link DateRangeConversionConfig})
 *   <ul>
 *     <li>See also "Common notes for date related types".</li>
 *     <li>If <code>rangeSeparator</code> is not defined, the default value is used.</li>
 *   </ul>
 *   </li>
 *   <li>Number (see also {@link NumberConversionConfig})
 *   <ul>
 *     <li>If <code>decimalSeparator</code> is not defined, the default value is used.</li>
 *     <li>If <code>decimalPlacesOptional</code> is not defined, the default value is used.</li>
 *     <li>If <code>minFractionalDigits</code> is not defined, the default value is used.</li>
 *     <li>If <code>leadingZerosAllowed</code> is not defined, the default value is used.</li>
 *   </ul>
 *   </li>
 *   <li>String (see also {@link StringConversionConfig}, {@link EnumerationConversionConfig}, {@link CustomStringConversionConfig})
 *   <ul>
 *     <li>The is no conversion at all, the original value is returned.</li>
 *   </ul>
 *   </li>
 * </ul>
 */
export const defaultValueConversion: (dataFormats?: Partial<DataFormats>) => ValueConversion = (
	dataFormats?: Partial<DataFormats>
) => ({
	/**
	 * See also the description of {@link defaultValueConversion}.
	 * Please be aware of the following additional notes for this method:
	 * <ul>
	 *   <li>Boolean (see also {@link BooleanConversionConfig})
	 *   <ul>
	 *     <li>If the given value cannot be assigned to either <code>trueValue</code> or <code>falseValue</code> from <code>inputFormat</code>,
	 *       <code>null</code> is returned.</li>
	 *   </ul>
	 *   </li>
	 *   <li>Confirm (see also {@link ConfirmConversionConfig})
	 *   <ul>
	 *     <li>If the given value cannot be assigned to <code>trueValue</code> from <code>inputFormat</code>, <code>null</code> is returned.</li>
	 *   </ul>
	 *   </li>
	 *   <li>Date (see also {@link DateConversionConfig})
	 *   <ul>
	 *     <li>If at least one date part is unknown (e.g. 1980-01-00), the original value is returned.</li>
	 *   </ul>
	 *   </li>
	 *   <li>DateFragment, DateTime and Time (see also {@link DateFragmentConversionConfig}, {@link DateTimeConversionConfig} and {@link TimeConversionConfig})
	 *   <ul>
	 *     <li>There are no additional notes.</li>
	 *   </ul>
	 *   </li>
	 *   <li>DateRange (see also {@link DateRangeConversionConfig})
	 *   <ul>
	 *     <li>If <code>singleDate</code> is set to <code>"allowed"</code> or <code>"only"</code>, the <code>rangeSeparator</code> must not be empty.</li>
	 *   </ul>
	 *   </li>
	 *   <li>Number (see also {@link NumberConversionConfig})
	 *   <ul>
	 *     <li>If the given value contains leading zeroes and <code>leadingZerosAllowed==true</code>, the original value is returned.</li>
	 *   </ul>
	 *   </li>
	 *   <li>String (see also {@link StringConversionConfig}, {@link EnumerationConversionConfig}, {@link CustomStringConversionConfig})
	 *   <ul>
	 *     <li>There are no additional notes.</li>
	 *   </ul>
	 *   </li>
	 * </ul>
	 * @param value string value to be parsed
	 * @param inputFormat configuration which describes the given value
	 * @returns the corresponding typed value or a {@link ValueConversion.ParseError} occurred while parsing the given value, see also the method description
	 */
	parseValue(
		value: string,
		inputFormat: ValueConversionConfig
	): { value?: SupportedType; parseError?: ValueConversion.ParseError } {
		const df: DataFormats = {
			...InternalDefaultDataFormats,
			...dataFormats
		};
		switch (inputFormat.type) {
			case "BooleanType":
				return BooleanConversion.convertStringToBoolean(value, {
					...inputFormat,
					...df
				});
			case "ConfirmType":
				return ConfirmConversion.convertStringToConfirm(value, {
					...inputFormat,
					...df
				});
			case "NumberType":
				return NumberConversion.parseNumber(value, { ...inputFormat, ...df });
			case "DateType":
			case "DateTimeType":
			case "TimeType":
			case "DateFragmentType":
				return DateConversion.parseDate(value, { ...inputFormat, ...df });
			case "DateRangeType":
				return DateRangeConversion.parseDateRange(value, {
					...inputFormat,
					...df
				});
			case "StringType":
			case "CustomFieldType":
			case "EnumerationType":
				return { value: value };
		}
	},

	/**
	 * See also the description of {@link defaultValueConversion}.
	 * Please be aware of the following additional notes for this method:
	 * <ul>
	 *   <li>Boolean (see also {@link BooleanConversionConfig})
	 *   <ul>
	 *     <li>Only <code>boolean</code> and <code>null</code> values are supported.</li>
	 *   </ul>
	 *   </li>
	 *   <li>Confirm (see also {@link ConfirmConversionConfig})
	 *   <ul>
	 *     <li>Only <code>boolean</code> and <code>null</code> values are supported.</li>
	 *     <li>If the given value is <code>false</code>, <code>null</code> is returned.</li>
	 *   </ul>
	 *   </li>
	 *   <li>Date (see also {@link DateConversionConfig})
	 *   <ul>
	 *     <li><code>baseYear</code> and <code>datePrecision</code> are ignored.</li>
	 *     <li>Only <code>Date</code>, <code>string</code> and <code>null</code> values are supported.</li>
	 *     <li>A <code>string</code> value is supported, only if at least one date part is unknown (e.g. 1980-01-00).
	 *       In this case, the original value is returned.</li>
	 *     <li>Day and month of a date are always formatted with two digits.<br>
	 *       Example: for the date April 7th, 1999 and the format "yyyy-M-d" it returns "1999-04-07".</li>
	 *   </ul>
	 *   </li>
	 *   <li>DateFragment, DateTime and Time (see also {@link DateFragmentConversionConfig}, {@link DateTimeConversionConfig}, {@link TimeConversionConfig})
	 *   <ul>
	 *     <li><code>baseYear</code> is ignored.</li>
	 *     <li>Only <code>Date</code> and <code>null</code> values are supported.</li>
	 *     <li>Day and month of a date are always formatted with two digits.<br>
	 *       Example: for the date April 7th, 1999 and the format "yyyy-M-d" it returns "1999-04-07".</li>
	 *   </ul>
	 *   </li>
	 *   <li>DateRange (see also {@link DateRangeConversionConfig})
	 *   <ul>
	 *     <li><code>baseYear</code> and <code>interpretationOfYear</code> (if present) are ignored.</li>
	 *     <li>Only <code>Date[]</code>, <code>Date</code> and <code>null</code> values are supported.</li>
	 *     <li>Day and month of a date are always formatted with two digits.<br>
	 *       Example: for the date April 7th, 1999 and the format "yyyy-M-d" it returns "1999-04-07".</li>
	 *   </ul>
	 *   </li>
	 *   <li>Number (see also {@link NumberConversionConfig})
	 *   <ul>
	 *     <li>Only <code>number</code>, <code>string</code> and <code>null</code> values are supported.</li>
	 *     <li>A <code>string</code> value is supported, only if the value contains leading zeroes and <code>leadingZerosAllowed==true</code>.
	 *       In this case, the original value is returned.</li>
	 *     <li><code>decimalPlacesOptional</code> and <code>minFractionalDigits</code> work together:
	 *       Only if <code>decimalPlacesOptional==false</code>,
	 *         missing zeroes are added in the decimal part in order to fulfill <code>minFractionalDigits</code>.
	 *       Based on <code>minFractionalDigits</code>, exceeding fractional digits are <b>not</b> truncated.</li>
	 *   </ul>
	 *   </li>
	 *   <li>String (see also {@link StringConversionConfig}, {@link EnumerationConversionConfig}, {@link CustomStringConversionConfig})
	 *   <ul>
	 *     <li>There are no additional notes.</li>
	 *   </ul>
	 *   </li>
	 * </ul>
	 * @param value typed value to be formatted
	 * @param outputFormat configuration based on which the given value should be formatted
	 * @returns the corresponding formatted value, see also the method description
	 */
	formatValue(value: SupportedType, outputFormat: ValueConversionConfig): string | undefined {
		// in both cases ('null' and 'undefined') we return 'undefined'
		if (value == null) {
			return undefined;
		}
		if (
			outputFormat.type !== "StringType" &&
			outputFormat.type !== "CustomFieldType" &&
			outputFormat.type !== "EnumerationType" &&
			typeof value === "string" &&
			!value
		) {
			// output formats are filtered so that empty strings stay unchanged
			// for types that actually accept empty strings
			return undefined;
		}
		const df: DataFormats = {
			...InternalDefaultDataFormats,
			...dataFormats
		};
		switch (outputFormat.type) {
			case "BooleanType":
				return BooleanConversion.convertBooleanToString(value, {
					...outputFormat,
					...df
				});
			case "ConfirmType":
				return ConfirmConversion.convertConfirmToString(value, {
					...outputFormat,
					...df
				});
			case "NumberType":
				return NumberConversion.convertNumberToString(value, {
					...outputFormat,
					...df
				});
			case "DateType":
			case "DateTimeType":
			case "TimeType":
			case "DateFragmentType":
				return DateConversion.convertDateToString(value, {
					...outputFormat,
					...df
				});
			case "DateRangeType":
				return DateRangeConversion.convertDateRangeToString(value, {
					...outputFormat,
					...df
				});
			case "StringType":
			case "CustomFieldType":
			case "EnumerationType":
				return StringConversion.convertStringTypeToString(value);
		}
	}
});

/**
 * Defines the supported types which can be used as field value in a document.
 * In the conversion api, it is used as parsing output and formatting input.
 */
export type SupportedTypeWithoutNull = number | Date | Date[] | boolean | string;
export type SupportedType = SupportedTypeWithoutNull | null;
export namespace SupportedType {
	export function equals(valueA: SupportedType, valueB: SupportedType): boolean {
		if (typeof valueA !== typeof valueB) {
			return false;
		}
		switch (typeof valueA) {
			case "string":
			case "number":
			case "boolean":
				return valueA === valueB;
			case "object":
				// null
				if (valueA === null) {
					return valueB === null;
				}

				// Date[]
				if (Array.isArray(valueA)) {
					return (
						Array.isArray(valueB) &&
						valueA.length === 2 &&
						valueB.length === 2 &&
						SupportedType.dateEquals(valueA[0], valueB[0]) &&
						SupportedType.dateEquals(valueA[1], valueB[1])
					);
				}

				// Date
				return SupportedType.dateEquals(valueA, valueB as object);
			default:
				// undefined
				return valueA === undefined && valueB === undefined;
		}
	}

	export function dateEquals(valueA: object, valueB: object): boolean {
		return (
			valueA instanceof Date && valueB instanceof Date && valueA.getTime() === valueB.getTime()
		);
	}
}

/**
 * Models the basic configuration needed for conversion.
 */
export type ValueConversionConfig =
	| BooleanConversionConfig
	| ConfirmConversionConfig
	| DateConversionConfig
	| DateTimeConversionConfig
	| DateRangeConversionConfig
	| DateFragmentConversionConfig
	| EnumerationConversionConfig
	| NumberConversionConfig
	| StringConversionConfig
	| TimeConversionConfig
	| CustomStringConversionConfig;
interface BasicConversionConfig {
	readonly modelId?: string;
	/**
	 * A path to an element in a model.
	 * Each path segment contains the name of the element.
	 *
	 * Example:
	 * A model contains the element GroupA on root level.
	 * The model element GroupA contains the element Field1 as child.
	 * The model path looks like [{elementName: "GroupA"}, {elementName: "Field1"}]
	 */
	readonly modelPath?: {
		readonly elementName: string;
	}[];
}

/**
 * Data type for three value logic:
 * <ul>
 * <li>true</li>
 * <li>false</li>
 * <li>null</li>
 * </ul>
 */
export interface BooleanConversionConfig extends BasicConversionConfig {
	readonly type: "BooleanType";
}

/**
 * Data type for two value logic:
 * <ul>
 * <li>true</li>
 * <li>null</li>
 * </ul>
 */
export interface ConfirmConversionConfig extends BasicConversionConfig {
	readonly type: "ConfirmType";
}

/**
 * For partially known dates only. Definition of the date parts which are allowed to be unknown.
 */
export enum DatePrecision {
	FULL = "FULL",
	DAY_OPTIONAL = "DAY_OPTIONAL",
	MONTH_OPTIONAL = "MONTH_OPTIONAL",
	YEAR_OPTIONAL = "YEAR_OPTIONAL"
}

/**
 * Data type for all dates (date, date fragment, date range, date time and time).
 */
export interface DateBasicConversionConfig extends BasicConversionConfig {
	/**
	 * @defaultValue `2000`
	 */
	readonly baseYear?: number;
	/**
	 * @defaultValue `"UTC"`
	 */
	readonly timeZone?: string;
}

/**
 * Data type for dates and partially known dates.
 */
export interface DateConversionConfig extends DateBasicConversionConfig {
	readonly type: "DateType";
	readonly format: "yyyy-MM-dd";
	/**
	 * @defaultValue {@link DatePrecision.FULL}
	 */
	readonly datePrecision?: DatePrecision;
}

/**
 * For date ranges with date format <code>MM-dd</code> only. Definition of how to interpret the base year.
 */
export enum InterpretationOfYear {
	FROM = "FROM",
	TO = "TO"
}

/**
 * Data type for date ranges.
 */
export interface DateRangeConversionConfig extends DateBasicConversionConfig {
	readonly type: "DateRangeType";
	readonly format: "yyyy-MM-dd" | "yyyy-MM" | "MM-dd" | "yyyy" | "MM";
	/**
	 * @defaultValue `undefined`
	 */
	readonly interpretationOfYear?: InterpretationOfYear;
	/**
	 * If set to "allowed", besides a date range, a single date can also be provided
	 * to parseValue/formatValue for a date range field.
	 * If set to "only", a single date must be provided to parseValue/formatValue
	 * for a date range field.
	 * This date will then be parsed/formatted like a normal date, but will consider
	 * the given date range conversion configuration (e.g. format).
	 *
	 * @defaultValue "notAllowed"
	 */
	readonly singleDate: "notAllowed" | "allowed" | "only";
}

/**
 * Data type for date time.
 */
export interface DateTimeConversionConfig extends DateBasicConversionConfig {
	readonly type: "DateTimeType";
	readonly format: "yyyy-MM-dd'T'HH:mm:ss";
}

/**
 * Data type for time.
 */
export interface TimeConversionConfig extends DateBasicConversionConfig {
	readonly type: "TimeType";
	readonly format: "HH:mm:ss";
}

/**
 * Data type for dates without at least one date part (day, month, year).
 */
export interface DateFragmentConversionConfig extends DateBasicConversionConfig {
	readonly type: "DateFragmentType";
	readonly format: "yyyy-MM" | "MM-dd" | "yyyy" | "MM";
}

/**
 * Data type for numbers.
 */
export interface NumberConversionConfig extends BasicConversionConfig {
	readonly type: "NumberType";
	/**
	 * @defaultValue `0`
	 */
	readonly minFractionalDigits?: number;
	/**
	 * @defaultValue `false`
	 */
	readonly leadingZerosAllowed?: boolean;
}

/**
 * Data type for enumerations.
 */
export interface EnumerationConversionConfig extends BasicConversionConfig {
	readonly type: "EnumerationType";
}

/**
 * Data type for strings.
 */
export interface StringConversionConfig extends BasicConversionConfig {
	readonly type: "StringType";
}

/**
 * Data type for strings which could have a different representation between the UI and the way the value is stored in the document, i.e. IBAN.
 */
export interface CustomStringConversionConfig extends BasicConversionConfig {
	readonly type: "CustomFieldType";
	readonly name: string;
	readonly representation: "internal" | "display";
}
