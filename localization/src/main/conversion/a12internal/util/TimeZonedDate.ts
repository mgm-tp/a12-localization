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

import type { DateObjectUnits, DateTimeUnit, DurationLike, ExplainedFormat } from "luxon";
import { DateTime } from "luxon";

export class TimeZonedDate {
	private static readonly TIMEZONE_UTC = "UTC";

	private readonly _date: DateTime;
	private readonly _timeZone: string;

	private constructor(date: DateTime, timeZone: string) {
		this._date = date;
		this._timeZone = timeZone;
	}

	public toDate(): Date {
		return this._date.toJSDate();
	}

	public valueOf(): number {
		return this._date.valueOf();
	}

	public second(): number {
		return this._date.second;
	}
	public minute(): number {
		return this._date.minute;
	}
	public hour(): number {
		return this._date.hour;
	}
	public month(): number {
		return this._date.month;
	}
	public year(): number {
		return this._date.year;
	}
	public date(): number {
		return this._date.day;
	}

	public static createUtcFromDate(date: Date): TimeZonedDate {
		return TimeZonedDate.createFromDate(date, TimeZonedDate.TIMEZONE_UTC);
	}

	public static createFromDate(date: Date, timeZone: string): TimeZonedDate {
		const luxonDate = DateTime.fromJSDate(date, { zone: timeZone });
		return new TimeZonedDate(luxonDate, timeZone);
	}

	public static createFromDateAsUtc(date: Date, timeZone: string): TimeZonedDate {
		return this.createFromDate(date, timeZone);
	}

	public static createForYear(year: number, timeZone: string): TimeZonedDate {
		return new TimeZonedDate(DateTime.fromObject({ year }, { zone: timeZone }), timeZone);
	}

	public static createFromObject(obj: DateObjectUnits, timeZone: string): TimeZonedDate {
		return new TimeZonedDate(DateTime.fromObject(obj, { zone: timeZone }), timeZone);
	}

	public static createFromString(value: string, format: string, timeZone: string): TimeZonedDate {
		// Luxon allows for values 0 or > 12 for hh and 24 for HH. We eliminate these
		const explanation = DateTime.fromFormatExplain(value, format, {
			zone: timeZone
		});
		if (explanation.matches?.h !== undefined) {
			const hValue = TimeZonedDate._getHValue(explanation);
			if (hValue > 12 || hValue === 0) {
				throw Error("Invalid date");
			}
		}
		if (explanation.matches?.H > 23) {
			throw Error("Invalid date");
		}
		return new TimeZonedDate(DateTime.fromFormat(value, format, { zone: timeZone }), timeZone);
	}

	private static _getHValue(explanation: ExplainedFormat): number {
		const tokenNames = explanation.tokens.map(t => t.val);
		let idx = tokenNames.indexOf("h");
		if (idx < 0) {
			idx = tokenNames.indexOf("hh");
		}
		if (idx < 0) {
			return -1;
		}
		// idx + 1 to get the regex group (0 = whole match)
		const value = explanation?.rawMatches?.[idx + 1];
		if (value === undefined) {
			return -1;
		}
		return parseInt(value);
	}

	public startOf(unit: DateTimeUnit): TimeZonedDate {
		return new TimeZonedDate(this._date.startOf(unit), this._timeZone);
	}

	public isTwentyEigthFebruary(): boolean {
		return this._date.month === 2 && this._date.day === 28;
	}

	public isInLeapYear(): boolean {
		return this._date.isInLeapYear;
	}

	public add(amount: number, unit: DateTimeUnit): TimeZonedDate {
		const duration: DurationLike = { [unit]: amount };
		return new TimeZonedDate(this._date.plus(duration), this._timeZone);
	}

	public isAfter(otherDate: TimeZonedDate): boolean {
		return this._date > otherDate._date;
	}

	public isBefore(otherDate: TimeZonedDate): boolean {
		return this._date < otherDate._date;
	}

	public diff(otherDate: TimeZonedDate, unit: DateTimeUnit): number {
		return Math.floor(this._date.diff(otherDate._date, unit).get(unit));
	}

	public daysInMonth(): number {
		// daysInMonth could return undefined if the date is invalid, but we always have a valid date
		return this._date.daysInMonth ?? -1;
	}

	public clearTime(): TimeZonedDate {
		return this.startOf("day");
	}

	public clearDate(clearHour?: boolean): TimeZonedDate {
		return TimeZonedDate.createFromObject(
			{
				year: 1970,
				month: 1,
				day: 1,
				hour: clearHour ? 0 : this._date.hour,
				minute: this._date.minute,
				second: this._date.second,
				millisecond: this._date.millisecond
			},
			this._timeZone
		);
	}

	public isValid(): boolean {
		return this._date.isValid;
	}

	public format(template: string): string {
		return this._date.toFormat(template);
	}
}
