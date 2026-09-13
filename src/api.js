const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

const BASE_URL = "https://api.spoonacular.com/recipes";


// Search recipes

export async function searchRecipes(query) {
    const url = new URL(`${BASE_URL}/complexSearch`);

    url.searchParams.set("apiKey", API_KEY);
    url.searchParams.set("query", query);
    url.searchParams.set("number", "12");
    url.searchParams.set("addRecipeInformation", "true");
    url.searchParams.set("fillIngredients", "true");

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid Spoonacular API key.");
        }

        if (response.status === 402) {
            throw new Error(
                "Spoonacular API quota has been exceeded."
            );
        }

        throw new Error(
            `Spoonacular request failed (${response.status}).`
        );
    }

    return await response.json();
}

// Get recipe details

export async function getRecipeDetails(recipeId) {
    const url = new URL(`${BASE_URL}/${recipeId}/information`);

    url.searchParams.set("apiKey", API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid Spoonacular API key.");
        }

        if (response.status === 402) {
            throw new Error("Spoonacular API quota has been exceeded.");
        }

        throw new Error(`Recipe details request failed (${response.status}).`);
    }

    return await response.json();
}

// Search by category

export async function searchRecipesByCategory(category) {
    const url = new URL(`${BASE_URL}/complexSearch`);

    url.searchParams.set("apiKey", API_KEY);
    url.searchParams.set("type", category);
    url.searchParams.set("number", "12");
    url.searchParams.set("addRecipeInformation", "true");
    url.searchParams.set("fillIngredients", "true");

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid Spoonacular API key.");
        }

        if (response.status === 402) {
            throw new Error("Spoonacular API quota has been exceeded.");
        }

        throw new Error(`Category request failed (${response.status}).`);
    }

    return await response.json();
}

// Get random recipe

export async function getRandomRecipe() {
    const url = new URL(`${BASE_URL}/random`);

    url.searchParams.set("apiKey", API_KEY);
    url.searchParams.set("number", "1");

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid Spoonacular API key.");
        }

        if (response.status === 402) {
            throw new Error("Spoonacular API quota has been exceeded.");
        }

        throw new Error(`Random recipe request failed (${response.status}).`);
    }

    return await response.json();
}

// Search by cuisine

export async function searchRecipesByCuisine(cuisine) {
    const url = new URL(`${BASE_URL}/complexSearch`);

    url.searchParams.set("apiKey", API_KEY);
    url.searchParams.set("cuisine", cuisine);
    url.searchParams.set("number", "12");
    url.searchParams.set("addRecipeInformation", "true");
    url.searchParams.set("fillIngredients", "true");

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid Spoonacular API key.");
        }

        if (response.status === 402) {
            throw new Error("Spoonacular API quota has been exceeded.");
        }

        throw new Error(`Cuisine request failed (${response.status}).`);
    }

    return await response.json();
}

// Search by ingredients

export async function searchRecipesByIngredients(ingredients) {
    const url = new URL(`${BASE_URL}/findByIngredients`);

    url.searchParams.set("apiKey", API_KEY);
    url.searchParams.set("ingredients", ingredients.join(","));
    url.searchParams.set("number", "12");
    url.searchParams.set("ranking", "1");
    url.searchParams.set("ignorePantry", "true");

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid Spoonacular API key.");
        }

        if (response.status === 402) {
            throw new Error("Spoonacular API quota has been exceeded.");
        }

        throw new Error(
            `Ingredient search request failed (${response.status}).`
        );
    }

    return await response.json();
}