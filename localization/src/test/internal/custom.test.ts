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

import { ok, strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";

import type {
	SupportedType,
	ValueConversion,
	ValueConversionConfig
} from "../../main/conversion.js";
import { defaultValueConversion } from "../../main/conversion.js";
import {
	DateConversionConfigBuilder,
	NumberConversion,
	NumberConversionConfigBuilder,
	TimeZonedDate
} from "../../main/conversion/a12internal/index.js";
import type { DataFormats, ValueConversionParseError } from "../../main/index.js";
import {
	InternalDefaultDataFormats,
	defaultDataFormats
} from "../../main/localization/DataFormats.js";

describe("com.mgmtp.a12.conversion.custom", () => {
	const defaultFormat = "yyyy-MM-dd";
	const utcTz = "UTC";
	const date = TimeZonedDate.createFromString("2023-11-16", defaultFormat, utcTz).toDate();
	const customDate = TimeZonedDate.createFromString("2023-11-17", defaultFormat, utcTz).toDate();
	// use case: user input to corresponding type in order to be stored in the document
	it("parseValue", () => {
		const srcDataType = new DateConversionConfigBuilder().build();

		// default conversion
		const converted1 = defaultValueConversion(InternalDefaultDataFormats).parseValue(
			"2023-11-16",
			srcDataType
		);
		ok(converted1.value instanceof Date);
		strictEqual(converted1.value.getTime(), date.getTime());

		// custom conversion
		const customConverted1 = MyCustomValueConversion(InternalDefaultDataFormats).parseValue(
			"2023-11-16",
			srcDataType
		);
		ok(customConverted1.value instanceof Date);
		strictEqual(customConverted1.value.getTime(), customDate.getTime());
	});
	// use case: typed value coming from the document should be shown to the user
	it("formatValue", () => {
		const destDataType = new DateConversionConfigBuilder().withFormat("dd.MM.yyyy").build();

		// default conversion
		const converted = defaultValueConversion(defaultDataFormats({ language: "de" })).formatValue(
			date,
			destDataType
		);
		ok(typeof converted === "string");
		strictEqual(converted, "16.11.2023");

		// custom conversion
		const customConverted = MyCustomValueConversion(
			defaultDataFormats({ language: "de" })
		).formatValue(date, destDataType);
		ok(typeof customConverted === "string");
		strictEqual(customConverted, "16.11.23");
	});
	// use case: localization
	it("convert", () => {
		const srcDataType = new NumberConversionConfigBuilder().build();
		const destDataType = new NumberConversionConfigBuilder().build();

		// default conversion
		const converted = NumberConversion.convert(
			"19.99",
			{
				...InternalDefaultDataFormats,
				...defaultDataFormats({ language: "en" }),
				...srcDataType
			},
			{
				...InternalDefaultDataFormats,
				...defaultDataFormats({ language: "de" }),
				...destDataType
			}
		);
		strictEqual(converted, "19,99");
	});
});

const MyCustomValueConversion: (df: Partial<DataFormats>) => ValueConversion = (
	df: Partial<DataFormats>
) => ({
	parseValue: (value, inputFormat) => {
		const dataFormats = { ...InternalDefaultDataFormats, ...df };
		if (inputFormat.type === "DateType") {
			return customParseDate(value, inputFormat, dataFormats);
		} else {
			return defaultValueConversion(df).parseValue(value, inputFormat);
		}
	},
	formatValue: (value, outputFormat) => {
		const dataFormats = { ...InternalDefaultDataFormats, ...df };
		if (outputFormat.type === "DateType") {
			return customFormatDate(value, outputFormat, dataFormats);
		} else {
			return defaultValueConversion(df).formatValue(value, outputFormat);
		}
	}
});

// the following functions could all be moved/inlined into the respective properties of the object above!
function customParseDate(
	value: string,
	srcDataType: ValueConversionConfig,
	dataFormats: DataFormats
): { value?: SupportedType; parseError?: ValueConversionParseError } {
	const lastDateSepIdx = value.lastIndexOf("-");
	const day = value.substring(lastDateSepIdx + 1);
	const newValue = value.substring(0, lastDateSepIdx + 1) + (Number(day) + 1);
	return defaultValueConversion(dataFormats).parseValue(newValue, srcDataType);
}

function customFormatDate(
	value: SupportedType,
	destDataType: ValueConversionConfig,
	dataFormats: DataFormats
): string | undefined {
	const defaultConverted = defaultValueConversion(dataFormats).formatValue(value, destDataType);
	if (defaultConverted === undefined) {
		return undefined;
	}
	const lastDateSepIdx = defaultConverted.lastIndexOf(".");
	const twoDigitYear = defaultConverted.substring(lastDateSepIdx + 3);
	return defaultConverted.substring(0, lastDateSepIdx + 1) + twoDigitYear;
}
