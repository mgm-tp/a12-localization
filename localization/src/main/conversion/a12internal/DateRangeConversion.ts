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
	DateRangeConversionConfig,
	SupportedTypeWithoutNull,
	ValueConversion
} from "../../conversion.js";

import type { DataFormatPlaceholder, LocalizableArgs } from "../../localization/Localizable.js";

import type { DataFormats } from "../../localization/DataFormats.js";
import { calculateDateFormat } from "../../localization/DataFormats.js";

import { DateConversion } from "./DateConversion.js";
import { DateAndFormat } from "./util/DateAndFormat.js";
import { DateUtil } from "./util/DateUtil.js";
import type { LocalizableDefaults } from "./util/LocalizableUtil.js";
import { LocalizableUtil } from "./util/LocalizableUtil.js";

/**
 * Conversion methods for date range data types.
 */
export class DateRangeConversion {
	/**
	 * Converts the given value from one format to other format among the same data type.<br>
	 * Only <code>baseYear</code> from <code>inputFormat</code> is considered,
	 * this means <code>baseYear</code> from <code>outputFormat</code> is ignored.<br>
	 * Conversion between different time zones is not supported.<br>
	 * Only <code>interpretationOfYear</code> from <code>inputFormat</code> is considered,
	 * this means <code>interpretationOfYear</code> from <code>outputFormat</code> is ignored.
	 * @param value value to be converted
	 * @param srcDataType configuration which describes the given value
	 * @param destDataType configuration to which the given value should be converted
	 * @returns the converted string value
	 */
	public static convert(
		value: string,
		srcDataType: DateRangeConversionConfig & DataFormats,
		destDataType: DateRangeConversionConfig & DataFormats
	): string {
		if (value.length === 0) {
			return value;
		}
		if (srcDataType.timeZone !== destDataType.timeZone) {
			throw new Error("conversion between different time zones is not supported");
		}
		const inputRangeSeparator = DateRangeConversion._getDateRangeSeparator(srcDataType);
		const dateRangeParts = DateUtil.splitStringBySeparator(value, inputRangeSeparator);

		const timeZone = DateConversion.getTimeZone(srcDataType);
		const srcFormat = calculateDateFormat(srcDataType.format, srcDataType);
		const yearsToAdd = DateUtil.getSupplementaryYears(
			srcFormat,
			dateRangeParts,
			srcDataType.interpretationOfYear,
			DateConversion.getBaseYear(srcDataType),
			DateRangeConversion._isDateSeparatorAtTheEndOptional(srcFormat),
			timeZone
		);

		const destFormat = calculateDateFormat(destDataType.format, destDataType);
		const startDestDate = DateConversion.convertDateInternal(
			new DateAndFormat(dateRangeParts[0], srcFormat, timeZone),
			destFormat,
			yearsToAdd[0]
		);
		const endDestDate = DateConversion.convertDateInternal(
			new DateAndFormat(dateRangeParts[1], srcFormat, timeZone),
			destFormat,
			yearsToAdd[1]
		);

		const outputRangeSeparator = DateRangeConversion._getDateRangeSeparator(destDataType);
		return startDestDate + outputRangeSeparator + endDestDate;
	}

	/**
	 * See also the description of defaultValueConversion#parseValue.
	 */
	public static convertStringToDateRange(
		value: string,
		srcDataType: DateRangeConversionConfig & DataFormats,
		syntaxCheck: boolean
	): { value?: Date[] | null; parseError?: ValueConversion.ParseError } {
		if (!value) {
			return { value: null };
		}
		const baseYear = DateConversion.getBaseYear(srcDataType);
		const timeZone = DateConversion.getTimeZone(srcDataType);
		const rangeSeparator = DateRangeConversion._getDateRangeSeparator(srcDataType);
		const format = calculateDateFormat(srcDataType.format, srcDataType);
		let dateRange: Date[];
		try {
			dateRange = DateUtil.createDateRange(
				value,
				rangeSeparator,
				format,
				srcDataType.interpretationOfYear,
				baseYear,
				timeZone,
				syntaxCheck
			);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			return {
				parseError: DateRangeConversion._createParseErrorForDateRange(
					"datumBereichFormatFalsch",
					format,
					rangeSeparator
				)
			};
		}
		return { value: dateRange };
	}

	/**
	 * See also the description of defaultValueConversion#parseValue.
	 */
	public static parseDateRange(
		value: string,
		srcDataType: DateRangeConversionConfig & DataFormats
	): {
		value?: Date | Date[] | string | null;
		parseError?: ValueConversion.ParseError;
	} {
		if (!value) {
			return { value: null };
		}
		const rangeSeparator = DateRangeConversion._getDateRangeSeparator(srcDataType);
		const singleDate = srcDataType.singleDate;
		if (rangeSeparator === "" && (singleDate === "allowed" || singleDate === "only")) {
			throw new Error(
				"Invalid date range conversion configuration: if a single date is allowed, the range separator must not be empty."
			);
		}
		const format = calculateDateFormat(srcDataType.format, srcDataType);
		if (!value.includes(rangeSeparator)) {
			if (singleDate === "allowed" || singleDate === "only") {
				const dateConfig = DateConversion.createDateConversionConfig(
					srcDataType.format,
					srcDataType.baseYear,
					srcDataType.timeZone,
					undefined
				);
				return DateConversion.parseDate(value, {
					...srcDataType,
					...dateConfig
				});
			} else {
				return {
					parseError: DateRangeConversion._createParseErrorForDateRange(
						"datumBereichTrennerFehlt",
						format,
						rangeSeparator
					)
				};
			}
		}
		if (singleDate === "only") {
			return {
				parseError: DateConversion.createParseErrorForDate(format)
			};
		}
		// split the range using the range separator
		const dateRange: string[] = DateUtil.splitStringBySeparator(value, rangeSeparator);
		if (dateRange.length !== 2 || dateRange[0].length === 0 || dateRange[1].length === 0) {
			return {
				parseError: DateRangeConversion._createParseErrorForDateRange(
					"datumBereichFormatFalsch",
					format,
					rangeSeparator
				)
			};
		}
		return DateRangeConversion.convertStringToDateRange(value, srcDataType, true);
	}

	/**
	 * See also the description of defaultValueConversion#formatValue.
	 * If "singleDate" is set to "allowed" in the <code>destDataType</code>, also single Dates can be formatted.
	 * If "singleDate" is set to "only" in the <code>destDataType</code>, only single Dates can be formatted.
	 */
	public static convertDateRangeToString(
		value: SupportedTypeWithoutNull,
		destDataType: DateRangeConversionConfig & DataFormats
	): string {
		const singleDate = destDataType.singleDate;
		if (value instanceof Date) {
			if (singleDate === "allowed" || singleDate === "only") {
				const dateConfig = DateConversion.createDateConversionConfig(
					destDataType.format,
					destDataType.baseYear,
					destDataType.timeZone,
					undefined
				);
				return DateConversion.convertDateToString(value, {
					...destDataType,
					...dateConfig
				});
			}
		}
		if (singleDate === "only") {
			throw new Error("The type of the value (" + typeof value + ") is not a Date");
		}
		// null is already handled
		const timeZone = DateConversion.getTimeZone(destDataType);
		const rangeSeparator = DateRangeConversion._getDateRangeSeparator(destDataType);
		const destFormat = calculateDateFormat(destDataType.format, destDataType);
		return DateUtil.convertDateRangeToString(value, rangeSeparator, destFormat, timeZone);
	}

	private static _getDateRangeSeparator(dataType: DateRangeConversionConfig & DataFormats): string {
		return dataType.dateRangeSeparator;
	}

	/**
	 * @returns <code>true</code> if a date separator at the end of the value is allowed (but optional). This is the case, if
	 * <ul>
	 * <li>the point is defined as date separtor in the format</li>
	 * <li>the format contains only day and month, no year</li>
	 * <li>in the format, the day is defined before the month</li>
	 * </ul>
	 * In other words, if the format is "dd.MM", otherwise <code>false</code>.
	 */
	private static _isDateSeparatorAtTheEndOptional(format: string): boolean {
		return (
			format.indexOf(".") > 0 &&
			DateUtil.formatContainsOnlyDayMonth(format) &&
			DateUtil.isDayDefinedBeforeMonth(format)
		);
	}

	private static _createParseErrorForDateRange(
		errorId: string,
		format: string,
		separator: string
	): ValueConversion.ParseError {
		const value = {
			// DateRangeValue, but the type is currently non-public in utils-localization
			dateFormat: format,
			dateRangeSeparator: separator
		};
		const timeIntervalFormatPlaceholder: DataFormatPlaceholder = {
			type: "dataFormat",
			value,
			properties: {
				type: "dateRange"
			}
		};
		const args: LocalizableArgs = {
			timeIntervalFormat: timeIntervalFormatPlaceholder
		};
		const errorTextDefaults: LocalizableDefaults = {
			de: "Es sind nur Datumsbereiche vom Format $timeIntervalFormat$ erlaubt.",
			en: "Only date ranges of the format $timeIntervalFormat$ are allowed.",
			fr: "Seules les plages de dates au format $timeIntervalFormat$ sont autorisées.",
			nl: "Alleen datumbereiken van het formaat $timeIntervalFormat$ zijn toegestaan."
		};
		return LocalizableUtil.createParseError(
			"DATUM_BEREICH_FORMAT",
			errorId,
			args,
			errorTextDefaults
		);
	}
}
