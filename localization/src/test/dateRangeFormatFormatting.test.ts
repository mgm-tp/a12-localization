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

import { strictEqual, throws } from "node:assert/strict";

import { defaultLocalizerFactory } from "../main/index.js";

describe("com.mgmtp.a12.localization.dateRangeFormatFormatting", () => {
	describe("when the given format object (localizable args value) does not contain dateFormat and dateRangeSeparator", () => {
		it("throws an error", () => {
			const deLocalizer = defaultLocalizerFactory({
				locale: { language: "de" }
			});
			throws(() =>
				deLocalizer({
					key: "dateRangeFormat",
					defaults: {
						de: "$dateRangeFormat$"
					},
					args: {
						dateRangeFormat: {
							type: "dataFormat",
							value: true,
							properties: {
								type: "dateRange"
							}
						}
					}
				})
			);
		});
	});

	describe("when the given format object contains a dateTime format", () => {
		describe("and DataFormats.dateTimeFormat is given", () => {
			it("returns the date range format using the DataFormats dateTimeFormat", () => {
				const deLocalizer = defaultLocalizerFactory({
					locale: { language: "de" },
					dataFormats: {
						dateTimeFormat: "yyyy_MM_dd=HH;mm;ss"
					}
				});
				strictEqual(
					deLocalizer({
						key: "dateRangeFormat",
						defaults: {
							de: "$dateRangeFormat$"
						},
						args: {
							dateRangeFormat: {
								type: "dataFormat",
								value: {
									dateFormat: "yyyy-MM-dd'T'HH:mm:ss",
									dateRangeSeparator: "->"
								},
								properties: {
									type: "dateRange"
								}
							}
						}
					}),
					"yyyy_MM_dd=HH;mm;ss->yyyy_MM_dd=HH;mm;ss"
				);
			});

			describe("and DataFormats.formatCharacters is given", () => {
				it("returns the date range format using the DataFormats dateTimeFormat with the format characters applied", () => {
					const deLocalizer = defaultLocalizerFactory({
						locale: { language: "de" },
						dataFormats: {
							dateTimeFormat: "yyyy_MM_dd=HH;mm;ss",
							formatCharacters: {
								day: "s",
								month: "m",
								year: "h"
							}
						}
					});
					strictEqual(
						deLocalizer({
							key: "dateRangeFormat",
							defaults: {
								de: "$dateRangeFormat$"
							},
							args: {
								dateRangeFormat: {
									type: "dataFormat",
									value: {
										dateFormat: "yyyy-MM-dd'T'HH:mm:ss",
										dateRangeSeparator: "->"
									},
									properties: {
										type: "dateRange"
									}
								}
							}
						}),
						"hhhh_mm_ss=HH;mm;ss->hhhh_mm_ss=HH;mm;ss"
					);
				});
			});
		});

		describe("and DataFormats.dateTimeFormat is not given", () => {
			it("returns the date range format from the original format object (localizable args value)", () => {
				const localizer = defaultLocalizerFactory({
					locale: { language: "cz" }
				});
				strictEqual(
					localizer({
						key: "dateRangeFormat",
						defaults: {
							cz: "$dateRangeFormat$"
						},
						args: {
							dateRangeFormat: {
								type: "dataFormat",
								value: {
									dateFormat: "yyyy_MM_dd=HH;mm;ss",
									dateRangeSeparator: "->"
								},
								properties: {
									type: "dateRange"
								}
							}
						}
					}),
					"yyyy_MM_dd=HH;mm;ss->yyyy_MM_dd=HH;mm;ss"
				);
			});
		});
	});

	describe("when the given format object contains a time format", () => {
		describe("and DataFormats.timeFormat is given", () => {
			it("returns the date range format using the DataFormats timeFormat", () => {
				const deLocalizer = defaultLocalizerFactory({
					locale: { language: "de" },
					dataFormats: {
						timeFormat: "HH;mm;ss"
					}
				});
				strictEqual(
					deLocalizer({
						key: "dateRangeFormat",
						defaults: {
							de: "$dateRangeFormat$"
						},
						args: {
							dateRangeFormat: {
								type: "dataFormat",
								value: {
									dateFormat: "HH:mm:ss",
									dateRangeSeparator: "->"
								},
								properties: {
									type: "dateRange"
								}
							}
						}
					}),
					"HH;mm;ss->HH;mm;ss"
				);
			});
		});

		describe("and DataFormats.timeFormat is not given", () => {
			it("returns the date range format from the original format object (localizable args value)", () => {
				const localizer = defaultLocalizerFactory({
					locale: { language: "cz" }
				});
				strictEqual(
					localizer({
						key: "dateRangeFormat",
						defaults: {
							cz: "$dateRangeFormat$"
						},
						args: {
							dateRangeFormat: {
								type: "dataFormat",
								value: {
									dateFormat: "HH;mm;ss",
									dateRangeSeparator: "->"
								},
								properties: {
									type: "dateRange"
								}
							}
						}
					}),
					"HH;mm;ss->HH;mm;ss"
				);
			});
		});
	});

	describe("when no DataFormats.dateRangeSeparator is given", () => {
		it("returns the date range format using the date range separator from the original format object (localizable args value)", () => {
			const localizer = defaultLocalizerFactory({
				locale: { language: "cz" }
			});
			strictEqual(
				localizer({
					key: "dateRangeFormat",
					defaults: {
						cz: "$dateRangeFormat$"
					},
					args: {
						dateRangeFormat: {
							type: "dataFormat",
							value: {
								dateFormat: "yyyy_MM_dd",
								dateRangeSeparator: "-"
							},
							properties: {
								type: "dateRange"
							}
						}
					}
				}),
				"yyyy_MM_dd-yyyy_MM_dd"
			);
		});
	});

	describe("when DataFormats.dateRangeSeparator is given", () => {
		it("returns the date range format using DataFormats.dateRangeSeparator", () => {
			const localizer = defaultLocalizerFactory({
				locale: { language: "cz" },
				dataFormats: {
					dateRangeSeparator: "="
				}
			});
			strictEqual(
				localizer({
					key: "dateRangeFormat",
					defaults: {
						cz: "$dateRangeFormat$"
					},
					args: {
						dateRangeFormat: {
							type: "dataFormat",
							value: {
								dateFormat: "yyyy_MM_dd",
								dateRangeSeparator: "-"
							},
							properties: {
								type: "dateRange"
							}
						}
					}
				}),
				"yyyy_MM_dd=yyyy_MM_dd"
			);
		});
	});

	describe('when language="de" and no custom DataFormats are given', () => {
		it("returns TT.MM.JJJJ-TT.MM.JJJJ as the date range format", () => {
			const deLocalizer = defaultLocalizerFactory({
				locale: { language: "de" }
			});
			strictEqual(
				deLocalizer({
					key: "dateRangeFormat",
					defaults: {
						de: "$dateRangeFormat$"
					},
					args: {
						dateRangeFormat: {
							type: "dataFormat",
							value: {
								dateFormat: "yyyy-MM-dd",
								dateRangeSeparator: "_"
							},
							properties: {
								type: "dateRange"
							}
						}
					}
				}),
				"TT.MM.JJJJ-TT.MM.JJJJ"
			);
		});
	});

	describe('when language="en" and no custom DataFormats are given', () => {
		it("returns MM/dd/yyyy-MM/dd/yyyy as the date range format", () => {
			const enLocalizer = defaultLocalizerFactory({
				locale: { language: "en" }
			});
			strictEqual(
				enLocalizer({
					key: "dateRangeFormat",
					defaults: {
						en: "$dateRangeFormat$"
					},
					args: {
						dateRangeFormat: {
							type: "dataFormat",
							value: {
								dateFormat: "dd-MM-yyyy",
								dateRangeSeparator: "_"
							},
							properties: {
								type: "dateRange"
							}
						}
					}
				}),
				"MM/dd/yyyy-MM/dd/yyyy"
			);
		});
	});

	describe('when language is neither "en", nor "de"', () => {
		describe("and no custom DataFormats are given", () => {
			it("returns the value from the original format object (localizable args value) the date range format", () => {
				const czLocalizer = defaultLocalizerFactory({
					locale: { language: "cz" }
				});
				strictEqual(
					czLocalizer({
						key: "dateRangeFormat",
						defaults: {
							cz: "$dateRangeFormat$"
						},
						args: {
							dateRangeFormat: {
								type: "dataFormat",
								value: {
									dateFormat: "dd-MM-yyyy",
									dateRangeSeparator: "_"
								},
								properties: {
									type: "dateRange"
								}
							}
						}
					}),
					"dd-MM-yyyy_dd-MM-yyyy"
				);
			});
		});
	});
});
