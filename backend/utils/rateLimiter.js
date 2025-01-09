const rateLimits = {};

const runRateLimiter = (options) => {
  const { windowMs, maxRequests } = options;

  return (ip) => {
    const now = Date.now();

    // Initialize if IP not found
    if (!rateLimits[ip]) {
      rateLimits[ip] = { requests: 1, startTime: now };
      return { allowed: true };
    }

    const elapsedTime = now - rateLimits[ip].startTime;

    if (elapsedTime > windowMs) {
      // Reset the limit after the window
      rateLimits[ip] = { requests: 1, startTime: now };
      return { allowed: true };
    }

    if (rateLimits[ip].requests < maxRequests) {
      // Increment request count
      rateLimits[ip].requests += 1;
      return { allowed: true };
    }

    // Deny if limit exceeded
    return { allowed: false, message: 'Rate limit exceeded. Try again later.' };
  };
};

export default runRateLimiter;