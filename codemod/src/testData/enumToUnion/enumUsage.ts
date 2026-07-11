import { DatePrecision, InterpretationOfYear } from "@com.mgmtp.a12.utils/utils-localization";

const precision1 = DatePrecision.FULL;
const precision2 = DatePrecision.DAY_OPTIONAL;
const precision3 = DatePrecision.MONTH_OPTIONAL;
const precision4 = DatePrecision.YEAR_OPTIONAL;

const interpretation1 = InterpretationOfYear.FROM;
const interpretation2 = InterpretationOfYear.TO;

if (currentPrecision === DatePrecision.FULL) {
	console.log("full precision");
}

const config = {
	precision: DatePrecision.DAY_OPTIONAL,
	interpretation: InterpretationOfYear.FROM
};
