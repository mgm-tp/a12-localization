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
	DateBasicConversionConfig,
	DateConversionConfig,
	DateFragmentConversionConfig,
	DateRangeConversionConfig,
	DateTimeConversionConfig,
	InterpretationOfYear,
	NumberConversionConfig,
	TimeConversionConfig
} from "../../../conversion.js";
import type { DatePrecision } from "../../../conversion.js";

/**
 * Data type builder for all dates (date, date fragment, date range, date time and time).
 */
class DateBasicConversionConfigBuilder {
	_baseYear: number;
	_timeZone: string;
	_format: string;
	public constructor(other?: DateBasicConversionConfig) {
		this._baseYear = other?.baseYear ?? 2000;
		this._timeZone = other?.timeZone ?? "UTC";
		this._format = ""; // will be overridden
	}
	public withBaseYear(baseYear: number): this {
		this._baseYear = baseYear;
		return this;
	}
	public withTimeZone(timeZone: string): this {
		this._timeZone = timeZone;
		return this;
	}
	public withFormat(format: string): this {
		this._format = format;
		return this;
	}
}

/**
 * Data type builder for dates and partially known dates.
 */
export class DateConversionConfigBuilder extends DateBasicConversionConfigBuilder {
	readonly type = "DateType";
	private _datePrecision: DatePrecision;
	_format: "yyyy-MM-dd";
	public constructor(other?: DateConversionConfig) {
		super(other);
		this._format = other?.format ?? "yyyy-MM-dd";
		this._datePrecision = other?.datePrecision ?? "FULL";
	}
	public withDatePrecision(datePrecision: DatePrecision): this {
		this._datePrecision = datePrecision;
		return this;
	}
	public build(): DateConversionConfig {
		return {
			type: this.type,
			baseYear: this._baseYear,
			timeZone: this._timeZone,
			format: this._format,
			datePrecision: this._datePrecision
		};
	}
}

/**
 * Data type builder for date ranges.
 */
export class DateRangeConversionConfigBuilder extends DateBasicConversionConfigBuilder {
	readonly type = "DateRangeType";
	private _interpretationOfYear?: InterpretationOfYear;
	private _singleDate: "notAllowed" | "allowed" | "only";
	_format: "yyyy-MM-dd" | "yyyy-MM" | "MM-dd" | "yyyy" | "MM";
	public constructor(other?: DateRangeConversionConfig) {
		super(other);
		this._format = other?.format ?? "yyyy-MM-dd";
		this._singleDate = other?.singleDate ?? "notAllowed";
		this._interpretationOfYear = other?.interpretationOfYear;
	}
	public withInterpretationOfYear(interpretationOfYear?: InterpretationOfYear): this {
		this._interpretationOfYear = interpretationOfYear;
		return this;
	}
	public withSingleDate(singleDate: "notAllowed" | "allowed" | "only"): this {
		this._singleDate = singleDate;
		return this;
	}
	public build(): DateRangeConversionConfig {
		return {
			type: this.type,
			baseYear: this._baseYear,
			timeZone: this._timeZone,
			format: this._format,
			interpretationOfYear: this._interpretationOfYear,
			singleDate: this._singleDate
		};
	}
}

/**
 * Data type builder for date time.
 */
export class DateTimeConversionConfigBuilder extends DateBasicConversionConfigBuilder {
	readonly type = "DateTimeType";
	_format: "yyyy-MM-dd'T'HH:mm:ss";
	public constructor(other?: DateTimeConversionConfig) {
		super(other);
		this._format = other?.format ?? "yyyy-MM-dd'T'HH:mm:ss";
	}
	public build(): DateTimeConversionConfig {
		return {
			type: this.type,
			baseYear: this._baseYear,
			timeZone: this._timeZone,
			format: this._format
		};
	}
}

/**
 * Data type builder for time.
 */
export class TimeConversionConfigBuilder extends DateBasicConversionConfigBuilder {
	readonly type = "TimeType";
	_format: "HH:mm:ss";
	public constructor(other?: TimeConversionConfig) {
		super(other);
		this._format = other?.format ?? "HH:mm:ss";
	}
	public build(): TimeConversionConfig {
		return {
			type: this.type,
			baseYear: this._baseYear,
			timeZone: this._timeZone,
			format: this._format
		};
	}
}

/**
 * Data type builder for dates without at least one date part (day, month, year).
 */
export class DateFragmentConversionConfigBuilder extends DateBasicConversionConfigBuilder {
	readonly type = "DateFragmentType";
	_format: "yyyy-MM" | "MM-dd" | "yyyy" | "MM";
	public constructor(other?: DateFragmentConversionConfig) {
		super(other);
		this._format = other?.format ?? "yyyy-MM";
	}
	public build(): DateFragmentConversionConfig {
		return {
			type: this.type,
			baseYear: this._baseYear,
			timeZone: this._timeZone,
			format: this._format
		};
	}
}

/**
 * Data type builder for numbers.
 */
export class NumberConversionConfigBuilder {
	readonly type = "NumberType";
	private _minFractionalDigits: number;
	private _leadingZerosAllowed: boolean;
	public constructor(other?: NumberConversionConfig) {
		this._minFractionalDigits = other?.minFractionalDigits ?? 0;
		this._leadingZerosAllowed = other?.leadingZerosAllowed ?? false;
	}
	public withMinFractionalDigits(minFractionalDigits: number): this {
		this._minFractionalDigits = minFractionalDigits;
		return this;
	}
	public withLeadingZerosAllowed(leadingZerosAllowed: boolean): this {
		this._leadingZerosAllowed = leadingZerosAllowed;
		return this;
	}
	public build(): NumberConversionConfig {
		return {
			type: this.type,
			minFractionalDigits: this._minFractionalDigits,
			leadingZerosAllowed: this._leadingZerosAllowed
		};
	}
}
