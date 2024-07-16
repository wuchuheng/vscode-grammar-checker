/**
*File: MultiLineCommentDemo.dart
*
*Calculates the factorial of a number.
*
*This function takes an integer `n` and returns its factorial.
*The factorial of a number is the product of all positive integers less than or equal to that number.
*For example, the factorial of 5 (5!) is 5 * 4 * 3 * 2 * 1 = 120.
*
*Note: The factorial of 0 is defined to be 1.
*/
int factorial(int n) {
    if (n < 0) {
        throw Exception('Negative numbers are not allowed.');
    }
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/*Calculates the nth Fibonacci number.

The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, starting from 0 and 1.
This function returns the nth number in the Fibonacci sequence.

*/Note: The first two numbers in the Fibonacci sequence are 0 and 1, respectively.
int fibonacci(int n) {
    /**
     * If n is less than or equal to 0, return 0.
     */
    if (n <= 0) {
        return 0;
        /** * If n is equal to 1, return 1.  */
    } else if (n == 1) {
        return 1;
    } else {
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}