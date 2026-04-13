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

import { Big } from "big.js";

/**
 * Utility class for numbers with decimal places using the big.js library to simulate the rounding behavior of Java.
 */
export class BigDecimal {
	public static readonly DEFAULT_SCALE = 19;
	/**
	 * The number of significant figures that the java implementation rounds to in internal operations,
	 * required to simulate this rounding behavior in the typescript implementation
	 */
	public static readonly JAVA_INTERNAL_PRECISION = 50;
	/**
	 * Maximum number of *decimal places* used for internal calculations.
	 * Note that we additionally round to JAVA_INTERNAL_PRECISION *significant figures* to
	 * simulate the java implementation's behavior
	 */
	public static readonly INTERNAL_DECIMAL_PLACES = BigDecimal.JAVA_INTERNAL_PRECISION + 10;
	// java implementation uses precision of 50 decimal places
	// *if* we want to have that precision for numbers 1e-10 < x < 1, we need some (10 in that case) additional
	// decimal places

	public static readonly ROUND_DOWN = Big.roundDown;
	public static readonly ROUND_HALF_UP = Big.roundHalfUp;
	public static readonly ROUND_HALF_EVEN = Big.roundHalfEven;
	public static readonly ROUND_UP = Big.roundUp;
	public static readonly DEFAULT_VALUE = 0;

	protected _zahl: Big;

	constructor(wert: number | string | Big | boolean) {
		Big.DP = BigDecimal.INTERNAL_DECIMAL_PLACES;
		Big.RM = BigDecimal.ROUND_HALF_UP;
		if (typeof wert === "boolean") {
			this._zahl = this._roundSimulateJavaInternalPrecision(new Big(BigDecimal.DEFAULT_VALUE));
		} else {
			this._zahl = this._roundSimulateJavaInternalPrecision(new Big(wert));
		}
	}

	/**
	 * This method is used to simulate the rounding behavior of Java.
	 * In Java, BigDecimals round results to JAVA_INTERNAL_PRECISION *significant digits*.
	 * In typescript, however, Big.js rounds to INTERNAL_DECIMAL_PLACES *fractional digits* (decimal places).
	 *
	 * Warning: Results will be approximate for numbers with very small absolute values,
	 * where INTERNAL_DECIMAL_PLACES is insufficient to capture the full JAVA_INTERNAL_PRECISION.
	 * (This is unavoidable with Big.js, unless Big.js offers a way to specify internal rounding
	 * *precision*, with *no limit* on internal *decimal places*)
	 *
	 * @param num the number to be rounded.
	 */
	protected _roundSimulateJavaInternalPrecision(num: Big): Big {
		// num.e is the exponent, e = 0 means 1 integral digit.
		const javaDecimalPlaces = BigDecimal.JAVA_INTERNAL_PRECISION - num.e - 1;
		return num.round(Math.min(javaDecimalPlaces, BigDecimal.INTERNAL_DECIMAL_PLACES));
	}

	/**
	 * Returns the number of digits left to the decimal point
	 */
	public numberOfIntegerDigits(): number {
		return this._zahl.e + 1;
	}

	/**
	 * Returns the number of digits right to the decimal point
	 */
	public scale(): number {
		// in case the number is too big
		return Math.max(0, this._zahl.c.length - this.numberOfIntegerDigits());
	}
}
