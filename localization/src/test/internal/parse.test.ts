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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ok, strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultValueConversion } from "../../main/conversion.js";

import Configs from "../resources/testCases/conversion/conversion_configs.json" with { type: "json" };
import BooleanTestCases from "../resources/testCases/conversion/parse/boolean.json" with { type: "json" };
import ConfirmTestCases from "../resources/testCases/conversion/parse/confirm.json" with { type: "json" };
import DateTestCases from "../resources/testCases/conversion/parse/date.json" with { type: "json" };
import DateFragmentTestCases from "../resources/testCases/conversion/parse/datefragment.json" with { type: "json" };
import DateRangeTestCases from "../resources/testCases/conversion/parse/daterange.json" with { type: "json" };
import DateTimeTestCases from "../resources/testCases/conversion/parse/datetime.json" with { type: "json" };
import EnumTestCases from "../resources/testCases/conversion/parse/enum.json" with { type: "json" };
import NumberTestCases from "../resources/testCases/conversion/parse/number.json" with { type: "json" };
import StringTestCases from "../resources/testCases/conversion/parse/string.json" with { type: "json" };
import TimeTestCases from "../resources/testCases/conversion/parse/time.json" with { type: "json" };

describe("com.mgmtp.a12.conversion.parseBooleanType", () => {
	BooleanTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseConfirmType", () => {
	ConfirmTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseDateType", () => {
	DateTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseDateFragmentType", () => {
	DateFragmentTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseDateTimeType", () => {
	DateTimeTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseTimeType", () => {
	TimeTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseDateRangeType", () => {
	DateRangeTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseNumberType", () => {
	NumberTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseStringType", () => {
	StringTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

describe("com.mgmtp.a12.conversion.parseEnumerationType", () => {
	EnumTestCases.testCases.forEach(testCase => {
		testParsePositive(testCase);
	});
});

function testParsePositive(testCase: any) {
	if (!testCase.active) {
		return;
	}
	it(testCase.id, () => {
		const conversionConfig: any =
			Configs[testCase.parameters.conversionConfigId as keyof typeof Configs];
		let parsed;
		try {
			parsed = defaultValueConversion(conversionConfig).parseValue(
				testCase.parameters.value,
				conversionConfig
			).value;
		} catch {
			// eslint-disable-next-line no-console
			console.error(testCase.description);
		}
		const expected = testCase.expectation.convertedValue;
		const type = testCase.expectation.type;
		assertEquals(parsed, expected, type, testCase.id);
	});
}

export function assertEquals(actual: any, expected: any, type: any, testCaseId: any): void {
	if (type === "Date") {
		ok(actual !== undefined && actual instanceof Date);
		strictEqual(actual.getTime(), new Date(expected).getTime(), "error in " + testCaseId);
	} else if (type === "DateArray" && Array.isArray(actual) && Array.isArray(expected)) {
		const actual1 = actual[0];
		const actual2 = actual[1];
		ok(actual1 !== undefined && actual1 instanceof Date);
		ok(actual2 !== undefined && actual2 instanceof Date);
		strictEqual(actual1.getTime(), new Date(expected[0]).getTime(), "error in " + testCaseId);
		strictEqual(actual2.getTime(), new Date(expected[1]).getTime(), "error in " + testCaseId);
	} else {
		if (actual !== null) {
			ok(typeof actual === type);
		}
		strictEqual(actual, expected, "error in " + testCaseId);
	}
}
