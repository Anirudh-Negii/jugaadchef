# Recipe importer

`import-recipes.js` is a standalone, REST-only importer for the Strapi 5.51.2 recipe collection. It uses Node.js built-in `fetch`; no dependency or PostgreSQL connection is required.

## Input and validation

The importer accepts either a JSON array or an object containing a `recipes` array. It validates the checked-in recipe schema fields:

- Required fields: `title`, non-empty `ingredients`, and non-empty `instructions`. `isPublic` is a boolean when supplied and defaults to the schema's `false` value when omitted.
- Optional schema fields: `cuisine`, `category`, `imageUrl`, `prepTime`, `cookTime`, `servings`, `nutrition`, `tips`, `substitutions`, and `description`.
- Unknown fields are rejected.
- Cuisine and category values must match the recipe schema exactly. In particular, the schema value is `middle - eastern`.
- Ingredient and instruction objects are checked against the shapes used by the frontend recipe detail page.
- Titles are normalized using the same title-casing algorithm as `frontend/actions/recipe.actions.js`.

The test fixture is [../data/recipes.test.json](../data/recipes.test.json). It contains exactly one recipe and is not intended for production.

## Environment

Set these variables in the shell running the importer:

```powershell
$env:STRAPI_URL = "http://localhost:1337"
$env:STRAPI_API_TOKEN = "<token for the safe test Strapi instance>"
```

`NEXT_PUBLIC_STRAPI_URL` is accepted as a fallback for the base URL, but `STRAPI_URL` is preferred for an importer. Never commit or print the token.

The token needs permission to find recipes for duplicate checks. An apply run additionally needs recipe create permission. A publish run needs the deployed Strapi permission required to update/publish recipes.

## Dry run

Dry run is the default unless `--apply` is supplied. It validates the local file, queries Strapi for exact title duplicates, and does not create or update records:

```powershell
node backend\scripts\import-recipes.js --file backend\data\recipes.test.json --dry-run
```

With Strapi environment variables configured, expected behavior against a reachable safe test instance is one `WOULD CREATE` line when the normalized title does not exist, or one `SKIP duplicate` line when it already exists. Without Strapi environment variables, dry run still validates the local file and reports `WOULD CREATE`, but cannot perform duplicate checks. Apply mode always requires a safe Strapi URL and API token.

## Single-record test against a safe database

1. Use a disposable/local PostgreSQL-backed Strapi instance running the checked-in Strapi version.
2. Confirm the URL is not production and use a test-only API token.
3. Run the dry run first.
4. If the dry run is correct, create and publish the one fixture record:

```powershell
node backend\scripts\import-recipes.js --file backend\data\recipes.test.json --apply --publish
```

The importer creates through `POST /api/recipes` with the Strapi REST `{ "data": ... }` envelope. With `--publish`, it requires Strapi 5 to return a `documentId`, then publishes through the document endpoint using `status=published`. It does not create users, authors, saved recipes, or pantry records.

Run the same command again to verify idempotency: the normalized title `Test Masala Pasta` should be reported as a duplicate and no second record should be created. Do not use `--apply` or `--publish` against production as part of this initial test.

## Duplicate strategy and failures

Duplicates are identified by an exact Strapi title filter after applying the same normalization used by the frontend (`test masala pasta` becomes `Test Masala Pasta`). The schema does not make `title` unique, so this is an application-level pre-check rather than a database guarantee. Multiple existing matches are treated as an error.

Invalid records and per-record HTTP errors are reported individually. The process exits non-zero when validation or import failures occur. A successful create is not rolled back if a later record fails; use the one-record fixture for this first test.
