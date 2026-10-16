# JugaadChef — Import Recipes into Strapi

This guide explains how to run the recipe importer from the VS Code PowerShell terminal.

> **Security:** Never commit API tokens, database passwords, or other secrets to Git. If a token or password is exposed in a screenshot, chat, or repository, revoke/rotate it before continuing.

## 1. Open the backend folder

Open the terminal in VS Code and move into the `backend` directory from the project root:

```powershell
cd backend
```

## 2. Set the Strapi URL

For the **production** Strapi backend:

```powershell
$env:STRAPI_URL = "https://jugaadchef.onrender.com"
```

For a **local** Strapi instance instead, use:

```powershell
$env:STRAPI_URL = "http://localhost:1337"
```

Use only the URL for the environment where you intend to import recipes.

## 3. Set the API token

Replace the placeholder with your own newly generated API token:

```powershell
$env:STRAPI_API_TOKEN = "PASTE_YOUR_API_TOKEN_HERE"
```

- For production imports, use a token created in the **production Strapi** admin.
- For local imports, use a token created in the **local Strapi** admin.
- These commands set environment variables only for the current PowerShell terminal session.

## 4. Verify the settings

Display the target URL:

```powershell
$env:STRAPI_URL
```

Check that a token is set without printing its secret value:

```powershell
if ($env:STRAPI_API_TOKEN) { "Token is set" } else { "Token is missing" }
```

Make sure the URL is the intended target before continuing.

## 5. Check the JSON filename

List JSON files in the backend `data` folder:

```powershell
Get-ChildItem data\*.json
```

Example file used in this workflow: `recipes.test.json`.

## 6. Run a dry run first

From the `backend` directory, preview the import:

```powershell
node scripts/import-recipes.js --file data/recipes.test.json --dry-run
```

Replace `recipes.test.json` with the exact filename you want to import.

Review the output. A dry run is a preview; it does not guarantee every remote duplicate check or API operation will work correctly.

## 7. Apply the import

Only after reviewing the dry-run output and confirming the target URL and JSON file, run:

```powershell
node scripts/import-recipes.js --file data/recipes.test.json --apply
```

**This writes to the database selected by `STRAPI_URL`.** If the URL is production, it changes the live database.

## 8. If you open a new terminal

PowerShell environment variables are session-specific. In a new terminal, repeat Steps 2 and 3, then verify the settings before running the script.

## Quick copy-paste sequence

Run these from the `backend` directory. Replace the token placeholder with your own token:

```powershell
$env:STRAPI_URL = "https://jugaadchef.onrender.com"
$env:STRAPI_API_TOKEN = "PASTE_YOUR_API_TOKEN_HERE"

$env:STRAPI_URL
if ($env:STRAPI_API_TOKEN) { "Token is set" } else { "Token is missing" }

Get-ChildItem data\*.json
node scripts/import-recipes.js --file data/recipes.test.json --dry-run
# If the dry run looks correct, run this separately:
node scripts/import-recipes.js --file data/recipes.test.json --apply
```

## Troubleshooting checklist

- **Wrong target:** Check `$env:STRAPI_URL` before using `--apply`.
- **Token missing:** Set `$env:STRAPI_API_TOKEN` again in the current terminal.
- **File not found:** Run `Get-ChildItem data\*.json` and copy the exact filename into the command.
- **Unauthorized/forbidden:** Confirm the token belongs to the same Strapi environment as the URL and has the required permissions.
- **Unexpected duplicate recipes:** Do not assume the importer prevents duplicates; verify records in Strapi Content Manager after import.
