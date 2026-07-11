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

import { strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";

import type { Localizable } from "../main/index.js";
import { defaultLocalizerFactory, Locale } from "../main/index.js";
import {
	createTextResolverForTreeMap,
	defaultTranslationFinderFactory
} from "../main/localization/defaultTranslationFinder.js";

describe("com.mgmtp.a12.localization.Localizer", () => {
	describe("the default localizer factory returns a localizer function that", () => {
		const LOCALE = Locale.fromString("en_GB");

		describe("when used without passing external translations, placeholder args, kernel formatter and data formats", () => {
			const localizer = defaultLocalizerFactory({ locale: LOCALE });

			it("returns the translation from the first localizable when called with a list of localizables that all contain defaults", () => {
				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en_GB: "translation [en_GB]"
						}
					},
					{
						key: "test.me.2",
						defaults: {
							en_GB: "translation 2 [en_GB]"
						}
					}
				];

				strictEqual(
					localizer(...localizables),
					localizables[0].defaults?.[Locale.toString(LOCALE)]
				);
			});

			it("returns the translation from a later localizable when called with a list of localizables that do not all contain defaults", () => {
				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en_GB: undefined
						}
					},
					{
						key: "test.me.2",
						defaults: {
							en_GB: undefined
						}
					},
					{
						key: "test.me.3",
						defaults: {
							en_GB: "translation 3 [en_GB]"
						}
					}
				];

				strictEqual(
					localizer(...localizables),
					localizables[2].defaults?.[Locale.toString(LOCALE)]
				);
			});

			it("returns undefined when called with a list of localizables that do not contain any defaults", () => {
				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en_GB: undefined
						}
					},
					{
						key: "test.me.2",
						defaults: {
							en_GB: undefined
						}
					},
					{
						key: "test.me.3",
						defaults: {
							en_GB: undefined
						}
					}
				];

				strictEqual(localizer(...localizables), undefined);
			});

			it("returns the first matching translation for a fallback locale if no localizable has a translation for the default locale", () => {
				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en_GB: undefined,
							en: undefined
						}
					},
					{
						key: "test.me.2",
						defaults: {
							en_GB: undefined,
							en: undefined
						}
					},
					{
						key: "test.me.3",
						defaults: {
							en_GB: undefined,
							en: "test fallback 3 [en]"
						}
					}
				];

				strictEqual(localizer(...localizables), "test fallback 3 [en]");
			});

			it("returns undefined when called without any localizables", () => {
				strictEqual(localizer(), undefined);
			});
		});

		describe("when used with external translations (LocalizationTreeMap)", () => {
			it("returns the matching external translation for the given localizables even if a default exists", () => {
				// test with tree map as external translation source
				const localizer = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory(
						createTextResolverForTreeMap({
							en_GB: {
								test: {
									me: "external translation [en_GB]"
								}
							}
						})
					)
				});

				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en_GB: "translation [en_GB]"
						}
					}
				];

				strictEqual(localizer(...localizables), "external translation [en_GB]");

				// test with custom translation finder function as external translation source
				const localizer2 = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory((localizableKey, locale) => {
						if (localizableKey === "test.me" && Locale.toString(locale) === "en_GB") {
							return "external translation [en_GB]";
						} else {
							return undefined;
						}
					})
				});

				strictEqual(localizer2(...localizables), "external translation [en_GB]");
			});

			it("returns the localizable default translation for a fallback locale if the external translation does not contain a text for the preferred locale", () => {
				// test with tree map as external translation source
				const localizer = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory(
						createTextResolverForTreeMap({
							en: {
								test: {
									me: "external translation [en]"
								}
							}
						})
					)
				});

				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en_GB: "translation [en_GB]"
						}
					}
				];

				strictEqual(localizer(...localizables), "translation [en_GB]");

				// test with custom translation finder function as external translation source
				const localizer2 = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory((_localizableKey, locale) => {
						if (Locale.toString(locale) === "en_GB") {
							return undefined;
						} else {
							return `translation ${Locale.toString(locale)}`;
						}
					})
				});

				strictEqual(localizer2(...localizables), "translation [en_GB]");
			});

			it("returns the first matching localizable default if no matching external translation can be found", () => {
				// test with tree map as external translation source
				const localizer = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory(
						createTextResolverForTreeMap({
							en_GB: {
								test: {
									it: "external translation [en_GB]"
								}
							},
							en: {
								test: {
									it: "external translation [en]"
								}
							}
						})
					)
				});

				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en_GB: "translation [en_GB]"
						}
					}
				];

				strictEqual(localizer(...localizables), "translation [en_GB]");

				// test with custom translation finder function as external translation source
				const localizer2 = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory(
						(_localizableKey, _locale) => undefined
					)
				});

				strictEqual(localizer2(...localizables), "translation [en_GB]");
			});

			it("returns the empty string if the matching external translation returns an empty string", () => {
				// test with tree map as external translation source
				const localizer = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory(
						createTextResolverForTreeMap({
							en_GB: {
								test: {
									me: ""
								}
							}
						})
					)
				});

				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							en: "translation [en]"
						}
					}
				];

				strictEqual(localizer(...localizables), "");

				// test with custom translation finder function as external translation source
				const localizer2 = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory((_localizableKey, _locale) => "")
				});

				strictEqual(localizer2(...localizables), "");
			});

			it("returns undefined if no matching external translation and no localizable default can be found", () => {
				// test with tree map as external translation source
				const localizer = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory(
						createTextResolverForTreeMap({
							en_US: {
								test: {
									me: "external translation [en_US]"
								}
							},
							de_DE: {
								test: {
									me: "external translation [de_DE]"
								}
							}
						})
					)
				});

				const localizables: Localizable[] = [
					{
						key: "test.me",
						defaults: {
							de_DE: "translation [de_DE]",
							en_US: "translation [en_US]"
						}
					}
				];

				strictEqual(localizer(...localizables), undefined);

				// test with custom translation finder function as external translation source
				const localizer2 = defaultLocalizerFactory({
					locale: LOCALE,
					translationSource: defaultTranslationFinderFactory(
						(_localizableKey, _locale) => undefined
					)
				});

				strictEqual(localizer2(...localizables), undefined);
			});
		});

		describe("when used with custom fallback locales", () => {
			const localizer = defaultLocalizerFactory({
				locale: LOCALE,
				fallbackLocales: [{ language: "fr", country: "CH" }, { language: "cz" }]
			});

			it("returns the first localizable default that matches the default locale", () => {
				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							en_GB: "translation [en_GB]",
							fr_CH: "translation [fr_CH]",
							cz: "translation [cz]"
						}
					}),
					"translation [en_GB]"
				);
			});

			it("returns the first localizable default that matches a fallback locale if none matches the default locale", () => {
				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							fr_CH: "translation [fr_CH]",
							cz: "translation [cz]"
						}
					}),
					"translation [fr_CH]"
				);

				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							en_US: "translation [en_US]",
							fr_FR: "translation [fr_FR]",
							cz: "translation [cz]"
						}
					}),
					"translation [cz]"
				);
			});

			it("returns undefined if no localizable default matches the default locale or any of the fallback locales", () => {
				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							en_US: "translation [en_US]",
							fr_FR: "translation [fr_FR]",
							cz_CZ: "translation [cz_CZ]"
						}
					}),
					undefined
				);
			});

			describe("and external translations (LocalizationTreeMap)", () => {
				it("returns the first external translation that matches the default locale", () => {
					const localizer = defaultLocalizerFactory({
						locale: LOCALE,
						translationSource: defaultTranslationFinderFactory(
							createTextResolverForTreeMap({
								en_GB: {
									test: {
										me: "external translation [en_GB]"
									}
								},
								en: {
									test: {
										me: "external translation [en]"
									}
								}
							})
						),
						fallbackLocales: [{ language: "fr", country: "CH" }, { language: "cz" }]
					});

					strictEqual(
						localizer({
							key: "test.me",
							defaults: {
								en_GB: "translation [en_GB]",
								en: "translation [en]"
							}
						}),
						"external translation [en_GB]"
					);
				});

				it("returns the first external translation that matches a fallback locale if none matches the default locale", () => {
					const localizer = defaultLocalizerFactory({
						locale: LOCALE,
						translationSource: defaultTranslationFinderFactory(
							createTextResolverForTreeMap({
								fr_CH: {
									test: {
										me: "external translation [fr_CH]"
									}
								},
								cz: {
									test: {
										me: "external translation [cz]"
									}
								}
							})
						),
						fallbackLocales: [{ language: "fr", country: "CH" }, { language: "cz" }]
					});

					strictEqual(
						localizer({
							key: "test.me",
							defaults: {
								fr_CH: "translation [fr_CH]",
								cz: "translation [cz]"
							}
						}),
						"external translation [fr_CH]"
					);
				});

				it("returns the first localizable default that matches the default locale if no match among the external translation could be found", () => {
					const localizer = defaultLocalizerFactory({
						locale: LOCALE,
						translationSource: defaultTranslationFinderFactory(
							createTextResolverForTreeMap({
								en_US: {
									test: {
										me: "external translation [en_US]"
									}
								},
								de: {
									test: {
										me: "external translation [de]"
									}
								}
							})
						),
						fallbackLocales: [{ language: "fr", country: "CH" }, { language: "cz" }]
					});

					strictEqual(
						localizer({
							key: "test.me",
							defaults: {
								en_GB: "translation [en_GB]"
							}
						}),
						"translation [en_GB]"
					);
				});

				it("returns the first localizable default that matches a fallback locale if no match among the external translation or with the default locale could be found", () => {
					const localizer = defaultLocalizerFactory({
						locale: LOCALE,
						translationSource: defaultTranslationFinderFactory(
							createTextResolverForTreeMap({
								en_US: {
									test: {
										me: "external translation [en_US]"
									}
								},
								de: {
									test: {
										me: "external translation [de]"
									}
								}
							})
						),
						fallbackLocales: [{ language: "fr", country: "CH" }, { language: "cz" }]
					});

					strictEqual(
						localizer({
							key: "test.me",
							defaults: {
								cz: "translation [cz]"
							}
						}),
						"translation [cz]"
					);
				});

				it("returns undefined if no external translation or localizable default matches the default or any of the fallback locales", () => {
					const localizer = defaultLocalizerFactory({
						locale: LOCALE,
						translationSource: defaultTranslationFinderFactory(
							createTextResolverForTreeMap({
								en_US: {
									test: {
										me: "external translation [en_US]"
									}
								},
								de: {
									test: {
										me: "external translation [de]"
									}
								}
							})
						),
						fallbackLocales: [{ language: "fr", country: "CH" }, { language: "cz" }]
					});

					strictEqual(
						localizer({
							key: "test.me",
							defaults: {
								cz_CZ: "translation [cz_CZ]"
							}
						}),
						undefined
					);
				});
			});
		});

		describe("when called with a localizable that contains placeholders and args", () => {
			it('returns the default value for a placeholder arg of type "plain"', () => {
				const localizer = defaultLocalizerFactory({
					locale: LOCALE
				});

				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							en_GB: "translation with $testArg$ [en_GB]"
						},
						args: {
							testArg: {
								type: "plain",
								value: "test-value"
							}
						}
					}),
					"translation with test-value [en_GB]"
				);
			});
			it('returns the respective dataFormat representation for a placeholder arg of type "dataFormat"', () => {
				const localizer = defaultLocalizerFactory({ locale: LOCALE });

				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							en_GB: "translation with $testArg$ [en_GB]"
						},
						args: {
							testArg: {
								type: "dataFormat",
								value: "test-value",
								properties: {
									type: "decimalSeparator"
								}
							}
						}
					}),
					"translation with . [en_GB]"
				);
			});

			it('returns the given internal presentation for a placeholder arg of type "dataFormat" when no dataFormats are given for the locale', () => {
				const localizer = defaultLocalizerFactory({
					locale: { language: "cz", country: "CZ" }
				});

				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							cz_CZ: "translation with $testArg$ [cz_CZ]"
						},
						args: {
							testArg: {
								type: "dataFormat",
								value: "*",
								properties: {
									type: "decimalSeparator"
								}
							}
						}
					}),
					"translation with * [cz_CZ]"
				);
			});

			it('returns the default localizable value for a placeholder arg of type "localizable"', () => {
				const localizer = defaultLocalizerFactory({ locale: LOCALE });

				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							en_GB: "translation with $testArg$ [en_GB]"
						},
						args: {
							testArg: {
								type: "localizable",
								value: "test-value",
								properties: [
									{
										key: "test.me.placeholder",
										defaults: {
											en_GB: "[en_GB] test-value"
										}
									}
								]
							}
						}
					}),
					"translation with [en_GB] test-value [en_GB]"
				);
			});

			it('does not replace a placeholder arg of type "localizable" that cannot be resolved to a translation', () => {
				const localizer = defaultLocalizerFactory({
					locale: { language: "cz", country: "CZ" }
				});

				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							cz_CZ: "translation with $testArg$ [cz_CZ]"
						},
						args: {
							testArg: {
								type: "localizable",
								value: "test-value",
								properties: [
									{
										key: "test.me.placeholder",
										defaults: {
											en_GB: "[en_GB] test-value"
										}
									}
								]
							}
						}
					}),
					"translation with $testArg$ [cz_CZ]"
				);
			});

			it("does not treat a single $ as placeholder", () => {
				const localizer = defaultLocalizerFactory({
					locale: { language: "cz", country: "CZ" }
				});
				strictEqual(
					localizer({
						key: "test.me",
						defaults: {
							cz_CZ: "I need 100$ now"
						},
						args: {
							" now": {
								type: "plain",
								value: "shouldNotExist"
							}
						}
					}),
					"I need 100$ now"
				);
			});

			describe("and no model-based formatter function was given", () => {
				it('returns the default value for a placeholder arg of type "formattable"', () => {
					const localizer = defaultLocalizerFactory({
						locale: LOCALE
					});
					strictEqual(
						localizer({
							key: "test.me",
							defaults: {
								en_GB: "translation with $testArg$ [en_GB]"
							},
							args: {
								testArg: {
									type: "formattable",
									value: "test-value",
									properties: {
										formattingConfig: {
											type: "StringType",
											modelId: "foo",
											modelPath: [{ elementName: "bar" }]
										}
									}
								}
							}
						}),
						"translation with test-value [en_GB]"
					);
				});
			});

			describe("and a ValueConversion object was given", () => {
				it('returns the result of the ValueConversion formatValue function for a placeholder arg of type "formattable"', () => {
					const localizer = defaultLocalizerFactory({
						locale: LOCALE,
						conversion: {
							parseValue: () => ({}),
							formatValue: () => "formatted-test-value"
						}
					});
					strictEqual(
						localizer({
							key: "test.me",
							defaults: {
								en_GB: "translation with $testArg$ [en_GB]"
							},
							args: {
								testArg: {
									type: "formattable",
									value: "test-value",
									properties: {
										formattingConfig: {
											type: "StringType",
											modelId: "foo",
											modelPath: [{ elementName: "bar" }]
										}
									}
								}
							}
						}),
						"translation with formatted-test-value [en_GB]"
					);
				});
			});
		});
	});
});
