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
import { StringUtil } from "./StringUtil.js";

/**
 * The class bundles the common use of the value and format of a date.
 */
export class DateAndFormat {
	/**
	 * It is assumed that the value and format match.
	 * This means in particular that all parameters are not empty and not undefined.
	 */
	constructor(
		private _dateString: string,
		private _dateFormat: string,
		private readonly _timeZone: string
	) {}

	public get date(): string {
		return this._dateString;
	}

	public set date(newDate: string) {
		this._dateString = newDate;
	}

	public get format(): string {
		return this._dateFormat;
	}

	public set format(newFormat: string) {
		this._dateFormat = newFormat;
	}

	public get timeZone(): string {
		return this._timeZone;
	}

	/**
	 * If the date format does not contain the year part, the format is supplemented with the year format
	 * and the date string with the specified year. Otherwise the object remains unchanged.
	 */
	public completeWithYear(year: number): void {
		if (
			DatePart.YEAR.isInFormat(this._dateFormat) ||
			((DatePart.HOUR.isInFormat(this._dateFormat) ||
				DatePart.MINUTE.isInFormat(this._dateFormat)) &&
				!DatePart.MONTH.isInFormat(this._dateFormat) &&
				!DatePart.DAY.isInFormat(this._dateFormat))
		) {
			// Do not complete with the given year,
			// - if the year is already given in the format
			// - for time formats (there we are always using 1970), but do complete with the given year to DateTime formats
			return;
		}

		const dateSeparator: string = DateUtil.getDateSeparator(this._dateFormat);
		if (!this._dateFormat.endsWith(dateSeparator)) {
			this._dateFormat += dateSeparator;
			this._dateString += dateSeparator;
		}
		this._dateFormat += DateUtil.YEAR_FORMAT;
		this._dateString += String(year);
	}

	/**
	 * If the date format does not contain the month or day part, the format is supplemented with the month or day format
	 * and the date string with the specified month or day from the given date interval. Otherwise the object remains unchanged.
	 * @param intervalSpec specifies the start or the end of a date interval (earliest or latest possible date)
	 */
	public addMonthAndDay(intervalSpec: DateInterval): void {
		if (DatePart.HOUR.isInFormat(this._dateFormat)) {
			return;
		}
		const dateSeparator: string = DateUtil.getDateSeparator(this._dateFormat);
		if (!DatePart.MONTH.isInFormat(this._dateFormat)) {
			this._dateFormat = StringUtil.stringFormat(
				"{0}{1}{2}",
				"MM",
				dateSeparator,
				this._dateFormat
			);
			this._dateString = StringUtil.stringFormat(
				"{0}{1}{2}",
				intervalSpec.getGivenMonth(),
				dateSeparator,
				this._dateString
			);
		}
		if (!DatePart.DAY.isInFormat(this._dateFormat)) {
			this._dateFormat = StringUtil.stringFormat(
				"{0}{1}{2}",
				"dd",
				dateSeparator,
				this._dateFormat
			);
			const day: string =
				intervalSpec === DateInterval.INTERVAL_START
					? "01"
					: DateUtil.getLastDayOfMonth(
							new DateAndFormat(
								"01" + dateSeparator + this._dateString,
								this._dateFormat,
								this._timeZone
							)
						);
			this._dateString = StringUtil.stringFormat("{0}{1}{2}", day, dateSeparator, this._dateString);
		}
	}

	/**
	 * Unify the last date separator in the value and the format of a date with the date separator specified in the format.
	 */
	public unifyLastSeparator(): void {
		const dateSeparator: string = DateUtil.getDateSeparator(this._dateFormat);
		if (this._dateString.endsWith(dateSeparator) && !this._dateFormat.endsWith(dateSeparator)) {
			this._dateFormat += dateSeparator;
		}
		if (!this._dateString.endsWith(dateSeparator) && this._dateFormat.endsWith(dateSeparator)) {
			this._dateString += dateSeparator;
		}
	}
}
