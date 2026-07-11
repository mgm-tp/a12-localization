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

import { strictEqual, throws } from "node:assert/strict";
import { describe, it } from "node:test";

import type { SupportedType } from "../../main/conversion.js";
import { defaultValueConversion } from "../../main/conversion.js";

import Configs from "../resources/testCases/conversion/conversion_configs.json" with { type: "json" };
import BooleanTestCases from "../resources/testCases/conversion/format/boolean.json" with { type: "json" };
import ConfirmTestCases from "../resources/testCases/conversion/format/confirm.json" with { type: "json" };
import CustomTestCases from "../resources/testCases/conversion/format/custom.json" with { type: "json" };
import DateTestCases from "../resources/testCases/conversion/format/date.json" with { type: "json" };
import DateFragmentTestCases from "../resources/testCases/conversion/format/datefragment.json" with { type: "json" };
import DateRangeTestCases from "../resources/testCases/conversion/format/daterange.json" with { type: "json" };
import DateTimeTestCases from "../resources/testCases/conversion/format/datetime.json" with { type: "json" };
import EnumTestCases from "../resources/testCases/conversion/format/enum.json" with { type: "json" };
import ErrorTestCases from "../resources/testCases/conversion/format/expectederrors.json" with { type: "json" };
import NumberTestCases from "../resources/testCases/conversion/format/number.json" with { type: "json" };
import StringTestCases from "../resources/testCases/conversion/format/string.json" with { type: "json" };
import TimeTestCases from "../resources/testCases/conversion/format/time.json" with { type: "json" };

describe("com.mgmtp.a12.conversion.formatBooleanType", () => {
	BooleanTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatConfirmType", () => {
	ConfirmTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatCustomType", () => {
	CustomTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatDateType", () => {
	DateTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatDateFragmentType", () => {
	DateFragmentTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatDateTimeType", () => {
	DateTimeTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatTimeType", () => {
	TimeTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatDateRangeType", () => {
	DateRangeTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatNumberType", () => {
	NumberTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatStringType", () => {
	StringTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.formatEnumerationType", () => {
	EnumTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

describe("com.mgmtp.a12.conversion.expectedErrors", () => {
	ErrorTestCases.testCases.forEach(testCase => {
		testFormat(testCase);
	});
});

function testFormat(testCase: any): void {
	if (!testCase.active) {
		return;
	}
	it(testCase.id, () => {
		const conversionConfig: any =
			Configs[testCase.parameters.conversionConfigId as keyof typeof Configs];
		const value = extractValue(testCase);
		const errorCode = testCase.expectation.errorCode;
		if (errorCode === "exception") {
			const errorMessage = testCase.expectation.errorMessage;
			throws(
				() => defaultValueConversion(conversionConfig).formatValue(value, conversionConfig),
				Error(errorMessage)
			);
			return;
		}
		const formatted = defaultValueConversion(conversionConfig).formatValue(value, conversionConfig);
		let expectedValue;
		if (testCase.expectation.convertedValue !== null) {
			expectedValue = testCase.expectation.convertedValue;
		}

		strictEqual(formatted, expectedValue, "error in " + testCase.id);
	});
}

export function extractValue(testCase: any): SupportedType {
	const type = testCase.parameters.type;
	if (type === "Date") {
		return new Date(testCase.parameters.value);
	} else if (type === "DateArray") {
		return [new Date(testCase.parameters.value[0]), new Date(testCase.parameters.value[1])];
	} else {
		return testCase.parameters.value;
	}
}
