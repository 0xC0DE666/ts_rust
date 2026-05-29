// examples/advanced-pipeline.ts
// Realistic async HTTP + safe parsing pipeline using Result + Option.
//
// This demonstrates a common real-world pattern:
// 1. Perform an async operation that can fail → asyncTryCatch
// 2. Safely extract/validate fields from untrusted JSON → Option
// 3. Build a clean, typed domain object or fail gracefully

import { asyncTryCatch, none, Ok, Option, some, tryCatch } from "../mod.ts";

interface GitHubUser {
	login: string;
	name: string | null;
	company: string | null;
	bio: string | null;
	public_repos: number;
	followers: number;
}

// Helper: safely turn an unknown value into Option<string>
function safeString(value: unknown): Option<string> {
	return typeof value === "string" && value.trim().length > 0
		? some(value.trim())
		: none();
}

// Helper: safely turn unknown into Option<number>
function safeNumber(value: unknown): Option<number> {
	return typeof value === "number" && Number.isFinite(value)
		? some(value)
		: none();
}

async function fetchGitHubUser(username: string) {
	return await asyncTryCatch(async () => {
		const res = await fetch(`https://api.github.com/users/${username}`, {
			headers: { "User-Agent": "ts-rust-example" },
		});

		if (!res.ok) {
			throw new Error(`GitHub API returned ${res.status}`);
		}

		return await res.json();
	});
}

async function buildUserProfile(username: string) {
	const fetchResult = await fetchGitHubUser(username);

	if (fetchResult.isErr()) {
		return fetchResult; // propagate the network/HTTP error as Result
	}

	const raw = fetchResult.unwrap();

	// Defensive parsing with Option — never trust external data blindly
	const login = safeString(raw.login).unwrapOr(username);
	const displayName = safeString(raw.name).unwrapOr(login);
	const company = safeString(raw.company).unwrapOr(
		"Independent / Open Source",
	);
	const bio = safeString(raw.bio).unwrapOr("No bio available");
	const publicRepos = safeNumber(raw.public_repos).unwrapOr(0);
	const followers = safeNumber(raw.followers).unwrapOr(0);

	const profile = {
		login,
		displayName,
		company,
		bio,
		publicRepos,
		followers,
		// You could continue transforming here with more Result/Option logic
	};

	return new Ok(profile);
}

async function main() {
	console.log(
		"=== Advanced Example: Async HTTP + Safe Parsing Pipeline ===\n",
	);

	const profileResult = await buildUserProfile("denoland");

	if (profileResult.isOk()) {
		const profile = profileResult.unwrap();
		console.log("✅ Successfully fetched and parsed GitHub profile:\n");
		console.log(JSON.stringify(profile, null, 2));
	} else {
		console.error("❌ Failed to load profile:");
		console.error(profileResult.unwrapErr());
	}

	// Bonus: show that tryCatch also works for sync validation
	const validation = tryCatch(() => {
		if (Math.random() > 0.9) throw new Error("Random validation failure");
		return "Validation passed";
	});

	console.log("\n--- Sync validation demo ---");
	if (validation.isOk()) {
		console.log("Validation result:", validation.unwrap());
	} else {
		console.log(
			"Validation failed (as expected sometimes):",
			validation.unwrapErr(),
		);
	}
}

if (import.meta.main) {
	await main();
}
