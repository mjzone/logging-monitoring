"use strict";
const logger = require("./logger");

const fib = (n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};

module.exports.generate = async (event) => {
  // Generate fibonacci number for the given number
  let result = 0;
  try {
    const number = parseInt(event.pathParameters.number);
    if (isNaN(number)) {
      let error = new Error("Invalid input");
      error.name = logger.types.CRITICAL;
      throw error;
    }
    if (number > 40) {
      let error = new Error("The API does not support numbers greater than 40");
      error.name = logger.types.LIMIT;
      throw error;
    } else {
      result = fib(number);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result })
    };
  } catch (error) {
    if (error.name === logger.types.CRITICAL) {
      logger.record(event, {
        type: logger.types.CRITICAL,
        message: error.message,
        callstack: error.stack
      });
    }
    if (error.name === logger.types.LIMIT) {
      logger.record(event, {
        type: logger.types.LIMIT,
        message: error.message,
        callstack: error.stack
      });
    }
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};
