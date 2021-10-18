"use strict";

const fib = (n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};

module.exports.generate = async (event) => {
  // Generate fibonacci number for the given number
  let result = 0;
  const number = parseInt(event.pathParameters.number);
  if (number) {
    result = fib(number);
  }

  // throw new Error("Some error occured");

  return {
    statusCode: 200,
    body: JSON.stringify({ result })
  };
};
