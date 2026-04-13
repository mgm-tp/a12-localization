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

import { defaultDataFormats, defaultLocalizerFactory } from "../main/index.js";

describe("com.mgmtp.a12.localization.dateFormatFormatting", () => {
	describe("when the given format string (localizable args value) is not a string", () => {
		it("throws an error", () => {
			const deLocalizer = defaultLocalizerFactory({
				locale: { language: "de" }
			});
			throws(() =>
				deLocalizer({
					key: "dateFormat",
					defaults: {
						de: "$dateFormat$"
					},
					args: {
						dateFormat: {
							type: "dataFormat",
							value: true,
							properties: {
								type: "date"
							}
						}
					}
				})
			);
		});
	});

	describe("when the given format string contains a dateTime format", () => {
		describe("and DataFormats.dateTimeFormat is given", () => {
			it("returns the DataFormats dateTimeFormat", () => {
				const deLocalizer = defaultLocalizerFactory({
					locale: { language: "de" },
					dataFormats: {
						dateTimeFormat: "yyyy_MM_dd=HH;mm;ss"
					}
				});
				strictEqual(
					deLocalizer({
						key: "dateFormat",
						defaults: {
							de: "$dateFormat$"
						},
						args: {
							dateFormat: {
								type: "dataFormat",
								value: "yyyy-MM-dd'T'HH:mm:ss",
								properties: {
									type: "date"
								}
							}
						}
					}),
					"yyyy_MM_dd=HH;mm;ss"
				);
			});

			describe("and DateFormats.dateTimeFormat contains an 'a' for am/pm", () => {
				it("returns the dateTime format with 'AM/PM' in place of the 'a'", () => {
					const enLocalizer = defaultLocalizerFactory({
						locale: { language: "en" },
						dataFormats: {
							...defaultDataFormats({ language: "en" }),
							dateTimeFormat: "MM/dd/yyyy hh:mm a"
						}
					});
					strictEqual(
						enLocalizer({
							key: "dateFormat",
							defaults: {
								en: "$dateFormat$"
							},
							args: {
								dateFormat: {
									type: "dataFormat",
									value: "yyyy-MM-dd'T'HH:mm:ss",
									properties: {
										type: "date"
									}
								}
							}
						}),
						"MM/dd/yyyy hh:mm AM/PM"
					);
				});
			});

			describe("and DataFormats.formatCharacters is given", () => {
				it("returns the DataFormats dateTimeFormat with the format characters applied", () => {
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
							key: "dateFormat",
							defaults: {
								de: "$dateFormat$"
							},
							args: {
								dateFormat: {
									type: "dataFormat",
									value: "yyyy-MM-dd'T'HH:mm:ss",
									properties: {
										type: "date"
									}
								}
							}
						}),
						"hhhh_mm_ss=HH;mm;ss"
					);
				});
			});
		});

		describe("and DataFormats.dateTimeFormat is not given", () => {
			it("returns the original format string", () => {
				const localizer = defaultLocalizerFactory({
					locale: { language: "cz" }
				});
				strictEqual(
					localizer({
						key: "dateFormat",
						defaults: {
							cz: "$dateFormat$"
						},
						args: {
							dateFormat: {
								type: "dataFormat",
								value: "yyyy_MM_dd=HH;mm;ss",
								properties: {
									type: "date"
								}
							}
						}
					}),
					"yyyy_MM_dd=HH;mm;ss"
				);
			});
		});
	});

	describe("when the given format string contains a time format", () => {
		describe("and DataFormats.timeFormat is given", () => {
			it("returns the DataFormats timeFormat", () => {
				const deLocalizer = defaultLocalizerFactory({
					locale: { language: "de" },
					dataFormats: {
						timeFormat: "HH;mm;ss"
					}
				});
				strictEqual(
					deLocalizer({
						key: "dateFormat",
						defaults: {
							de: "$dateFormat$"
						},
						args: {
							dateFormat: {
								type: "dataFormat",
								value: "HH:mm:ss",
								properties: {
									type: "date"
								}
							}
						}
					}),
					"HH;mm;ss"
				);
			});
		});

		describe("and DataFormats.timeFormat is not given", () => {
			it("returns the original format string", () => {
				const localizer = defaultLocalizerFactory({
					locale: { language: "cz" }
				});
				strictEqual(
					localizer({
						key: "dateFormat",
						defaults: {
							cz: "$dateFormat$"
						},
						args: {
							dateFormat: {
								type: "dataFormat",
								value: "HH;mm;ss",
								properties: {
									type: "date"
								}
							}
						}
					}),
					"HH;mm;ss"
				);
			});
		});
	});

	describe("when no DataFormats.dateFragmentOrdering is given", () => {
		it("returns the given format string (localizable args value)", () => {
			const localizer = defaultLocalizerFactory({
				locale: { language: "cz" }
			});
			strictEqual(
				localizer({
					key: "dateFormat",
					defaults: {
						cz: "$dateFormat$"
					},
					args: {
						dateFormat: {
							type: "dataFormat",
							value: "yyyy_MM_dd",
							properties: {
								type: "date"
							}
						}
					}
				}),
				"yyyy_MM_dd"
			);
		});
	});

	describe("when DataFormats.dateFragmentOrdering and DateFormats.formatCharacters is given", () => {
		it("returns the date format with the given ordering and using the given characters", () => {
			const deLocalizer = defaultLocalizerFactory({
				locale: { language: "de" },
				dataFormats: {
					dateFragmentOrdering: "DAY_MONTH_YEAR",
					formatCharacters: {
						day: "a",
						month: "b",
						year: "c"
					}
				}
			});
			strictEqual(
				deLocalizer({
					key: "dateFormat",
					defaults: {
						de: "$dateFormat$"
					},
					args: {
						dateFormat: {
							type: "dataFormat",
							value: "yyyy-MM-dd",
							properties: {
								type: "date"
							}
						}
					}
				}),
				"aa-bb-cccc"
			);
		});

		describe("and a DataFormats.dateSeparator is given", () => {
			it("returns the date format with the given ordering, characters and separator", () => {
				const deLocalizer = defaultLocalizerFactory({
					locale: { language: "de" },
					dataFormats: {
						dateFragmentOrdering: "DAY_MONTH_YEAR",
						dateSeparator: "*",
						formatCharacters: {
							day: "a",
							month: "b",
							year: "c"
						}
					}
				});
				strictEqual(
					deLocalizer({
						key: "dateFormat",
						defaults: {
							de: "$dateFormat$"
						},
						args: {
							dateFormat: {
								type: "dataFormat",
								value: "yyyy-MM-dd",
								properties: {
									type: "date"
								}
							}
						}
					}),
					"aa*bb*cccc"
				);
			});
		});

		describe("and the given format string is a partial date", () => {
			const localizer = defaultLocalizerFactory({
				locale: { language: "de" },
				dataFormats: {
					dateFragmentOrdering: "DAY_MONTH_YEAR",
					formatCharacters: {
						day: "a",
						month: "b",
						year: "c"
					}
				}
			});

			describe("yyyy", () => {
				it("returns the partial date format with the given ordering and characters", () => {
					strictEqual(
						localizer({
							key: "dateFormat",
							defaults: {
								de: "$dateFormat$"
							},
							args: {
								dateFormat: {
									type: "dataFormat",
									value: "yyyy",
									properties: {
										type: "date"
									}
								}
							}
						}),
						"cccc"
					);
				});
			});

			describe("yyyy/MM", () => {
				it("returns the partial date format with the given ordering and characters", () => {
					strictEqual(
						localizer({
							key: "dateFormat",
							defaults: {
								de: "$dateFormat$"
							},
							args: {
								dateFormat: {
									type: "dataFormat",
									value: "yyyy/MM",
									properties: {
										type: "date"
									}
								}
							}
						}),
						"bb/cccc"
					);
				});
			});

			describe("dd.MM", () => {
				it("returns the partial date format with the given ordering and characters", () => {
					strictEqual(
						localizer({
							key: "dateFormat",
							defaults: {
								de: "$dateFormat$"
							},
							args: {
								dateFormat: {
									type: "dataFormat",
									value: "dd.MM",
									properties: {
										type: "date"
									}
								}
							}
						}),
						"aa.bb"
					);
				});
			});
		});
	});

	describe('when language="de" and no custom DataFormats are given', () => {
		it("returns TT.MM.JJJJ as the date format", () => {
			const deLocalizer = defaultLocalizerFactory({
				locale: { language: "de" }
			});
			strictEqual(
				deLocalizer({
					key: "dateFormat",
					defaults: {
						de: "$dateFormat$"
					},
					args: {
						dateFormat: {
							type: "dataFormat",
							value: "yyyy-MM-dd",
							properties: {
								type: "date"
							}
						}
					}
				}),
				"TT.MM.JJJJ"
			);
		});
	});

	describe('when language="en" and no custom DataFormats are given', () => {
		it("returns MM/dd/yyyy as the date format", () => {
			const enLocalizer = defaultLocalizerFactory({
				locale: { language: "en" }
			});
			strictEqual(
				enLocalizer({
					key: "dateFormat",
					defaults: {
						en: "$dateFormat$"
					},
					args: {
						dateFormat: {
							type: "dataFormat",
							value: "dd-MM-yyyy",
							properties: {
								type: "date"
							}
						}
					}
				}),
				"MM/dd/yyyy"
			);
		});
	});

	describe('when language is neither "en", nor "de"', () => {
		describe("and no custom DataFormats are given", () => {
			it("returns the value as the date format", () => {
				const czLocalizer = defaultLocalizerFactory({
					locale: { language: "cz" }
				});
				strictEqual(
					czLocalizer({
						key: "dateFormat",
						defaults: {
							cz: "$dateFormat$"
						},
						args: {
							dateFormat: {
								type: "dataFormat",
								value: "xyz",
								properties: {
									type: "date"
								}
							}
						}
					}),
					"xyz"
				);
			});
		});

		describe("and custom DataFormats are given", () => {
			it("returns the date format using the ordering, separator and year/month/day representation from the DataFormats parameter", () => {
				const czLocalizer = defaultLocalizerFactory({
					locale: { language: "cz" },
					dataFormats: {
						dateFragmentOrdering: "DAY_MONTH_YEAR",
						dateSeparator: "#",
						formatCharacters: {
							day: "yad",
							month: "htnom",
							year: "raey"
						}
					}
				});
				strictEqual(
					czLocalizer({
						key: "dateFormat",
						defaults: {
							cz: "$dateFormat$"
						},
						args: {
							dateFormat: {
								type: "dataFormat",
								value: "dd-MM-yyyy",
								properties: {
									type: "date"
								}
							}
						}
					}),
					"yadyad#htnomhtnom#raeyraeyraeyraey"
				);
			});
		});
	});
});
