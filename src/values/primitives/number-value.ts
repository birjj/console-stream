import BaseValue from "../base-value";

export default class NumberValue extends BaseValue<number> {
    className = "number";
    stringify(val: number) {
        return ""+val;
    }
}
