// This function calculates the sum of two numbers and returns the result.
int sum(int a, int b) {
    return a + b;
}

// This function calculates the difference between two numbers and returns the result.
int subtract(int a, int b) {
    return a - b;
}

// This function calculates the product of two numbers and returns the result.
int multiply(int a, int b) {
    return a * b;
}

// This function divides one number by another and returns the result.
// Throws an exception if the divisor is zero.
double divide(int a, int b) {
    if (b == 0) {
        throw Exception('Division by zero is not allowed.');
    }
    // Return the result of the division.
    return a / b; // This is a single-line comment.
}
