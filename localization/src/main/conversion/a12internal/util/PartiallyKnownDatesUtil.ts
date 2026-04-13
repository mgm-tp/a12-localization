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

import { DatePart } from "./DatePart.js";
import { DateInterval, DateUtil } from "./DateUtil.js";

import { DateAndFormat } from "./DateAndFormat.js";
import { ValidationDateParser } from "./ValidationDateParser.js";

export class PartiallyKnownDatesUtil {
	/**
	 * Converts a partially known date into a concrete date. The format remains unchanged.<br>
	 * The first day, first month and year 2000 are set if the respective part of the date is not known.
	 * For example, "00.00.0000" is replaced by "01.01.2000".<br>
	 * A list of the {@link DatePart}s that have been replaced is returned.
	 * <p>
	 * <b>Precondition:</b> the date is "purely syntactically" correct, i.e. matches the regular expression
	 * given by the format. May ONLY be used for dates without time.
	 * </p>
	 */
	public static replaceUnknownDateParts(dateWithFormat: DateAndFormat): DatePart[] {
		const changedDateParts: DatePart[] = [];
		if (PartiallyKnownDatesUtil._replaceUnknownDatePart(dateWithFormat, DatePart.DAY, "01")) {
			changedDateParts.push(DatePart.DAY);
		}
		if (PartiallyKnownDatesUtil._replaceUnknownDatePart(dateWithFormat, DatePart.MONTH, "01")) {
			changedDateParts.push(DatePart.MONTH);
		}
		if (PartiallyKnownDatesUtil._replaceUnknownDatePart(dateWithFormat, DatePart.YEAR, "2000")) {
			changedDateParts.push(DatePart.YEAR);
		}
		return changedDateParts;
	}

	/**
	 * Converts the string representation of a partially known date into a concrete date with the given format.<br>
	 * The first day, first month and year 1970 are set if the respective Date part is not known.
	 * For example, "00.00.0000" is replaced by "01.01.1970".<br>
	 * A date with a given format is returned.
	 * <p>
	 * <b>Precondition:</b> May ONLY be used for dates without time.
	 * </p>
	 */
	public static parseApproximatedDate(
		partiallyKnownDate: string,
		format: string,
		timeZone: string
	): Date {
		const dateWithFormat: DateAndFormat = new DateAndFormat(partiallyKnownDate, format, timeZone);
		if (!ValidationDateParser.isSyntacticallyCorrect(dateWithFormat)) {
			throw new Error(
				"The given value is syntactically wrong and that's why it cannot be converted " +
					"to the corresponding approximated date-object."
			);
		}
		this._replaceUnknownDatePart(dateWithFormat, DatePart.DAY, "01");
		this._replaceUnknownDatePart(dateWithFormat, DatePart.MONTH, "01");
		this._replaceUnknownDatePart(dateWithFormat, DatePart.YEAR, "1970");
		return ValidationDateParser.parseDateWithoutSyntaxCheck(dateWithFormat);
	}

	/**
	 * Replaces the specified date part in the date with the new value if the date part is not known (i.e. "00" or "0000").
	 * The format remains unchanged.<br>
	 * Returns <code>true</code> if a replacement was made, <code>false</code> otherwise.
	 * <p>
	 * <b>Precondition:</b> The new value is always two digits for day and month, and always four digits for year.
	 * </p>
	 */
	private static _replaceUnknownDatePart(
		dateWithFormat: DateAndFormat,
		datePart: DatePart,
		newValue: string
	): boolean {
		const format: string = dateWithFormat.format;
		if (
			!format ||
			!datePart.isInFormat(format) ||
			!PartiallyKnownDatesUtil._isDatePartUnknown(dateWithFormat, datePart)
		) {
			return false;
		}
		return PartiallyKnownDatesUtil._replaceDatePart(dateWithFormat, datePart, newValue);
	}

	private static _replaceDatePart(
		dateWithFormat: DateAndFormat,
		datePart: DatePart,
		newDatePart: string
	): boolean {
		const format: string = dateWithFormat.format;
		const dateSeparator: string = DateUtil.getDateSeparator(format);
		const value: string = dateWithFormat.date;
		let newValue: string;
		if (dateSeparator.length > 0) {
			const parts: string[] = value.split(dateSeparator);
			const index: number = PartiallyKnownDatesUtil._getIndexOfDatePartInFormat(
				format,
				dateSeparator,
				datePart
			);
			parts[index] = newDatePart;
			newValue = parts.join(dateSeparator);
		} else {
			const pos: number = format.indexOf(datePart.formatName);
			newValue = value.substring(0, pos) + newDatePart + value.substring(pos + newDatePart.length);
		}
		dateWithFormat.date = newValue;
		return newValue !== value;
	}

	/**
	 * Replaces the '00' in a partially known date, if present, depending on whether start or end is sought.
	 * <p>
	 * <b>Precondition:</b> the date is "purely syntactically" correct, i.e. matches the regular expression
	 * given by the format. May ONLY be used for dates without time.
	 * </p>
	 */
	public static replaceMonthAndYearIfUnknown(
		dateWithFormat: DateAndFormat,
		intervalSpec: DateInterval
	): void {
		if (!dateWithFormat.date || !dateWithFormat.format) {
			return;
		}

		// First the month must be made concrete so that in case of IntervalEnd
		// the last day of the month can be determined.
		this._replaceUnknownDatePart(dateWithFormat, DatePart.MONTH, intervalSpec.getGivenMonth());
		if (this._isDatePartUnknown(dateWithFormat, DatePart.DAY)) {
			this._replaceDatePart(dateWithFormat, DatePart.DAY, "01");
			if (intervalSpec === DateInterval.INTERVAL_END) {
				const newDay: string = DateUtil.getLastDayOfMonth(dateWithFormat);
				this._replaceDatePart(dateWithFormat, DatePart.DAY, newDay);
			}
		}
	}

	/**
	 * Returns 'true' if the year is unknown.
	 */
	public static isYearUnknown(dateWithFormat: DateAndFormat): boolean {
		return this._isDatePartUnknown(dateWithFormat, DatePart.YEAR);
	}

	/**
	 * Returns 'true' if at least one of the date parts is unknown.
	 */
	public static isPartUnknown(dateWithFormat: DateAndFormat): boolean {
		return (
			this._isDatePartUnknown(dateWithFormat, DatePart.DAY) ||
			this._isDatePartUnknown(dateWithFormat, DatePart.MONTH) ||
			this._isDatePartUnknown(dateWithFormat, DatePart.YEAR)
		);
	}

	/**
	 * Returns 'true' if the queried DatePart is not known for the passed date.
	 */
	private static _isDatePartUnknown(dateWithFormat: DateAndFormat, datePart: DatePart): boolean {
		const value: string = PartiallyKnownDatesUtil.getValueOfDatePart(dateWithFormat, datePart);
		return datePart.unknownString === value;
	}

	/**
	 * Replaces the specified date parts with "00" (for day and month) or "0000" (for year).
	 * <p>
	 * <b>Precondition:</b> the date is "purely syntactically" correct, i.e. matches the regular expression
	 * given by the format. May ONLY be used for dates without time.
	 * </p>
	 */
	public static setDatePartsToUnknown(dateWithFormat: DateAndFormat, dateParts: DatePart[]): void {
		for (const datePart of dateParts) {
			this._replaceDatePart(dateWithFormat, datePart, datePart.unknownString);
		}
	}

	/**
	 * @returns the value of the given {@link DatePart} of the given {@link DateAndFormat}.
	 * If the given <code>datePart</code> is not present in the <code>dateWithFormat</code> an empty string is returned.
	 */
	public static getValueOfDatePart(dateWithFormat: DateAndFormat, datePart: DatePart): string {
		const format: string = dateWithFormat.format;
		if (!datePart.isInFormat(format)) {
			return "";
		}
		const dateSeparator: string = DateUtil.getDateSeparator(format);
		const value: string = dateWithFormat.date;
		if (dateSeparator.length > 0) {
			// use date separator for splitting
			const parts: string[] = value.split(dateSeparator);
			const index: number = PartiallyKnownDatesUtil._getIndexOfDatePartInFormat(
				format,
				dateSeparator,
				datePart
			);
			if (index >= parts.length) {
				return "";
			}
			return parts[index]; // fits for dates with and without optional zeros
		} else {
			// No date separator, i.e. it can't be a date with optional zeros
			const pos: number = format.indexOf(datePart.formatName);
			const end: number = format.lastIndexOf(datePart.formatName);
			return value.substring(pos, end + 1);
		}
	}

	private static _getIndexOfDatePartInFormat(
		format: string,
		separator: string,
		datePart: DatePart
	): number {
		const formatParts: string[] = format.split(separator);
		for (let i = 0; i < formatParts.length; i++) {
			if (datePart.isInFormat(formatParts[i])) {
				return i;
			}
		}
		throw new Error(
			"Invalid partially known date with format '" +
				format +
				"' and date separator '" +
				separator +
				"'."
		);
	}
}
