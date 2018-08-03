import BaseValue from "../base-value";

export default class UndefinedValue extends BaseValue<undefined|null> {
    className = "undefined";
    stringify(val: undefined|null) {
        return ""+val;
    }
}
