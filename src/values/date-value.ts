import BaseValue from "./base-value";

export default class DateValue extends BaseValue<Date> {
    className = "date";
    stringify(val: Date) {
        return val.toString();
    }
}
