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

import { DateUtil } from "../conversion/a12internal/index.js";

import type { PartialLocale } from "./Locale.js";

/**
 * A configuration object to hold data formats for a specific locale.
 * All properties are optional.
 *
 * The various properties control how user input (usually coming from a UI) is parsed and
 * how data is formatted for presentation (also usually for a UI).
 *
 * This configuration is especially useful when used in combination with
 * A12 Kernel validations, computations, parsing and formatting.
 *
 */
export interface DataFormats {
	// numbers
	decimalSeparator: string;
	thousandsSeparator?: string;
	thousandsSeparatorApplyToTrait?: "amount" | "none";
	decimalPlacesOptional: boolean;

	// boolean
	trueValue: string;
	falseValue: string;

	// date, date time, time
	dateSeparator: string;
	dateZeroOptional: boolean;
	dateFragmentOrdering:
		| "YEAR_MONTH_DAY"
		| "YEAR_DAY_MONTH"
		| "DAY_YEAR_MONTH"
		| "DAY_MONTH_YEAR"
		| "MONTH_YEAR_DAY"
		| "MONTH_DAY_YEAR";
	dateRangeSeparator: string;

	/**
	 * expects format string of SimpleDateFormat API
	 */
	dateTimeFormat: string;
	/**
	 * expects format string of SimpleDateFormat API
	 */
	timeFormat: string;

	formatCharacters: {
		year: string;
		month: string;
		day: string;
	};

	// conversion options
	convertCustomFieldTypesList?: string[];
	convertCustomFieldTypesAll?: boolean;
}

/**
 * @internal
 */
export const InternalDefaultDataFormats: DataFormats = {
	// TODO: what would be useful defaults?
	// the following is just a proposal
	decimalSeparator: ".",
	dateFragmentOrdering: "YEAR_MONTH_DAY",
	dateSeparator: "-",
	dateZeroOptional: false,
	dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss",
	dateRangeSeparator: "/",
	timeFormat: "HH:mm:ss",
	falseValue: "false",
	trueValue: "true",
	decimalPlacesOptional: false,
	formatCharacters: {
		day: "d",
		month: "M",
		year: "y"
	}
};

interface DateRangeValue {
	dateFormat: string;
	dateRangeSeparator: string;
}

function isDateRangeValue(value: unknown): value is DateRangeValue {
	if (!value) {
		return false;
	}

	const valueAsAny = value as DateRangeValue;
	return (
		valueAsAny.dateFormat !== undefined &&
		typeof valueAsAny.dateFormat === "string" &&
		valueAsAny.dateRangeSeparator !== undefined &&
		typeof valueAsAny.dateRangeSeparator === "string"
	);
}

/**
 * A default {@link DataFormats} provider function.
 *
 * Note: Currently only supports {@link DataFormats} for the English and German language.
 *
 * @param locale
 *
 * @returns the A12-default data formats for the given locale.
 */
export function defaultDataFormats(locale: PartialLocale): Partial<DataFormats> {
	if ("en" === locale.language) {
		return {
			dateFragmentOrdering: "MONTH_DAY_YEAR",
			dateSeparator: "/",
			dateRangeSeparator: "-",
			formatCharacters: {
				day: "d",
				month: "M",
				year: "y"
			},
			decimalSeparator: ".",
			thousandsSeparator: ",",
			dateTimeFormat: "MM/dd/yyyy hh:mm a",
			timeFormat: "hh:mm a"
		};
	} else if ("de" === locale.language) {
		return {
			dateFragmentOrdering: "DAY_MONTH_YEAR",
			dateSeparator: ".",
			dateRangeSeparator: "-",
			formatCharacters: {
				day: "T",
				month: "M",
				year: "J"
			},
			decimalSeparator: ",",
			thousandsSeparator: ".",
			dateTimeFormat: "dd.MM.yyyy HH:mm",
			timeFormat: "HH:mm"
		};
	}
	return {};
}

/** @internal */
export function localizeDecimalSeparator(
	fieldDateFormat: unknown,
	dataFormats: Partial<DataFormats>
): string | undefined {
	if (dataFormats.decimalSeparator) {
		return dataFormats.decimalSeparator;
	}
	if (typeof fieldDateFormat === "string") {
		return fieldDateFormat;
	}
	throw new Error(
		`Cannot compute decimal separator from unexpected format input of type '${typeof fieldDateFormat}'`
	);
}

/** @internal */
export function localizeDateFormat(
	fieldDateFormat: unknown,
	dataFormats: Partial<DataFormats>
): string | undefined {
	const format = calculateDateFormat(fieldDateFormat, dataFormats, true);
	return applyFormatCharacters(format, dataFormats.formatCharacters);
}

/** @internal */
export function calculateDateFormat(
	fieldDateFormat: unknown,
	dataFormats: Partial<DataFormats>,
	ignoreDateZeroOptional = false
): string {
	if (typeof fieldDateFormat !== "string") {
		throw new Error(
			`Cannot compute date format from unexpected format input of type '${typeof fieldDateFormat}'`
		);
	}

	// if the field format string contains time:
	// return the respective dateTime or time format of the given dataFormats object
	if (DateUtil.containsTimePart(fieldDateFormat)) {
		if (DateUtil.containsDatePart(fieldDateFormat)) {
			// DateTime
			// for empty information in 'dataFormats', use given format
			return dataFormats.dateTimeFormat ?? fieldDateFormat;
		} else {
			// Time
			// for empty information in 'dataFormats', use given format
			return dataFormats.timeFormat ?? fieldDateFormat;
		}
	}

	const considerZeroOptional = dataFormats.dateZeroOptional && !ignoreDateZeroOptional;
	const separator = dataFormats.dateSeparator ?? getDateSeparator(fieldDateFormat);
	const separatorAtEnd = DateUtil.hasSeparatorAtEnd(fieldDateFormat) ? separator : "";
	if (!dataFormats.dateFragmentOrdering) {
		if (considerZeroOptional) {
			return DateUtil.makeFormatStringDayMonthOptional(fieldDateFormat) + separatorAtEnd;
		} else {
			return fieldDateFormat;
		}
	}

	const hasDay = fieldDateFormat.includes("d");
	const hasMonth = fieldDateFormat.includes("M");
	const hasYear = fieldDateFormat.includes("y");

	const newFormat = trimSeparators(
		dataFormats.dateFragmentOrdering
			.replace("YEAR", hasYear ? "y".repeat(4) : "")
			.replace("MONTH", hasMonth ? "M".repeat(2) : "")
			.replace("DAY", hasDay ? "d".repeat(2) : "")
	).replace(/_/g, separator);

	return (
		(considerZeroOptional ? DateUtil.makeFormatStringDayMonthOptional(newFormat) : newFormat) +
		separatorAtEnd
	);
}

/** @internal */
export function localizeDateRangeFormat(
	fieldDateFormat: unknown,
	dataFormats: Partial<DataFormats>
): string | undefined {
	if (!isDateRangeValue(fieldDateFormat)) {
		throw new Error(
			`Cannot compute date range format from unexpected format input of type '${typeof fieldDateFormat}'`
		);
	}

	const dateRangeSeparator = dataFormats.dateRangeSeparator || fieldDateFormat.dateRangeSeparator;

	const dateFormat = localizeDateFormat(fieldDateFormat.dateFormat, dataFormats);
	return `${dateFormat}${dateRangeSeparator}${dateFormat}`;
}

function getDateSeparator(formatString: string): string {
	// find the first character in the given string that is not a d,M or y
	return formatString.split("").find(c => !"yMd".includes(c)) ?? "";
}

// removes all leading and trailing underscores as well as multiple underscores in sequence
function trimSeparators(dateFormat: string): string {
	return dateFormat.replace(/__+/, "_").replace(/_+$/, "").replace(/^_+/, "");
}

function applyFormatCharacters(
	dateFormat: string,
	formatCharacters: Partial<DataFormats>["formatCharacters"]
): string {
	return dateFormat.split("").reduce((acc, cur) => {
		let next;
		switch (cur) {
			case "d":
				next = formatCharacters?.day ?? "d";
				break;
			case "M":
				next = formatCharacters?.month ?? "M";
				break;
			case "y":
				next = formatCharacters?.year ?? "y";
				break;
			case "a":
				next = "AM/PM";
				break;
			default:
				next = cur;
		}
		return acc + next;
	}, "");
}
