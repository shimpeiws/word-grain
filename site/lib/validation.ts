import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

let ajvInstance: Ajv2020 | null = null;

function getAjv(): Ajv2020 {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validate(
  schema: Record<string, unknown>,
  data: unknown
): ValidationResult {
  const ajv = getAjv();
  const valid = ajv.validate(schema, data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = (ajv.errors ?? []).map((err) => ({
    path: err.instancePath || "/",
    message: err.message ?? "Unknown error",
  }));

  return { valid: false, errors };
}
