#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const process = require("node:process");

const CUISINES = new Set([
  "italian",
  "chinese",
  "mexican",
  "indian",
  "american",
  "thai",
  "japanese",
  "mediterranean",
  "french",
  "korean",
  "vietnamese",
  "spanish",
  "greek",
  "turkish",
  "moroccan",
  "brazilian",
  "caribbean",
  "middle - eastern",
  "british",
  "german",
  "portuguese",
  "other",
]);

const CATEGORIES = new Set([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
]);

const RECIPE_FIELDS = new Set([
  "title",
  "cuisine",
  "category",
  "ingredients",
  "instructions",
  "imageUrl",
  "isPublic",
  "prepTime",
  "cookTime",
  "servings",
  "nutrition",
  "tips",
  "substitutions",
  "description",
]);

function usage() {
  console.log(`Usage:
  node backend/scripts/import-recipes.js --file backend/data/recipes.test.json --dry-run
  node backend/scripts/import-recipes.js --file backend/data/recipes.test.json --apply

Options:
  --file <path>   Local JSON file. Required.
  --dry-run       Validate and check duplicates without creating records.
  --apply         Create records. Never use against production for this test.
  --publish       Publish records after creation (requires --apply).
  --help          Show this help.

Environment:
  STRAPI_URL            Strapi base URL, for example http://localhost:1337.
  NEXT_PUBLIC_STRAPI_URL Fallback base URL for compatibility with the frontend.
  STRAPI_API_TOKEN      API token with recipe read/create permissions.
`);
}

// @ts-ignore
function parseArguments(argv) {
  const options = {
    apply: false,
    dryRun: false,
    publish: false,
    file: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help") {
      usage();
      process.exit(0);
    }

    if (argument === "--apply") {
      options.apply = true;
      continue;
    }

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--publish") {
      options.publish = true;
      continue;
    }

    if (argument === "--file") {
      options.file = argv[index + 1];
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!options.file) {
    throw new Error("--file is required");
  }

  if (options.apply && options.dryRun) {
    throw new Error("--apply and --dry-run cannot be used together");
  }

  if (options.publish && !options.apply) {
    throw new Error("--publish requires --apply");
  }

  if (!options.apply) {
    options.dryRun = true;
  }

  return options;
}

// @ts-ignore
function normalizeTitle(title) {
  return (
    title
      .trim()
      .split(" ")
      // @ts-ignore
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
}

// @ts-ignore
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// @ts-ignore
function validateInteger(value, field, errors) {
  if (!Number.isInteger(value)) {
    errors.push(`${field} must be an integer`);
  }
}

// @ts-ignore
function validateIngredients(value, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push("ingredients must be a non-empty array");
    return;
  }

  value.forEach((ingredient, index) => {
    if (!isPlainObject(ingredient)) {
      errors.push(`ingredients[${index}] must be an object`);
      return;
    }

    if (typeof ingredient.item !== "string" || !ingredient.item.trim()) {
      errors.push(`ingredients[${index}].item must be a non-empty string`);
    }

    if (typeof ingredient.amount !== "string" || !ingredient.amount.trim()) {
      errors.push(`ingredients[${index}].amount must be a non-empty string`);
    }
  });
}

// @ts-ignore
function validateInstructions(value, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push("instructions must be a non-empty array");
    return;
  }

  value.forEach((instruction, index) => {
    if (!isPlainObject(instruction)) {
      errors.push(`instructions[${index}] must be an object`);
      return;
    }

    validateInteger(instruction.step, `instructions[${index}].step`, errors);
    for (const field of ["title", "instruction"]) {
      if (
        typeof instruction[field] !== "string" ||
        !instruction[field].trim()
      ) {
        errors.push(
          `instructions[${index}].${field} must be a non-empty string`,
        );
      }
    }
  });
}

// @ts-ignore
function validateRecipe(input, index) {
  const errors = [];

  if (!isPlainObject(input)) {
    return { errors: [`recipe ${index + 1} must be an object`] };
  }

  for (const field of Object.keys(input)) {
    if (!RECIPE_FIELDS.has(field)) {
      errors.push(`unknown recipe field "${field}"`);
    }
  }

  if (typeof input.title !== "string" || !input.title.trim()) {
    errors.push("title must be a non-empty string");
  }

  if (input.cuisine !== undefined && !CUISINES.has(input.cuisine)) {
    errors.push(`cuisine must be one of: ${[...CUISINES].join(", ")}`);
  }

  if (input.category !== undefined && !CATEGORIES.has(input.category)) {
    errors.push(`category must be one of: ${[...CATEGORIES].join(", ")}`);
  }

  validateIngredients(input.ingredients, errors);
  validateInstructions(input.instructions, errors);

  if (input.imageUrl !== undefined && typeof input.imageUrl !== "string") {
    errors.push("imageUrl must be a string");
  }

  if (input.isPublic !== undefined && typeof input.isPublic !== "boolean") {
    errors.push("isPublic must be a boolean");
  }

  for (const field of ["prepTime", "cookTime", "servings"]) {
    if (input[field] !== undefined) {
      validateInteger(input[field], field, errors);
    }
  }

  if (
    input.description !== undefined &&
    typeof input.description !== "string"
  ) {
    errors.push("description must be a string");
  }

  for (const field of ["nutrition", "tips", "substitutions"]) {
    if (input[field] !== undefined && input[field] === null) {
      errors.push(`${field} must not be null when supplied`);
    }
  }

  return { errors };
}

// @ts-ignore
function mapRecipe(input) {
  const recipe = { ...input, title: normalizeTitle(input.title) };

  if (recipe.isPublic === undefined) {
    recipe.isPublic = false;
  }

  return recipe;
}

// @ts-ignore
async function readRecipes(file) {
  const filePath = path.resolve(process.cwd(), file);
  let content;

  try {
    content = await fs.readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(
      // @ts-ignore
      `Could not read recipe file "${filePath}": ${error.message}`,
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    // @ts-ignore
    throw new Error(`Recipe file is not valid JSON: ${error.message}`);
  }

  const recipes = Array.isArray(parsed) ? parsed : parsed?.recipes;
  if (!Array.isArray(recipes) || recipes.length === 0) {
    throw new Error(
      "Recipe JSON must be a non-empty array or an object with a non-empty recipes array",
    );
  }

  // @ts-ignore
  const validRecipes = [];
  // @ts-ignore
  const failures = [];

  recipes.forEach((recipe, index) => {
    const validation = validateRecipe(recipe, index);
    if (validation.errors.length > 0) {
      failures.push({
        index: index + 1,
        title: recipe?.title || "(unknown)",
        errors: validation.errors,
      });
      return;
    }

    validRecipes.push(mapRecipe(recipe));
  });

  // @ts-ignore
  return { failures, recipes: validRecipes };
}

function getConfiguration() {
  const baseUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
  const token = process.env.STRAPI_API_TOKEN;

  if (!baseUrl) {
    throw new Error("STRAPI_URL or NEXT_PUBLIC_STRAPI_URL must be set");
  }

  if (!token) {
    throw new Error("STRAPI_API_TOKEN must be set");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    token,
  };
}

function hasConfiguration() {
  return Boolean(
    (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL) &&
      process.env.STRAPI_API_TOKEN,
  );
}

// @ts-ignore
async function strapiRequest(configuration, pathname, options = {}) {
  const response = await fetch(`${configuration.baseUrl}${pathname}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${configuration.token}`,
      // @ts-ignore
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      // @ts-ignore
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let body = null;

  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch {
      body = responseText;
    }
  }

  if (!response.ok) {
    const details =
      typeof body === "string"
        ? body
        : body?.error?.message || body?.message || `HTTP ${response.status}`;
    throw new Error(
      // @ts-ignore
      `${options.method || "GET"} ${pathname} failed: ${details}`,
    );
  }

  return body;
}

// @ts-ignore
async function findExistingRecipe(configuration, title) {
  const query = new URLSearchParams({
    "filters[title][$eq]": title,
    "pagination[page]": "1",
    "pagination[pageSize]": "100",
  });
  const response = await strapiRequest(configuration, `/api/recipes?${query}`);
  const records = Array.isArray(response?.data) ? response.data : [];

  if (records.length > 1) {
    throw new Error(
      `Multiple recipes already use the normalized title "${title}"`,
    );
  }

  return records[0] || null;
}

// @ts-ignore
async function createRecipe(configuration, recipe) {
  return strapiRequest(configuration, "/api/recipes", {
    method: "POST",
    body: JSON.stringify({ data: recipe }),
  });
}

// @ts-ignore
async function publishRecipe(configuration, record) {
  const identifier = record?.documentId;
  if (!identifier) {
    throw new Error(
      "Created recipe response did not include documentId; cannot publish safely",
    );
  }

  return strapiRequest(
    configuration,
    `/api/recipes/${encodeURIComponent(identifier)}?status=published`,
    {
      method: "PUT",
      body: JSON.stringify({ data: {} }),
    },
  );
}

// @ts-ignore
function printValidationFailures(failures) {
  for (const failure of failures) {
    console.error(`Invalid recipe ${failure.index} (${failure.title}):`);
    for (const error of failure.errors) {
      console.error(`  - ${error}`);
    }
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const { failures, recipes } = await readRecipes(options.file);

  if (failures.length > 0) {
    printValidationFailures(failures);
  }

  if (recipes.length === 0) {
    throw new Error("No valid recipes remain after validation");
  }

  const configuration = hasConfiguration() ? getConfiguration() : null;
  console.log("STRAPI_URL:", process.env.STRAPI_URL);
  console.log("API token loaded:", Boolean(process.env.STRAPI_API_TOKEN));
  console.log("Strapi configuration loaded:", Boolean(configuration));
  if (!configuration && !options.dryRun) {
    throw new Error(
      "STRAPI_URL or NEXT_PUBLIC_STRAPI_URL and STRAPI_API_TOKEN are required for apply mode",
    );
  }

  if (!configuration) {
    console.log(
      "No Strapi configuration supplied; skipping remote duplicate checks.",
    );
  }
  const summary = {
    created: 0,
    duplicates: 0,
    failed: failures.length,
    mode: options.dryRun ? "dry-run" : "apply",
    published: 0,
  };

  for (const recipe of recipes) {
    try {
      const existing = configuration
        ? await findExistingRecipe(configuration, recipe.title)
        : null;
      if (existing) {
        summary.duplicates += 1;
        console.log(
          `SKIP duplicate: ${recipe.title} (id ${existing.id || "unknown"})`,
        );
        continue;
      }

      if (options.dryRun) {
        console.log(`WOULD CREATE: ${recipe.title}`);
        continue;
      }

      const created = await createRecipe(configuration, recipe);
      const createdRecord = created?.data;
      if (!createdRecord) {
        throw new Error("Strapi create response did not contain data");
      }

      summary.created += 1;
      console.log(
        `CREATED: ${recipe.title} (id ${createdRecord.id || "unknown"})`,
      );

      if (options.publish) {
        await publishRecipe(configuration, createdRecord);
        summary.published += 1;
        console.log(`PUBLISHED: ${recipe.title}`);
      }
    } catch (error) {
      summary.failed += 1;
      // @ts-ignore
      console.error(`FAILED: ${recipe.title}: ${error.message}`);
    }
  }

  console.log("\nImport summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Importer failed: ${error.message}`);
  process.exitCode = 1;
});
