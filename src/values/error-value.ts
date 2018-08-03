import BaseValue from "./base-value";

export default class ErrorValue extends BaseValue<Error> {
    className = "error";
    stringify(val: Error) {
        return val.stack || val.message;
    }
}
