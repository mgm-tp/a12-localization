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

import { defaultValueConversion } from "../../main/conversion.js";

import Configs from "../resources/testCases/conversion/conversion_configs.json" with { type: "json" };
import ErrorTestCases from "../resources/testCases/conversion/parse/expectederrors.json" with { type: "json" };

describe("com.mgmtp.a12.conversion.expectedErrors", () => {
	ErrorTestCases.testCases.forEach(testCase => {
		if (!testCase.active) {
			return;
		}
		it(testCase.id, () => {
			const conversionConfig: any =
				Configs[testCase.parameters.conversionConfigId as keyof typeof Configs];
			const value = testCase.parameters.value;
			const expectedError = testCase.expectation;
			const errorCode = expectedError.errorCode;
			if (errorCode === "exception") {
				const errorMessage = testCase.expectation.errorMessage;
				throws(
					() => defaultValueConversion(conversionConfig).parseValue(value, conversionConfig),
					Error(errorMessage)
				);
				return;
			}
			let parsed;
			try {
				parsed = defaultValueConversion(conversionConfig).parseValue(value, conversionConfig);
			} catch {
				// eslint-disable-next-line no-console
				console.error(testCase.description);
			}
			const parsedError = parsed?.parseError;
			const parsedErrorCode = parsedError?.errorCode;
			strictEqual(parsedErrorCode, errorCode, "error in " + testCase.id);
			const errorKey = expectedError.errorKey;
			if (errorKey && parsedError) {
				// if errorKey is given in test expectation, test the returned ParseError for all its components
				strictEqual(parsedError.errorKey, errorKey, "error in " + testCase.id);
				const parsedErrorText = parsedError.errorText;
				const expectedErrorText = expectedError.errorText;
				strictEqual(parsedErrorText.key, expectedErrorText.key, "error in " + testCase.id);
				const parsedErrorTextArgs = parsedErrorText.args;
				const expectedErrorTextArgs = expectedErrorText.args;
				const parsedDateFormat = parsedErrorTextArgs?.dateFormat;
				const parsedTimeIntervalFormat = parsedErrorTextArgs?.timeIntervalFormat;
				const parsedDecimalSeparator = parsedErrorTextArgs?.decimalSeparator;
				if (parsedDateFormat) {
					const expectedDateFormat = expectedErrorTextArgs?.dateFormat;
					strictEqual(parsedDateFormat?.type, expectedDateFormat?.type, "error in " + testCase.id);
					strictEqual(
						parsedDateFormat?.value,
						expectedDateFormat?.value,
						"error in " + testCase.id
					);
				} else if (parsedTimeIntervalFormat) {
					const expectedTimeIntervalFormat = expectedErrorTextArgs?.timeIntervalFormat;
					strictEqual(
						parsedTimeIntervalFormat?.type,
						expectedTimeIntervalFormat?.type,
						"error in " + testCase.id
					);
					// TODO A12K-2582: Activate the following tests as soon as Placeholder.value is allowed to be an object for date ranges
					// const parsedFormatValue = parsedTimeIntervalFormat?.value;
					// const expectedFormatValue = expectedTimeIntervalFormat?.value;
					// strictEqual(parsedFormatValue?.dateFormat, expectedFormatValue?.dateFormat, "error in " + testCase.id);
					// strictEqual(parsedFormatValue?.dateRangeSeparator, expectedFormatValue?.dateRangeSeparator, "error in " + testCase.id);
				} else if (parsedDecimalSeparator) {
					const expectedDecimalSeparator = expectedErrorTextArgs?.decimalSeparator;
					strictEqual(
						parsedDecimalSeparator?.type,
						expectedDecimalSeparator?.type,
						"error in " + testCase.id
					);
					strictEqual(
						parsedDecimalSeparator?.value,
						expectedDecimalSeparator?.value,
						"error in " + testCase.id
					);
				}
				const parsedErrorTextDefaults = parsedErrorText.defaults;
				const expectedErrorTextDefaults = expectedErrorText.defaults;
				strictEqual(
					parsedErrorTextDefaults?.de,
					expectedErrorTextDefaults.de,
					"error in " + testCase.id
				);
				strictEqual(
					parsedErrorTextDefaults?.en,
					expectedErrorTextDefaults.en,
					"error in " + testCase.id
				);
				strictEqual(
					parsedErrorTextDefaults?.fr,
					expectedErrorTextDefaults.fr,
					"error in " + testCase.id
				);
				strictEqual(
					parsedErrorTextDefaults?.nl,
					expectedErrorTextDefaults.nl,
					"error in " + testCase.id
				);
				strictEqual(parsedError.severity, expectedError.severity, "error in " + testCase.id);
			}
		});
	});
});
