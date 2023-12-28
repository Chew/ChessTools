/**
 * Converts a given value to null if it is 0.
 *
 * @param val The value to convert
 */
export function zeroToNull(val: number) {
    return val === 0 ? null : val
}
