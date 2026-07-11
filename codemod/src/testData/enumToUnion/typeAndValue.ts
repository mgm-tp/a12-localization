import { DatePrecision } from "@com.mgmtp.a12.utils/utils-localization";

// DatePrecision used as both value and type
function handlePrecision(precision: DatePrecision): void {
	if (precision === DatePrecision.FULL) {
		console.error("Error!");
	}
}

const myPrecision: DatePrecision = DatePrecision.DAY_OPTIONAL;
