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
	DateConversionConfig,
	DateFragmentConversionConfig,
	DateRangeConversionConfig,
	DateTimeConversionConfig,
	SupportedTypeWithoutNull,
	TimeConversionConfig,
	ValueConversion
} from "../../conversion.js";
import { DatePrecision } from "../../conversion.js";

import type { DataFormats } from "../../localization/DataFormats.js";
import { calculateDateFormat } from "../../localization/DataFormats.js";

import type { DataFormatPlaceholder, LocalizableArgs } from "../../localization/Localizable.js";

import { DateConversionConfigBuilder } from "./util/ConversionConfigBuilder.js";
import { DateAndFormat } from "./util/DateAndFormat.js";
import type { DatePart } from "./util/DatePart.js";
import { DateUtil } from "./util/DateUtil.js";
import type { LocalizableDefaults } from "./util/LocalizableUtil.js";
import { LocalizableUtil } from "./util/LocalizableUtil.js";
import { PartiallyKnownDatesUtil } from "./util/PartiallyKnownDatesUtil.js";
import { ValidationDateParser } from "./util/ValidationDateParser.js";

// FIXME: Shouldn't this be public, since it is used in parameter types of public functions below?
type GeneralDateConversionConfig =
	| DateConversionConfig
	| DateTimeConversionConfig
	| TimeConversionConfig
	| DateFragmentConversionConfig;

/**
 * Conversion methods for date related data types (date, date fragment, date time and time).
 */
export class DateConversion {
	/**
	 * Converts the given value from one format to other format among the same data type.<br>
	 * Only <code>baseYear</code> from <code>inputFormat</code> is considered,
	 * this means <code>baseYear</code> from <code>outputFormat</code> is ignored.<br>
	 * Conversion between different time zones is not supported.<br>
	 * Only <code>datePrecision</code> from <code>inputFormat</code> is considered,
	 * this means <code>datePrecision</code> from <code>outputFormat</code> is ignored.
	 * @param value value to be converted
	 * @param srcDataType configuration which describes the given value
	 * @param destDataType configuration to which the given value should be converted
	 * @returns the converted string value
	 */
	public static convert(
		value: string,
		srcDataType: GeneralDateConversionConfig & DataFormats,
		destDataType: GeneralDateConversionConfig & DataFormats
	): string {
		if (value.length === 0) {
			return value;
		}
		if (srcDataType.timeZone !== destDataType.timeZone) {
			throw new Error("conversion between different time zones is not supported");
		}
		const baseYear = DateConversion.getBaseYear(srcDataType);
		const timeZone = DateConversion.getTimeZone(srcDataType);
		const srcFormat = calculateDateFormat(srcDataType.format, srcDataType);
		const srcDateAndFormat = new DateAndFormat(value, srcFormat, timeZone);

		const isPartiallyKnownDateAllowed = DateConversion._isPartiallyKnownDateAllowed(srcDataType);
		let changedUnknownDateParts: DatePart[] = [];
		if (isPartiallyKnownDateAllowed) {
			changedUnknownDateParts = PartiallyKnownDatesUtil.replaceUnknownDateParts(srcDateAndFormat);
		}

		const destFormat = calculateDateFormat(destDataType.format, destDataType);
		const destValue = DateConversion.convertDateInternal(srcDateAndFormat, destFormat, baseYear);
		const destDateAndFormat = new DateAndFormat(destValue, destFormat, timeZone);

		PartiallyKnownDatesUtil.setDatePartsToUnknown(destDateAndFormat, changedUnknownDateParts);

		return destDateAndFormat.date;
	}

	/**
	 * See also the description of defaultValueConversion#parseValue.
	 */
	public static convertStringToDate(
		value: string,
		srcDataType: GeneralDateConversionConfig & DataFormats,
		isPartUnknown?: boolean
	): Date | string | null {
		if (!value) {
			return null;
		}
		const dateWithFormat: DateAndFormat = DateConversion._getDateWithFormat(value, srcDataType);
		// if isPartUnknown is given, we already checked isPartUnknown in parseDate and don't need to check again
		const partUnknown = isPartUnknown ?? PartiallyKnownDatesUtil.isPartUnknown(dateWithFormat);
		if (partUnknown) {
			return value;
		}
		const baseYear = DateConversion.getBaseYear(srcDataType);
		return DateUtil.getValueAsDate(dateWithFormat, baseYear);
	}

	/**
	 * See also the description of defaultValueConversion#parseValue.
	 */
	public static parseDate(
		value: string,
		srcDataType: GeneralDateConversionConfig & DataFormats
	): { value?: Date | string | null; parseError?: ValueConversion.ParseError } {
		if (!value) {
			return { value: null };
		}
		const dateWithFormat: DateAndFormat = DateConversion._getDateWithFormat(value, srcDataType);
		const isPartUnknown = PartiallyKnownDatesUtil.isPartUnknown(dateWithFormat);
		const isPartiallyKnownDateAllowed = DateConversion._isPartiallyKnownDateAllowed(srcDataType);
		if (isPartUnknown && isPartiallyKnownDateAllowed) {
			return { value: value };
		}
		const baseYear = this.getBaseYear(srcDataType);
		const originalFormat = dateWithFormat.format;
		dateWithFormat.completeWithYear(baseYear);
		const error = DateConversion._sanityCheck(dateWithFormat, originalFormat);
		if (error === undefined) {
			return {
				value: DateConversion.convertStringToDate(value, srcDataType, isPartUnknown)
			};
		} else {
			return { parseError: error };
		}
	}

	/**
	 * See also the description of defaultValueConversion#formatValue.
	 */
	public static convertDateToString(
		value: SupportedTypeWithoutNull,
		destDataType: GeneralDateConversionConfig & DataFormats
	): string {
		const timeZone = DateConversion.getTimeZone(destDataType);
		const destFormat = calculateDateFormat(destDataType.format, destDataType);

		return DateUtil.convertDateToString(value, destFormat, timeZone);
	}

	/**
	 * Creates the data type {@link DateConversionConfig} for dates and partially known dates.
	 * @param format the date format (e.g. "yyyy-MM-dd")
	 * @param baseYear
	 * 		the base year to supplement partialy known dates. This year is relevant for <code>dateFormat</code>s
	 * 		containing <code>MM</code> and <code>dd</code> but not <code>yyyy</code>, in order to determine
	 * 		if the February 29th is a valid input or not.
	 *      Default value is `2000`.
	 * @param timeZone the time zone the date should be interpreted in. Default value is `"UTC"`.
	 * @param datePrecision the new date precision. Default value is {@link DatePrecision.FULL}
	 * @returns the converted string value
	 */
	public static createDateConversionConfig(
		format: string,
		baseYear: number | undefined,
		timeZone: string | undefined,
		datePrecision: DatePrecision | undefined
	): DateConversionConfig {
		let builder = new DateConversionConfigBuilder().withFormat(format);
		if (baseYear) {
			builder = builder.withBaseYear(baseYear);
		}
		if (timeZone) {
			builder = builder.withTimeZone(timeZone);
		}
		if (datePrecision) {
			builder = builder.withDatePrecision(datePrecision);
		}
		return builder.build();
	}

	private static _sanityCheck(
		dateWithFormat: DateAndFormat,
		errorMessageFormat?: string
	): ValueConversion.ParseError | undefined {
		try {
			// more exact check while parsing
			ValidationDateParser.parseDate(dateWithFormat);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			return DateConversion.createParseErrorForDate(errorMessageFormat ?? dateWithFormat.format);
		}
		return undefined;
	}

	/**
	 * Converts a DateAndFormat to the given target format.
	 * As a side effect the given parameter dateWithFormat is changed.
	 */
	public static convertDateInternal(
		dateWithFormat: DateAndFormat,
		targetFormat: string,
		supplementaryYear: number
	): string {
		// we need the original format for the error message in an error situation
		const srcFormat: string = dateWithFormat.format;

		// unify the given date if it does not contain the time part
		if (!targetFormat.includes("HH") && !srcFormat.includes("HH")) {
			dateWithFormat.unifyLastSeparator();
		}

		// if the year is not contained in the format, we add it to handle the Feb 29th
		if (DateUtil.formatContainsOnlyDayMonth(srcFormat)) {
			dateWithFormat.completeWithYear(supplementaryYear);
		}

		// parse the date and format it to the target format
		const targetDate: Date = ValidationDateParser.parseDateWithoutSyntaxCheck(dateWithFormat);
		return ValidationDateParser.makeStringDayMonthTwoDigits(
			targetDate,
			targetFormat,
			dateWithFormat.timeZone
		);
	}

	/**
	 * @returns the defined base year if present, otherwise the default value <code>2000</code>.
	 */
	public static getBaseYear(
		dataType: GeneralDateConversionConfig | DateRangeConversionConfig
	): number {
		return dataType.baseYear ?? 2000;
	}

	/**
	 * @returns the defined time zone if present, otherwise the default value <code>"UTC"</code>.
	 */
	public static getTimeZone(
		dataType: GeneralDateConversionConfig | DateRangeConversionConfig
	): string {
		return dataType.timeZone ?? "UTC";
	}

	private static _isPartiallyKnownDateAllowed(dataType: GeneralDateConversionConfig): boolean {
		switch (dataType.type) {
			case "DateType":
				return dataType.datePrecision ? dataType.datePrecision !== DatePrecision.FULL : false;
			case "DateTimeType":
			case "DateFragmentType":
			case "TimeType":
				return false;
		}
	}

	private static _getDateWithFormat(
		value: string,
		dataType: GeneralDateConversionConfig & DataFormats
	): DateAndFormat {
		const timeZone = DateConversion.getTimeZone(dataType);
		const format = calculateDateFormat(dataType.format, dataType);
		return new DateAndFormat(value, format, timeZone);
	}

	public static createParseErrorForDate(format: string): ValueConversion.ParseError {
		const dateFormatPlaceholder: DataFormatPlaceholder = {
			type: "dataFormat",
			value: format,
			properties: {
				type: "date"
			}
		};
		const args: LocalizableArgs = {
			dateFormat: dateFormatPlaceholder
		};
		const errorTextDefaults: LocalizableDefaults = {
			de: "Es sind nur Daten im Format $dateFormat$ erlaubt.",
			en: "Only dates in the format '$dateFormat$' are allowed.",
			fr: "Seules les dates au format '$dateFormat$' sont autorisées.",
			nl: "De datum dient in het formaat '$dateFormat$' te staan."
		};
		return LocalizableUtil.createParseError(
			"DATUM_FORMAT",
			"datumFormatFalsch",
			args,
			errorTextDefaults
		);
	}
}
