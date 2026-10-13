import { body, validationResult } from "express-validator";

const ALLOWED_CATEGORIES = [
  "childhood",
  "school-days",
  "friendship",
  "first-love",
  "old-technology",
  "festivals",
  "village-life",
  "internet-era",
  "36-july-memories",
  "other-memories"
];

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Invalid request data",
      errors: errors.array()
    });
  }
  next();
}

export const createMemoryValidator = [
  body("title")
    .isString()
    .trim()
    .notEmpty().withMessage("Memory title is required")
    .isLength({ max: 120 }).withMessage("Title cannot exceed 120 characters"),

  body("story")
    .isString()
    .trim()
    .notEmpty().withMessage("Memory story is required")
    .isLength({ max: 10000 }).withMessage("Story cannot exceed 10000 characters"),

  body("category")
    .isIn(ALLOWED_CATEGORIES).withMessage("Invalid category"),

  body("memoryYear")
    .optional({ nullable: true })
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Invalid memory year"),

  body("location")
    .optional()
    .isString().trim()
    .isLength({ max: 150 }).withMessage("Location max 150 characters"),

  body("images")
    .optional()
    .isArray().withMessage("Images must be an array")
    .custom((images) => {
      if (images.length > 5) {
        throw new Error("You can upload a maximum of 5 images per memory");
      }
      return true;
    }),

  body("images.*.url")
    .optional()
    .isURL().withMessage("Invalid image URL format"),

  body("images.*.assetId")
    .optional()
    .isString().withMessage("Asset ID must be a string"),

  validateRequest
];