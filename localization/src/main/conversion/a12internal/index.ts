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

// following classes are used by Kernel only
export { BooleanConversion } from "./BooleanConversion.js";
export { ConfirmConversion } from "./ConfirmConversion.js";
export { DateConversion } from "./DateConversion.js";
export { DateRangeConversion } from "./DateRangeConversion.js";
export { NumberConversion } from "./NumberConversion.js";
export { BigDecimal } from "./util/BigDecimal.js";
export * from "./util/ConversionConfigBuilder.js";
export { DateAndFormat } from "./util/DateAndFormat.js";
export { DatePart } from "./util/DatePart.js";
export { DateInterval, DateUtil } from "./util/DateUtil.js";
export { LocalizableUtil } from "./util/LocalizableUtil.js";
export { NumberUtil } from "./util/NumberUtil.js";
export { PartiallyKnownDatesUtil } from "./util/PartiallyKnownDatesUtil.js";
export { StringUtil } from "./util/StringUtil.js";
export { TimeZonedDate } from "./util/TimeZonedDate.js";
export { ValidationDateParser } from "./util/ValidationDateParser.js";
