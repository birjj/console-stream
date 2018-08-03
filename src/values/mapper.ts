import BooleanValue from "../values/primitives/boolean-value";
import NumberValue from "../values/primitives/number-value";
import StringValue from "../values/primitives/string-value";
import UndefinedValue from "../values/primitives/undefined-value";
import DateValue from "../values/date-value";
import ErrorValue from "../values/error-value";
import FunctionValue from "../values/function-value";
import ArrayValue from "../values/array-value";
import ObjectValue from "../values/object-value";
import NodeValue from "../values/node-value";
import BaseValue from "../values/base-value";

/**
 * Returns the Value representation of a value.
 */
export default function valueMapper(value: any) {
    if (typeof value === "number") {
        return new NumberValue(value);
    }
    if (typeof value === "boolean") {
        return new BooleanValue(value);
    }
    if (typeof value === "undefined" || value === null) {
        return new UndefinedValue(value);
    }
    if (typeof value === "string") {
        return new StringValue(value);
    }
    if (value instanceof Error) {
        return new ErrorValue(value);
    }
    if (value instanceof Date) {
        return new DateValue(value);
    }
    if (value instanceof Array) {
        return new ArrayValue(value);
    }
    if (value && value.__type === "function") {
        return new FunctionValue(value);
    }
    if (value instanceof Object) {
        if (value.__type === "node") {
            return new NodeValue(value);
        }
        return new ObjectValue(value);
    }
    return null;
}
