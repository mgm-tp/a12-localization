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

import type { SupportedTypeWithoutNull } from "../../../conversion.js";
import { InterpretationOfYear } from "../../../conversion.js";

import { DateAndFormat } from "./DateAndFormat.js";
import { PartiallyKnownDatesUtil } from "./PartiallyKnownDatesUtil.js";
import { TimeZonedDate } from "./TimeZonedDate.js";
import { ValidationDateParser } from "./ValidationDateParser.js";

/**
 * Specifies if the start or the end of a date interval should be used.
 * For partially known dates, this enumeration is used to specify the earliest or latest possible date.
 */
export class DateInterval {
	static readonly INTERVAL_START: DateInterval = new DateInterval(0);
	static readonly INTERVAL_END: DateInterval = new DateInterval(1);

	constructor(private readonly _value: number) {}

	public getIndex(): number {
		// Difference to java otherwise TS-Lint show an error
		// return (this === DateInterval.INTERVAL_START) ? 0 : 1;
		return this._value;
	}

	public getGivenMonth(): string {
		return this === DateInterval.INTERVAL_START ? "01" : "12";
	}

	public static create(earliest: boolean): DateInterval {
		return earliest ? DateInterval.INTERVAL_START : DateInterval.INTERVAL_END;
	}
}

/**
 * Utility class for dates.
 */
export class DateUtil {
	public static readonly YEAR_FORMAT = "yyyy";
	public static readonly YEAR_FORMAT_LETTER = "y";

	/**
	 * Creates a date from the specified value and format. The year information is added if no year information is available.
	 * For the supplementation, the base year is used if specified (in a document model, a base year can be specified), otherwise 2000.
	 * @return generated date
	 */
	public static getValueAsDate(dateWithFormat: DateAndFormat, baseYear: number): Date {
		dateWithFormat.completeWithYear(baseYear);
		return ValidationDateParser.parseDateWithoutSyntaxCheck(dateWithFormat);
	}

	/**
	 * A date is constructed from the passed values if all parameters are valid.
	 */
	public static createDate(
		day: number,
		month: number,
		year: number,
		timeZone: string
	): Date | undefined {
		return DateUtil._createDateIfValid(year, month, day, 0, 0, 0, timeZone);
	}

	/**
	 * Splits the string using the separator.
	 * If the separator is the empty string, the string is split in the middle.
	 */
	public static splitStringBySeparator(dateRange: string, rangeSeparator: string): string[] {
		if ("" === rangeSeparator) {
			// no separator, split in the middle
			const dateRangeLength: number = dateRange.length;
			return new Array<string>(
				dateRange.substring(0, dateRangeLength / 2),
				dateRange.substring(dateRangeLength / 2, dateRangeLength)
			);
		}
		return dateRange.split(rangeSeparator);
	}

	/**
	 * @returns the date separator which is specified in the passed format, otherwise an empty string if none is specified.
	 */
	public static getDateSeparator(dateFormat: string): string {
		for (let i = 0; i < dateFormat.length; i++) {
			const c: string = dateFormat.charAt(i);
			if (!DateUtil._isDatePart(c)) {
				return c;
			}
		}
		return "";
	}

	private static _isDatePart(c: string): boolean {
		return c === "y" || c === "M" || c === "d";
	}

	/**
	 * @returns the last day of the month of the given date.
	 */
	public static getLastDayOfMonth(dateWithFormat: DateAndFormat): string {
		const date: Date = ValidationDateParser.parseDateWithoutSyntaxCheck(dateWithFormat);
		const lastDayOfMonth: number = TimeZonedDate.createFromDate(
			date,
			dateWithFormat.timeZone
		).daysInMonth();
		return String(lastDayOfMonth);
	}

	/**
	 * A date is constructed from the passed value. If the specified format does not contain a year, it will be added.
	 * For the supplementation, the base year is used if specified, otherwise 2000 as default.
	 * If the specified format does not contain a month specification, either 01 or 12 is specified for the month,
	 * depending on whether the start or end is to be constructed.
	 * If the specified format does not contain a day, either 01 or the last day of the month is specified,
	 * depending on whether the start or end is to be constructed.
	 * A date is created from the possibly supplemented value using the possibly supplemented format.
	 * @return generated date, never undefined (internal error should not occur)
	 */
	public static createDateFromDateFragment(
		dateWithFormat: DateAndFormat,
		intervalSpec: DateInterval,
		baseYear: number
	): Date {
		dateWithFormat.completeWithYear(baseYear);
		dateWithFormat.addMonthAndDay(intervalSpec);

		// the date string should be complete now, we can try to parse
		return ValidationDateParser.parseDateWithoutSyntaxCheck(dateWithFormat);
	}

	/**
	 * Changes the format string of a date so that day and month are always optional.<br>
	 * Example: for format "yyyy-MM-dd", "yyyy-M-d" is returned.
	 */
	public static makeFormatStringDayMonthOptional(format: string): string {
		return format.replace(/dd/g, "d").replace(/MM/g, "M");
	}

	/**
	 * @returns the day format "d" if zeros are optional. Otherwise "dd".
	 */
	public static getDayFormat(zerosOptional: boolean): string {
		return zerosOptional ? "d" : "dd";
	}

	/**
	 * @returns the month format "M" if zeros are optional. Otherwise "MM".
	 */
	public static getMonthFormat(zerosOptional: boolean): string {
		return zerosOptional ? "M" : "MM";
	}

	/**
	 * @returns <code>false</code>, if the {@link InterpretationOfYear} is not set or
	 * if the end date lies before the start date. Otherwise true.
	 */
	private static _isYearNotBaseYear(
		startDate: string,
		endDate: string,
		checkFormat: string,
		dateRangeSeparatorOptAtEnd: boolean,
		interpretationOfYear: InterpretationOfYear | undefined,
		timeZone: string
	): boolean {
		if (!interpretationOfYear) {
			return false;
		}

		// To check whether dateRangeStart > dateRangeEnd, a leap year can simply be added.
		const dateRangeStart: DateAndFormat = new DateAndFormat(startDate, checkFormat, timeZone);
		DateUtil.completeDateAndFormat(dateRangeStart, checkFormat, dateRangeSeparatorOptAtEnd, 2000);
		const dateRangeEnd: DateAndFormat = new DateAndFormat(endDate, checkFormat, timeZone);
		DateUtil.completeDateAndFormat(dateRangeEnd, checkFormat, dateRangeSeparatorOptAtEnd, 2000);
		try {
			const dateRangeStartDate: Date = ValidationDateParser.parseDate(dateRangeStart);
			const dateRangeEndDate = ValidationDateParser.parseDate(dateRangeEnd);
			return DateUtil.dateBefore(dateRangeEndDate, dateRangeStartDate);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			// If one of the dates is not valid with a leap year,
			// the error will be reported later; the base year is ok as a year.
			return false;
		}
	}

	/**
	 * Preparation for fine validation through parsing. Date and format are supplemented as follows if necessary:
	 * <ol>
	 * 	<li>In some cases (depending on the configuration of DataFormats), a date separator is allowed at the end of the date value (e.g. 01.01.).
	 * 		In that case, the date and the format are aligned with regard to the separator at the end.</li>
	 * 	<li>If the format contains day and month, but no year, then the format is supplemented with the missing year format
	 * 		and the date string is supplemented with the corresponding year - so that February 29th. is treated correctly.</li>
	 * </ol>
	 */
	public static completeDateAndFormat(
		dateWithFormat: DateAndFormat,
		origFormat: string,
		dateRangeSeparatorOptionalAtEnd: boolean,
		baseYear: number
	): void {
		if (dateRangeSeparatorOptionalAtEnd) {
			// If a date separator is allowed at the end of the value,
			// we make sure that the value and the format match
			dateWithFormat.unifyLastSeparator();
		}
		// If the date does not contain a year, append the base year and change the format.
		// Necessary due to check for February 29th.
		// However, the 29th is only checked if the month and day are included in the format.
		if (DateUtil.formatContainsOnlyDayMonth(origFormat)) {
			dateWithFormat.completeWithYear(baseYear);
		}
	}

	/**
	 * @returns true, if a given date <code>d1</code> is before another given date <code>d2</code>. Otherwise false.
	 */
	public static dateBefore(d1: Date, d2: Date): boolean {
		return d1.getTime() < d2.getTime();
	}

	/**
	 * @returns true, if the given <code>format</code> contains only day ("d) and month ("M"), not year ("y"). Otherwise false.
	 */
	public static formatContainsOnlyDayMonth(format: string): boolean {
		return (
			format.includes("d") && format.includes("M") && !format.includes(DateUtil.YEAR_FORMAT_LETTER)
		);
	}

	/**
	 * @returns true, if the day is defined before the month in the given <code>format</code>. Otherwise false.
	 */
	public static isDayDefinedBeforeMonth(format: string): boolean {
		const dayIdx = format.indexOf("d");
		if (dayIdx < 0) {
			return false;
		}
		const monthIdx = format.indexOf("M");
		return dayIdx < monthIdx;
	}

	/**
	 * @returns a date format string, where all day or month placeholders of the given <code>format</code> are set to two digits ("dd" and "MM").
	 */
	public static makeFormatStringDayMonthTwoDigits(format: string): string {
		if (!format.includes("dd")) {
			format = format.replace(/d/g, "dd");
		}
		if (!format.includes("MM")) {
			format = format.replace(/M/g, "MM");
		}
		return format;
	}

	/**
	 * Returns the year for a start and end of a date range to which a date without a year is to be added.
	 * Required for the date range formats DD.MM-DD.MM (InterpretationOfYear == TO) or
	 * DD.MM-DD.MM (InterpretationOfYear == FROM), since the year is <b>NOT</b> the base year by default.
	 */
	public static getSupplementaryYears(
		dateFormat: string,
		dateRange: string[],
		interpretationOfYear: InterpretationOfYear | undefined,
		baseYear: number,
		dateRangeSeparatorOptAtEnd: boolean,
		timeZone: string
	): number[] {
		const supplementaryYears: number[] = [baseYear, baseYear];
		if (
			DateUtil._isYearNotBaseYear(
				dateRange[0],
				dateRange[1],
				dateFormat,
				dateRangeSeparatorOptAtEnd,
				interpretationOfYear,
				timeZone
			)
		) {
			// the method in the if-statement makes sure that interpretationOfYear is not undefined
			if (interpretationOfYear === InterpretationOfYear.TO) {
				supplementaryYears[0]--;
			}
			if (interpretationOfYear === InterpretationOfYear.FROM) {
				supplementaryYears[1]++;
			}
		}
		return supplementaryYears;
	}

	/**
	 * @returns the start and end of a date range as DateAndFormat.
	 */
	public static getDateRange(
		value: string,
		dateRangeSeparator: string,
		dateFormat: string,
		dateRangeSeparatorOptAtEnd: boolean,
		baseYear: number,
		interpretationOfYear: InterpretationOfYear | undefined,
		timeZone: string
	): DateAndFormat[] {
		const values: string[] = DateUtil.splitStringBySeparator(value, dateRangeSeparator);

		const add: number[] = DateUtil.getSupplementaryYears(
			dateFormat,
			values,
			interpretationOfYear,
			baseYear,
			dateRangeSeparatorOptAtEnd,
			timeZone
		);

		const startAndEnd: DateAndFormat[] = new Array<DateAndFormat>(2);
		startAndEnd[0] = new DateAndFormat(values[0], dateFormat, timeZone);
		startAndEnd[1] = new DateAndFormat(values[1], dateFormat, timeZone);

		DateUtil.completeDateAndFormat(startAndEnd[0], dateFormat, dateRangeSeparatorOptAtEnd, add[0]);
		DateUtil.completeDateAndFormat(startAndEnd[1], dateFormat, dateRangeSeparatorOptAtEnd, add[1]);

		return startAndEnd;
	}

	/**
	 * @returns a {@link Date}-object for the data type "TimeType".
	 * The date is set to 01.01.1970 with the given values for hour, minute, second and timeZone.
	 */
	public static createTime(
		hour: number,
		minute: number,
		second: number,
		timeZone: string
	): Date | undefined {
		return DateUtil._createDateIfValid(1970, 1, 1, hour, minute, second, timeZone);
	}

	/**
	 * @returns a {@link Date}-object for the data type "DateTimeType" or undefined,
	 * if the given date or time are undefined or not valid in the given timeZone .
	 */
	public static createDateTime(
		date: Date | undefined,
		time: Date | undefined,
		timeZone: string
	): Date | undefined {
		if (date === undefined || time === undefined) {
			return undefined;
		}
		const mDate = TimeZonedDate.createFromDate(date, timeZone);
		const mTime = TimeZonedDate.createFromDate(time, timeZone);
		return DateUtil._createDateIfValid(
			mDate.year(),
			mDate.month(),
			mDate.date(),
			mTime.hour(),
			mTime.minute(),
			mTime.second(),
			timeZone
		);
	}

	private static _createDateIfValid(
		year: number,
		month: number,
		day: number,
		hour: number,
		minute: number,
		second: number,
		timeZone: string
	): Date | undefined {
		const parsedMoment = TimeZonedDate.createFromObject(
			{ year, month, day, hour, minute, second },
			timeZone
		);
		const parsedDate = parsedMoment.toDate();
		const mDate = TimeZonedDate.createFromDate(parsedDate, timeZone);

		// Checking to see if the value of
		// month that we got from the parsed date
		// is same as what user has entered
		if (month !== mDate.month()) {
			return undefined;
		}

		// Checking to see if the value of
		// day that we got from the parsed date
		// is same as what user has entered
		if (day !== mDate.date()) {
			return undefined;
		}

		// Checking to see if the value of
		// year that we got from the parsed date
		// is same as what user has entered
		if (year !== mDate.year()) {
			return undefined;
		}

		if (hour !== mDate.hour()) {
			return undefined;
		}
		if (minute !== mDate.minute()) {
			return undefined;
		}
		if (second !== mDate.second()) {
			return undefined;
		}

		return parsedDate;
	}

	/**
	 * Tries to create a {@link Date}-object as follows:
	 * <ol>
	 *     <li>The given <code>value</code> is checked syntactically against the pattern created from the given <code>dateFormat</code>. If
	 *     the value does not match the pattern, an error is created.</li>
	 *     <li>If partially known dates are allowed and a date part is unknown, the original value is returned.</li>
	 *     <li>Otherwise the {@link Date}-object created from the given value is returned.</li>
	 * </ol>
	 *
	 * <b>Note:</b> Due to the syntax check, only the following date format fragments are allowed for a <code>dateFormat</code>:
	 * <ol>
	 *     <li><code>yyyy</code> for the year</li>
	 *     <li><code>MM</code> for the month</li>
	 *     <li><code>dd</code> for the day</li>
	 *     <li><code>'T'</code> as separator between date and time</li>
	 *     <li><code>HH</code> or <code>hh</code> for the hours</li>
	 *     <li><code>mm</code> for the minutes</li>
	 *     <li><code>ss</code> for the seconds</li>
	 *     <li><code>a</code> for AM/PM marker</li>
	 * </ol>
	 *
	 * @param value
	 * 		string from which a {@link Date}-object should be created. May not be <code>null</code> or empty.
	 * @param dateFormat
	 * 		format of the date, see method description, specially the <b>Note</b>. May not be <code>null</code> or empty.
	 * @param baseYearOrDefault
	 * 		the base year which could be taken from the document model (see DocumentModelInfo.baseYear). This year
	 * 		is relevant for <code>dateFormat</code>s containing <code>MM</code> and <code>dd</code> but not <code>yyyy</code>, in order to determine
	 * 		if the February 29th is a valid input or not.
	 * 		If no base year is defined in the document model, a default value should be given (in A12 kernel the year <code>2000</code>
	 * 		is commonly used). May not be 0.
	 * @param arePartiallyKnownDatesAllowed
	 * 		<code>true</code> if partially known dates are allowed, e.g. <code>2020-00-00</code>, otherwise <code>false</code>.
	 * @param timeZone
	 *      the time zone which should be considered while creating the {@link Date}-object.  This could be taken from the
	 * 		document model (see DocumentModelConfig#timeZone). May not be <code>null</code>.
	 * @return see method description.
	 *
	 * @throws Error
	 * 		if the base year is not valid or the value cannot be parsed to a {@link Date}-object (see also method description).
	 */
	public static createDateIfPossible(
		value: string,
		dateFormat: string,
		baseYearOrDefault: number,
		arePartiallyKnownDatesAllowed: boolean,
		timeZone: string
	): Date | string {
		const _dateWithFormat = new DateAndFormat(value, dateFormat, timeZone);
		if (!ValidationDateParser.isSyntacticallyCorrect(_dateWithFormat)) {
			throw new Error(
				"The given value is syntactically wrong and that's why it cannot be converted to a date-object."
			);
		}
		if (PartiallyKnownDatesUtil.isPartUnknown(_dateWithFormat)) {
			if (arePartiallyKnownDatesAllowed) {
				return value;
			} else {
				// difference with Java, since the standard parsing of Java covers this case
				throw new Error("The value '" + value + "' cannot be parsed to a Date.");
			}
		}
		return DateUtil.getValueAsDate(_dateWithFormat, baseYearOrDefault);
	}

	/**
	 * @param value
	 * 		{@link String} or {@link Date} which should be processed. May not be <code>null</code>.
	 * @param dateFormat
	 * 		format of the date to which the given date should be formatted. May not be <code>null</code> or empty.
	 * @param timeZone
	 * 		the time zone which was considered while creating the given {@link Date}-object. May not be <code>null</code>.
	 * @return string representation of the given <code>value</code>.
	 *
	 * @throws Error
	 * 		if the given <code>value</code> is not a {@link Date} or it is a {@link String} without unknown date parts.
	 */
	public static convertDateToString(
		value: string | number | Date | Date[] | boolean,
		dateFormat: string,
		timeZone: string
	): string {
		if (typeof value === "string") {
			const dateWithFormat: DateAndFormat = new DateAndFormat(value, dateFormat, timeZone);
			if (PartiallyKnownDatesUtil.isPartUnknown(dateWithFormat)) {
				return value;
			}
		}
		if (!(value instanceof Date)) {
			throw new Error("The type of the value (" + typeof value + ") is not a Date");
		}

		return ValidationDateParser.makeStringDayMonthTwoDigits(value, dateFormat, timeZone);
	}

	/**
	 * @returns the start and end of a date range as Date objects.
	 */
	public static createDateRange(
		internalValue: string,
		separator: string,
		format: string,
		interpretationOfYear: InterpretationOfYear | undefined,
		baseYearOrDefault: number,
		timeZone: string,
		syntaxCheck?: boolean
	): Date[] {
		const dates: DateAndFormat[] = DateUtil.getDateRange(
			internalValue,
			separator,
			format,
			true,
			baseYearOrDefault,
			interpretationOfYear,
			timeZone
		);
		if (syntaxCheck) {
			dates.forEach(dateWithFormat => {
				if (!ValidationDateParser.isSyntacticallyCorrect(dateWithFormat)) {
					throw new Error(
						"The given value is syntactically wrong and that's why it cannot be converted to a date-object."
					);
				}
			});
		}
		const startAndEnd: Date[] = new Array<Date>(2);
		dates.forEach(d => d.completeWithYear(baseYearOrDefault));
		startAndEnd[0] = ValidationDateParser.parseDateWithoutSyntaxCheck(dates[0]);
		startAndEnd[1] = ValidationDateParser.parseDateWithoutSyntaxCheck(dates[1]);
		return startAndEnd;
	}

	/**
	 * Formats the given date range.
	 * @param value the supported type should be Date[] of size 2, otherwise an error is thrown.
	 * @param rangeSeparator the separator between the dates of the date range.
	 * @param dateFormat the date format in which the dates should be formatted.
	 * @param timeZone the time zone the date should be interpreted in.
	 * @returns the formatted date range as string.
	 */
	public static convertDateRangeToString(
		value: SupportedTypeWithoutNull,
		rangeSeparator: string,
		dateFormat: string,
		timeZone: string
	): string {
		if (
			!Array.isArray(value) ||
			value.length !== 2 ||
			!value.every(item => item && item instanceof Date)
		) {
			throw new Error("The type of the value (" + typeof value + ") is not a Date [] of size 2");
		}

		return (
			ValidationDateParser.makeStringDayMonthTwoDigits(value[0], dateFormat, timeZone) +
			rangeSeparator +
			ValidationDateParser.makeStringDayMonthTwoDigits(value[1], dateFormat, timeZone)
		);
	}

	public static hasSeparatorAtEnd(format: string): boolean {
		const dateSeparator = DateUtil.getDateSeparator(format);
		return !!dateSeparator && format.endsWith(dateSeparator);
	}

	/**
	 * Returns 'true' if the given format contains at least one date part, otherwise 'false'.
	 */
	public static containsDatePart(format: string): boolean {
		return format.includes("dd") || format.includes("MM") || format.includes("yyyy");
	}

	/**
	 * Returns 'true' if the given format contains at least one time part, otherwise 'false'
	 */
	public static containsTimePart(format: string): boolean {
		return (
			format.includes("HH") ||
			format.includes("hh") ||
			format.includes("mm") ||
			format.includes("ss")
		);
	}
}
