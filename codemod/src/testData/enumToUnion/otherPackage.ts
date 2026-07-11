import { DatePrecision, InterpretationOfYear } from "some-other-package";

const interpretation1 = InterpretationOfYear.FROM;
const interpretation2 = InterpretationOfYear.TO;

if (currentPrecision === DatePrecision.FULL) {
	console.log("full precision");
}
