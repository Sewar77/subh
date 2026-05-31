const formatError = (error) => {
  // Joi / validation
  if (error.name === "ValidationError") {
    return error.details.map((d) => d.message).join(", ");
  }

  // Postgres duplicate key
  if (error.code === "23505") {
    return "This value already exists. Please choose another one.";
  }

  // Postgres invalid input
  if (error.code === "22P02") {
    return "Invalid data format provided.";
  }

  // Default safe message
  return "Something went wrong. Please try again.";
};

export default formatError;
