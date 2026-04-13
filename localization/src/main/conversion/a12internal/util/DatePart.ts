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

/**
 * Represents a part of a date (year, month, day, hour, minute and second).
 */
export class DatePart {
	static readonly YEAR: DatePart = new DatePart("y", "0000");
	static readonly MONTH: DatePart = new DatePart("M", "00");
	static readonly DAY: DatePart = new DatePart("d", "00");
	static readonly HOUR: DatePart = new DatePart("H", "00", ["h"]);
	static readonly MINUTE: DatePart = new DatePart("m", "00");
	static readonly SECOND: DatePart = new DatePart("s", "00");

	/**
	 * Represents a part of a date.
	 * @param _formatName the name of the date part (e.g. "y" for year)
	 * @param _unknownString the string with which an unknown date part should be replaced
	 * @param _alternativeFormats an optional array of alternative names of the date part for formatting
	 */
	constructor(
		private readonly _formatName: string,
		private readonly _unknownString: string,
		private readonly _alternativeFormats?: string[]
	) {}

	/**
	 * @returns the name of the date part (e.g. "y" for year)
	 */
	public get formatName(): string {
		return this._formatName;
	}

	/**
	 * @returns the string with which an unknown date part should be replaced
	 */
	public get unknownString(): string {
		return this._unknownString;
	}

	/**
	 * @returns true if the formatName (e.g. "y" for year) is present in the given format. Otherwise false.
	 */
	public isInFormat(format: string): boolean {
		return (
			format.includes(this._formatName) ||
			(this._alternativeFormats?.some(altFormatName => format.includes(altFormatName)) ?? false)
		);
	}

	/**
	 * @returns the corresponding date part (year, month or day) to the given order fragment string.
	 * If the given order fragment string is not "YEAR", "MONTH" or "DAY" an error is thrown.
	 */
	public static parseFragmentOrder(orderFragment: string): DatePart {
		if (orderFragment === "YEAR") {
			return DatePart.YEAR;
		}
		if (orderFragment === "MONTH") {
			return DatePart.MONTH;
		}
		if (orderFragment === "DAY") {
			return DatePart.DAY;
		}
		throw Error("The parameter '" + orderFragment + "' is invalid.");
	}
}
