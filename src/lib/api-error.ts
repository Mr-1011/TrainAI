type ErrorDetail =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | ErrorDetail[];

const joinPath = (loc: unknown): string | undefined => {
  if (Array.isArray(loc)) {
    return loc
      .map((segment) => {
        if (typeof segment === "string" || typeof segment === "number") {
          return String(segment);
        }
        return undefined;
      })
      .filter(Boolean)
      .join(" → ");
  }

  if (typeof loc === "string" || typeof loc === "number") {
    return String(loc);
  }

  return undefined;
};

export const formatApiErrorDetail = (detail: ErrorDetail): string | undefined => {
  if (detail === null || detail === undefined) {
    return undefined;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof detail === "number" || typeof detail === "boolean") {
    return String(detail);
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return formatApiErrorDetail(entry);
        }

        const msg = "msg" in entry ? entry.msg : undefined;
        const loc = "loc" in entry ? entry.loc : undefined;

        if (typeof msg === "string") {
          const path = joinPath(loc);
          return path ? `${msg} (${path})` : msg;
        }

        return formatApiErrorDetail(entry as ErrorDetail);
      })
      .filter(Boolean);

    return messages.length > 0 ? messages.join("\n") : undefined;
  }

  if (typeof detail === "object") {
    if ("msg" in detail && typeof detail.msg === "string") {
      const path = joinPath(detail.loc);
      return path ? `${detail.msg} (${path})` : detail.msg;
    }

    if ("detail" in detail) {
      return formatApiErrorDetail(detail.detail as ErrorDetail);
    }

    try {
      return JSON.stringify(detail);
    } catch {
      return undefined;
    }
  }

  return undefined;
};

export const extractErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    if ("response" in error) {
      const maybeError = error as {
        response?: { data?: { detail?: ErrorDetail; message?: string } };
        message?: string;
      };

      const detailMessage = formatApiErrorDetail(maybeError.response?.data?.detail);
      if (detailMessage) {
        return detailMessage;
      }

      if (maybeError.response?.data?.message) {
        return maybeError.response.data.message;
      }

      if (maybeError.message) {
        return maybeError.message;
      }
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return undefined;
};

export type { ErrorDetail as ApiErrorDetail };
