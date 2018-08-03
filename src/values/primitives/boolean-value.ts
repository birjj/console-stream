import BaseValue from "../base-value";

export default class BooleanValue extends BaseValue<boolean> {
    className = "boolean";
    stringify(val: boolean) {
        return ""+val;
    }
}
