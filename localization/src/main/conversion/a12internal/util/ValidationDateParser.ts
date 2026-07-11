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

import type { DateAndFormat } from "./DateAndFormat.js";
import { DateUtil } from "./DateUtil.js";
import { TimeZonedDate } from "./TimeZonedDate.js";

export class ValidationDateParser {
	private static readonly _SIMPLE_DATE_PATTERN = new Map<string, RegExp>();
	private static readonly _TWO_DIGIT_PATTERN = "[0-9]{2}";
	private static readonly _TWO_DIGIT_OPT_PATTERN = "[0-9]{1,2}";
	private static readonly _FOUR_DIGIT_PATTERN = "[0-9]{4}";
	private static readonly _AM_PM_PATTERN = "(AM|PM)";

	/**
	 * Returns the Date object that corresponds to the passed string in terms of format.
	 * Throws an error if the string does not represent a valid date based on the format.
	 * In contrast to Java's SimpleDateFormat, the entire string is parsed;
	 * it does not stop at a valid starting string.<br>
	 * The following applies to the meaning of the date format:
	 * <ul>
	 * 	<li>Exactly one 'd' in the format means that days can be specified with a single-digit numerical value
	 * 		with or without a leading 0, "dd" means that the day must always be specified with two digits,
	 * 		if necessary with a leading 0.</li>
	 * 	<li>Exactly one 'M' in the format means that months can be specified with a single-digit numerical value
	 * 		with or without a leading 0, "MM" means that the month must always be specified with two digits,
	 * 		if necessary with a leading 0.</li>
	 * 	<li>In the date format the year must always be specified as "yyyy".
	 * 		A not exactly four-digit year may not be parsed, an error must be thrown.</li>
	 * 	<li>If exactly one 'd' or 'M' occurs in the format, the format must contain a date separator, i.e. a character
	 * 		that is not 'd', 'M' or 'y'. The caller of this method must ensure that.
	 * 		This means that we don't have to worry about formats such as "dM" when parsing, where the value "111"
	 * 		is not unique as a date.</li>
	 * </ul>
	 */
	public static parseDate(param: DateAndFormat): Date {
		return ValidationDateParser._parseDate(param.date, param.format, param.timeZone, true);
	}

	/**
	 * Creates a Date object that corresponds to the date string from the passed parameter in terms of format.
	 * Correct parsing of the date string is only guaranteed if the date string matches the regular expression
	 * generated from the format string, since there is no check against this regular expression.<br>
	 * In particular, the method should only be used if this check has already been carried out beforehand.
	 * <p>If the date string cannot be parsed with the SimpleDateFormat heuristic, an error is thrown
	 * because this is unexpected behavior.</p>
	 */
	public static parseDateWithoutSyntaxCheck(param: DateAndFormat): Date {
		try {
			return ValidationDateParser._parseDate(param.date, param.format, param.timeZone, false);
		} catch {
			throw new Error("Error while parsing Date.");
		}
	}

	private static _adaptDateFormat(format: string): string {
		return format;
	}

	private static _parseDate(
		value: string,
		checkFormat: string,
		timeZone: string,
		checkSyntax: boolean
	): Date {
		if (checkSyntax && !this._isSyntacticallyCorrect(value, checkFormat)) {
			throw new Error("Can not parse date: " + value);
		}
		const parseFormat: string = ValidationDateParser._adaptDateFormat(checkFormat);

		let parsedDate: TimeZonedDate = TimeZonedDate.createFromString(value, parseFormat, timeZone);
		parsedDate = this._removeDateIfNecessary(parsedDate, checkFormat);
		if (!parsedDate.isValid()) {
			throw new Error("Date is not valid");
		}

		const date: Date = parsedDate.toDate();

		if (!ValidationDateParser._isValidDate(date, parsedDate)) {
			throw new Error("Date is not valid");
		}
		return date;
	}

	/**
	 * Removes the date part if the object should represent only time part.
	 * The Moment.js library creates objects with both parts (date and time).
	 */
	private static _removeDateIfNecessary(parsedDate: TimeZonedDate, format: string): TimeZonedDate {
		if (format.search("y") === -1 && format.search("M") === -1 && format.search("d") === -1) {
			// if hour is not given clear it as well
			if (format.search("h") === -1 && format.search("H") === -1) {
				return parsedDate.clearDate(true);
			}
			// only time, go through utc to keep the current time (summer/winter difference to utc)
			return parsedDate.clearDate();
		}

		return parsedDate;
	}

	/**
	 * This method covers the fact that java cannot parse a date string like "01.01.0000".
	 * This means we need the given year and not the year contained in the date, otherwise
	 * this method would accept "01.01.0001" in Europe/Berlin, since the year contained in
	 * the date is "0000" and this method returns false.
	 * That's why, we take the year from the moment-object.
	 */
	private static _isValidDate(date: Date, momentOfDate: TimeZonedDate): boolean {
		return !isNaN(date.getTime()) && momentOfDate.year() !== 0;
	}

	/**
	 * Format a date to a string representation in the given format.
	 *
	 * @param value 	the date value.
	 * @param checkFormat 	the format for the date string.
	 * @return the string representation of the date.
	 */
	public static formatDate(value: Date, checkFormat: string, timeZone: string): string {
		return TimeZonedDate.createFromDate(value, timeZone).format(
			ValidationDateParser._adaptDateFormat(checkFormat)
		);
	}

	/**
	 * Returns <code>true</code>, if the value matches the regular expression, otherwise <code>false</code>.<br>
	 * The date parts are replaced in the format as follows: 'd' for the day, 'M' for the month and 'y' for the year.
	 * 'd' or 'M' means that a day or month with one or two digits is allowed.
	 * "dd" or "MM" means that a day or month has to have two digits.<br>
	 * The check does not include details, for example it is not checked whether the day exists for the month.
	 */
	public static isSyntacticallyCorrect(param: DateAndFormat): boolean {
		return this._isSyntacticallyCorrect(param.date, param.format);
	}

	private static _isSyntacticallyCorrect(value: string, checkFormat: string): boolean {
		return ValidationDateParser._getDatePattern(checkFormat).test(value);
	}

	private static _getDatePattern(format: string): RegExp {
		const fromCache = this._SIMPLE_DATE_PATTERN.get(format);
		if (fromCache) {
			return fromCache;
		}
		const modifiedFormat: string = format
			.replace(/MM/g, this._TWO_DIGIT_PATTERN)
			.replace(/M/g, this._TWO_DIGIT_OPT_PATTERN)
			.replace(/dd/g, this._TWO_DIGIT_PATTERN)
			.replace(/d/g, this._TWO_DIGIT_OPT_PATTERN)
			.replace(/yyyy/g, this._FOUR_DIGIT_PATTERN)
			.replace(/\./g, "\\.")
			// difference to C++/VBA: time is only used in Java and Javascript_VK
			.replace(/HH/g, this._TWO_DIGIT_PATTERN)
			.replace(/H/g, this._TWO_DIGIT_OPT_PATTERN)
			.replace(/mm/g, this._TWO_DIGIT_PATTERN)
			.replace(/ss/g, this._TWO_DIGIT_PATTERN)
			.replace(/hh/g, this._TWO_DIGIT_PATTERN)
			.replace(/h/g, this._TWO_DIGIT_OPT_PATTERN)
			.replace(/a/g, ValidationDateParser._AM_PM_PATTERN)
			.replace(/'([^']*)'/g, "$1");
		const result = new RegExp("^(?:" + modifiedFormat + ")$");
		this._SIMPLE_DATE_PATTERN.set(format, result);
		return result;
	}

	/**
	 * Returns the string representation of the date in the passed format,
	 * where the day and month are always given in two digits.<br>
	 * Ex: for the date April 7, 1999 and the format "yyyy-M-d" it returns "1999-04-07".
	 */
	public static makeStringDayMonthTwoDigits(date: Date, format: string, timeZone: string): string {
		format = DateUtil.makeFormatStringDayMonthTwoDigits(format);
		return ValidationDateParser.formatDate(date, format, timeZone);
	}
}
