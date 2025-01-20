/**
 * Generates a random string of the specified length using hexadecimal characters.
 * @param length - The desired length of the random string.
 * @returns A random hexadecimal string.
 */
export function generateRandomHexString(length: number): string {
    if (length <= 0) {
        throw new Error("Length must be a positive number.");
    }

    const hexChars = '0123456789abcdef';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * hexChars.length);
        result += hexChars[randomIndex];
    }

    return result;
}
