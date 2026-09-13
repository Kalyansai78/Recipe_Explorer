import {
    searchRecipes,
    getRecipeDetails,
    searchRecipesByCategory,
    getRandomRecipe,
    searchRecipesByCuisine,
    searchRecipesByIngredients
} from "./api.js";

import { supabase } from "./supabase.js";

const accountBtn = document.getElementById("accountBtn");
const accountMenu = document.getElementById("accountMenu");
const accountName = document.getElementById("accountName");
const accountEmail = document.getElementById("accountEmail");

const menuLogoutBtn = document.getElementById("menuLogoutBtn");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");

const authForm = document.getElementById("authForm");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authMessage = document.getElementById("authMessage");

const authSwitch = document.getElementById("authSwitch");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSubmit = document.getElementById("authSubmit");

const togglePassword = document.getElementById("togglePassword");
const passwordHint = document.getElementById("passwordHint");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const resultsDiv = document.getElementById("results");
const resultsSection = document.getElementById("resultsSection");
const resultsTitle = resultsSection.querySelector("h2");
const resultCount = document.getElementById("resultCount");

const loading = document.getElementById("loading");
const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const recipeModal = document.getElementById("recipeModal");
const recipeDetails = document.getElementById("recipeDetails");
const closeModal = document.getElementById("closeModal");

const popularButtons = document.querySelectorAll(".popular-btn");
const categoryButtons = document.querySelectorAll(".category-btn");
const surpriseBtn = document.getElementById("surpriseBtn");
const cuisineButtons = document.querySelectorAll(".cuisine-btn");

const ingredientInput = document.getElementById("ingredientInput");
const addIngredientBtn = document.getElementById("addIngredientBtn");
const ingredientChips = document.getElementById("ingredientChips");
const findRecipesBtn = document.getElementById("findRecipesBtn");

const searchHistoryContainer = document.getElementById("searchHistory");

const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const favoritesBtn = document.getElementById("favoritesBtn");

const themeToggle = document.getElementById("themeToggle");

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastMessage = document.getElementById("toastMessage");

let selectedIngredients = [];

let searchHistory = JSON.parse(
    localStorage.getItem("recipeExplorerHistory")
) || [];

let favorites = [];

let isFavoritesView = false;

let isSignUpMode = false;

// Scroll to results

function scrollToResults() {
    const resultsPosition =
        resultsSection.getBoundingClientRect().top +
        window.scrollY -
        20;

    window.scrollTo({
        top: resultsPosition,
        behavior: "smooth"
    });
}

accountBtn.addEventListener("click", async function () {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (session) {
        accountMenu.classList.toggle("hidden");
    } else {
        authModal.classList.remove("hidden");
    }
});

document.addEventListener("click", function (event) {
    if (
        !accountBtn.contains(event.target) &&
        !accountMenu.contains(event.target)
    ) {
        accountMenu.classList.add("hidden");
    }
});

closeAuthModal.addEventListener("click", function () {
    authModal.classList.add("hidden");
});

authModal.addEventListener("click", function (event) {
    if (event.target === authModal) {
        authModal.classList.add("hidden");
    }
});

authForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = authName.value.trim();
    const email = authEmail.value.trim();
    const password = authPassword.value;

    authMessage.textContent = "Please wait...";
    authMessage.className = "auth-message";

    // Sign Up

    if (isSignUpMode) {
        const { data, error } =
            await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        display_name: name
                    }
                }
            });

        if (error) {
            authMessage.textContent = error.message;
            authMessage.classList.add("error");
            return;
        }

        authMessage.textContent =
            "Account created! Please check your email to confirm your account.";
        
        showToast("Account created successfully", "🎉");

        authMessage.classList.add("success");

        authForm.reset();

        return;
    }

    // Login

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        authMessage.textContent = error.message;
        authMessage.classList.add("error");
        return;
    }

    showToast("Logged in successfully", "✅");

    authMessage.textContent =
        "Login successful!";

    authMessage.classList.add("success");

    authForm.reset();

    setTimeout(function () {
        authModal.classList.add("hidden");
    }, 800);
});

authSwitch.addEventListener("click", function () {
    isSignUpMode = !isSignUpMode;

    authMessage.textContent = "";

    if (isSignUpMode) {
        authTitle.textContent = "Create Account";

        authSubtitle.textContent =
            "Create an account to save and manage your favorite recipes.";

        authSubmit.textContent = "Sign Up";

        authSwitch.textContent =
            "Already have an account? Login";

        passwordHint.classList.remove("hidden");
    } else {
        authTitle.textContent = "Welcome Back";

        authSubtitle.textContent =
            "Login to save and manage your favorite recipes.";

        authSubmit.textContent = "Login";

        authSwitch.textContent =
            "Don't have an account? Sign Up";

        passwordHint.classList.add("hidden");
    }
});

togglePassword.addEventListener("click", function () {
    const eyeOpen =
        togglePassword.querySelector(".eye-open");

    const eyeClosed =
        togglePassword.querySelector(".eye-closed");

    if (authPassword.type === "password") {
        authPassword.type = "text";

        eyeOpen.classList.add("hidden");
        eyeClosed.classList.remove("hidden");

        togglePassword.setAttribute(
            "aria-label",
            "Hide password"
        );
    } else {
        authPassword.type = "password";

        eyeOpen.classList.remove("hidden");
        eyeClosed.classList.add("hidden");

        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );
    }
});

// Search form

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (query === "") {
        showMessage(
            "Search for a recipe",
            "Please enter a recipe name or ingredient."
        );
        return;
    }

    searchRecipesFromAPI(query);
});

// Popular search button

popularButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const query = button.dataset.search;

        searchInput.value = query;

        searchRecipesFromAPI(query);
    });
});

// Category search button

categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        if (button.classList.contains("active")) {
            button.classList.remove("active");
        } else {
            categoryButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            cuisineButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");
        }

        const category = button.dataset.category;
        searchCategory(category);
    });
});

// Cuisine search

cuisineButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        if (button.classList.contains("active")) {
            button.classList.remove("active");
        } else {
            cuisineButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            categoryButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");
        }

        const cuisine = button.dataset.cuisine;
        searchCuisine(cuisine);
    });
});

// Surprise me

surpriseBtn.addEventListener("click", async function () {

    exitFavoritesView();

    hideMessage();
    showLoading();

    try {

        const data = await getRandomRecipe();

        hideLoading();

        if (!data.recipes || data.recipes.length === 0) {
            showMessage(
                "No recipe found",
                "We couldn't find a random recipe. Please try again."
            );
            return;
        }

        const recipe = data.recipes[0];

        displayRecipeDetails(recipe);

        recipeModal.classList.remove("hidden");

    } catch (error) {

        hideLoading();

        console.error("Failed to get random recipe:", error);

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");

        showMessage(
            "Something went wrong",
            error.message
        );
    }

});

// Search recipes from API

async function searchRecipesFromAPI(query) {

    exitFavoritesView();

    hideMessage();
    showSkeletons();

    resultCount.textContent = "";

    try {
        const data = await searchRecipes(query);

        hideLoading();

        if (!data.results || data.results.length === 0) {
            showMessage(
                "No recipes found",
                `We couldn't find any recipes for "${query}". Try another search.`
            );
            return;
        }

        addToSearchHistory(
            `Search: ${query}`,
            "search",
            query
        );

        resultCount.textContent = `${data.results.length} recipes found`;

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");
        displayRecipes(data.results);

        scrollToResults();

    } catch (error) {
        hideLoading();

        console.error(error);

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");
        showMessage(
            "Something went wrong",
            error.message
        );
    }
}

// Render recipe cards

function displayRecipes(recipes) {
    recipes.forEach(function (recipe, index) {

        const card = document.createElement("article");

        card.className = "recipe-card";

        card.dataset.readyInMinutes = recipe.readyInMinutes || "";
        card.dataset.servings = recipe.servings || "";

        card.style.animationDelay = `${index * 0.08}s`;

        card.innerHTML = `
            <img
                src="${recipe.image}"
                alt="${escapeHTML(recipe.title)}"
            >

            <div class="recipe-card-content">

                <h3>${escapeHTML(recipe.title)}</h3>

                <div class="recipe-meta">

                    <span>
                        ⏱ ${recipe.readyInMinutes || "N/A"} min
                    </span>

                    <span>
                        👥 ${recipe.servings || "N/A"} servings
                    </span>

                </div>

                <div class="recipe-card-actions">
                    <button
                        class="view-recipe-button"
                        data-id="${recipe.id}"
                    >
                        View Recipe
                    </button>

                    <button
                        type="button"
                        class="favorite-button"
                        data-id="${recipe.id}"
                        aria-label="${
                            favorites.some(function (favorite) {
                                return favorite.id === recipe.id;
                            })
                                ? "Remove " + escapeHTML(recipe.title) + " from favorites"
                                : "Add " + escapeHTML(recipe.title) + " to favorites"
                        }"
                    >
                        ${
                            favorites.some(function (favorite) {
                                return favorite.id === recipe.id;
                            })
                                ? "♥"
                                : "♡"
                        }
                    </button>
                </div>

            </div>
        `;

        resultsDiv.appendChild(card);
    });
}

resultsDiv.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("view-recipe-button")) {
        return;
    }

    const recipeId = event.target.dataset.id;

    try {
        const recipe = await getRecipeDetails(recipeId);

        displayRecipeDetails(recipe);

        recipeModal.classList.remove("hidden");

    } catch (error) {
        console.error("Failed to get recipe details:", error);
    }

});

resultsDiv.addEventListener("click", async function (event) {
    if (!event.target.classList.contains("favorite-button")) {
        return;
    }

    const button = event.target;
    const recipeId = Number(button.dataset.id);

    const existingFavorite = favorites.find(function (recipe) {
        return recipe.id === recipeId;
    });

    if (existingFavorite) {
        const deleted = await deleteFavoriteFromSupabase(recipeId);

        if (!deleted) {
            return;
        }

        favorites = favorites.filter(function (recipe) {
            return recipe.id !== recipeId;
        });

        button.textContent = "♡";
        
        showToast("Removed from favorites", "♡");
    } else {
        const recipeCard = button.closest(".recipe-card");

        const recipe = {
            id: recipeId,
            title: recipeCard.querySelector("h3").textContent,
            image: recipeCard.querySelector("img").src,
            readyInMinutes: Number(recipeCard.dataset.readyInMinutes) || null,
            servings: Number(recipeCard.dataset.servings) || null
        };

        const saved = await saveFavoriteToSupabase(recipe);

        if (!saved) {
            authMessage.textContent = "Please login to save favorites.";
            authMessage.className = "auth-message error";

            authModal.classList.remove("hidden");

            return;
        }

        favorites.push(recipe);

        button.textContent = "♥";
        
        showToast("Added to favorites", "❤️");
    }

    updateFavoritesCount();

    if (isFavoritesView) {
        renderFavorites();
    }
});

// Show recipe details

function displayRecipeDetails(recipe) {

    const ingredients = recipe.extendedIngredients || [];

    const ingredientList = ingredients
        .map(function (ingredient) {
            return `<li>${escapeHTML(ingredient.original)}</li>`;
        })
        .join("");

    recipeDetails.innerHTML = `
        <img
            class="recipe-detail-image"
            src="${recipe.image}"
            alt="${escapeHTML(recipe.title)}"
        >

        <h2>${escapeHTML(recipe.title)}</h2>

        <div class="recipe-detail-meta">
            <span>⏱ ${recipe.readyInMinutes || "N/A"} min</span>
            <span>👥 ${recipe.servings || "N/A"} servings</span>
            <span>⭐ ${Math.round(recipe.spoonacularScore || 0)}%</span>
        </div>

        <h3>About this recipe</h3>

        <div class="recipe-summary">
            ${recipe.summary || "No summary available."}
        </div>

        <h3>Ingredients</h3>

        <ul class="ingredients-list">
            ${ingredientList}
        </ul>

        <h3>Instructions</h3>

        <div class="recipe-instructions">
            ${
                recipe.instructions ||
                "Instructions are not available for this recipe."
            }
        </div>
    `;
}

closeModal.addEventListener("click", function () {
    recipeModal.classList.add("hidden");
});

recipeModal.addEventListener("click", function (event) {

    if (event.target === recipeModal) {
        recipeModal.classList.add("hidden");
    }

});

async function searchCategory(category) {

    exitFavoritesView();

    hideMessage();
    showSkeletons();

    resultCount.textContent = "";

    try {

        const data = await searchRecipesByCategory(category);

        hideLoading();

        if (!data.results || data.results.length === 0) {

            showMessage(
                "No recipes found",
                `We couldn't find any recipes in the "${category}" category.`
            );

            return;
        }

        addToSearchHistory(
            `Category: ${category}`,
            "category",
            category
        );

        resultCount.textContent =
            `${data.results.length} ${category} recipes found`;

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");
        displayRecipes(data.results);

        scrollToResults();

    } catch (error) {

        hideLoading();

        console.error(error);

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");

        showMessage(
            "Something went wrong",
            error.message
        );
    }
}

async function searchCuisine(cuisine) {

    exitFavoritesView();

    hideMessage();
    showSkeletons();

    resultCount.textContent = "";

    try {

        const data = await searchRecipesByCuisine(cuisine);

        hideLoading();

        if (!data.results || data.results.length === 0) {

            showMessage(
                "No recipes found",
                `We couldn't find any ${cuisine} recipes.`
            );

            return;
        }

        addToSearchHistory(
            `Cuisine: ${cuisine}`,
            "cuisine",
            cuisine
        );

        resultCount.textContent =
            `${data.results.length} ${cuisine} recipes found`;

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");
        displayRecipes(data.results);

        scrollToResults();

    } catch (error) {

        hideLoading();

        console.error(error);

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");

        showMessage(
            "Something went wrong",
            error.message
        );
    }
}

addIngredientBtn.addEventListener("click", function () {

    addIngredient();

});

// Add ingredient

function addIngredient() {

    const ingredient = ingredientInput.value.trim().toLowerCase();

    if (ingredient === "") {
        return;
    }

    if (selectedIngredients.includes(ingredient)) {
        ingredientInput.value = "";
        return;
    }

    selectedIngredients.push(ingredient);

    renderIngredientChips();

    ingredientInput.value = "";
    ingredientInput.focus();

}

// Render ingredient chips

function renderIngredientChips() {

    ingredientChips.innerHTML = "";

    selectedIngredients.forEach(function (ingredient, index) {

        const chip = document.createElement("div");

        chip.className = "ingredient-chip";

        chip.innerHTML = `
            <span>${escapeHTML(ingredient)}</span>

            <button
                type="button"
                class="remove-ingredient"
                data-index="${index}"
                aria-label="Remove ${escapeHTML(ingredient)}"
            >
                ×
            </button>
        `;

        ingredientChips.appendChild(chip);
    });

}

ingredientChips.addEventListener("click", function (event) {

    if (!event.target.classList.contains("remove-ingredient")) {
        return;
    }

    const index = Number(event.target.dataset.index);

    selectedIngredients.splice(index, 1);

    renderIngredientChips();

});

ingredientInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        addIngredient();

    }

});

// Ingredient search

findRecipesBtn.addEventListener("click", async function () {

    exitFavoritesView();

    if (selectedIngredients.length === 0) {

        showMessage(
            "Add some ingredients",
            "Please add at least one ingredient before searching."
        );

        return;
    }

    hideMessage();
    showSkeletons();

    resultCount.textContent = "";

    try {

        const recipes =
            await searchRecipesByIngredients(selectedIngredients);

        hideLoading();

        if (!recipes || recipes.length === 0) {

            showMessage(
                "No recipes found",
                "We couldn't find recipes using those ingredients."
            );

            return;
        }

        addToSearchHistory(
            `Ingredients: ${selectedIngredients.join(", ")}`,
            "ingredients",
            [...selectedIngredients]
        );

        resultCount.textContent =
            `${recipes.length} recipes found`;
    
        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");
        displayRecipes(recipes);

        scrollToResults();

    } catch (error) {

        hideLoading();

        console.error("Ingredient search failed:", error);

        resultsDiv.innerHTML = "";
        resultsDiv.setAttribute("aria-busy", "false");

        showMessage(
            "Something went wrong",
            error.message
        );
    }

});

// Render search history

function renderSearchHistory() {

    searchHistoryContainer.innerHTML = "";

    if (searchHistory.length === 0) {

        searchHistoryContainer.innerHTML = `
            <span class="history-empty">
                No recent searches yet.
            </span>
        `;

        return;
    }

    searchHistory.forEach(function (item, index) {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "history-item";

        button.textContent = item.label;

        button.dataset.index = index;

        searchHistoryContainer.appendChild(button);

    });
}

// Save search history

function addToSearchHistory(label, type, value) {
    const newItem = {
        label: label,
        type: type,
        value: value
    };

    searchHistory = searchHistory.filter(function (item) {
        return JSON.stringify(item) !== JSON.stringify(newItem);
    });

    searchHistory.unshift(newItem);

    searchHistory = searchHistory.slice(0, 8);

    localStorage.setItem(
        "recipeExplorerHistory",
        JSON.stringify(searchHistory)
    );

    renderSearchHistory();
}

favoritesBtn.addEventListener("click", function () {
    hideMessage();

    if (isFavoritesView) {
        exitFavoritesView();

        resultsDiv.innerHTML = "";
        resultCount.textContent = "";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

    isFavoritesView = true;

    favoritesBtn.classList.add("active");
    favoritesBtn.firstChild.textContent = "♥ ";

    renderFavorites();

    scrollToResults();
});

function exitFavoritesView() {
    isFavoritesView = false;

    favoritesBtn.classList.remove("active");
    favoritesBtn.firstChild.textContent = "♡ ";

    resultsTitle.textContent = "Recipe Results";
}

function updateFavoritesCount() {
    favoritesCount.textContent = favorites.length;
}

// Render favorite recipes

function renderFavorites() {
    resultsDiv.innerHTML = "";
    resultCount.textContent = "";

    resultsTitle.textContent = "Your Favorites";

    if (favorites.length === 0) {
        showMessage(
            "No favorites yet",
            "Save your favorite recipes by clicking the ♡ button."
        );
        return;
    }

    resultCount.textContent =
        `${favorites.length} recipes`;

    displayRecipes(favorites);
}

searchHistoryContainer.addEventListener("click", function (event) {
    if (!event.target.classList.contains("history-item")) {
        return;
    }

    const index = Number(event.target.dataset.index);
    const item = searchHistory[index];

    if (!item) {
        return;
    }

    if (item.type === "search") {
        searchInput.value = item.value;
        searchRecipesFromAPI(item.value);
    }

    if (item.type === "category") {
        searchCategory(item.value);
    }

    if (item.type === "cuisine") {
        searchCuisine(item.value);
    }

    if (item.type === "ingredients") {
        selectedIngredients = [...item.value];

        renderIngredientChips();

        findRecipesBtn.click();
    }
});

clearHistoryBtn.addEventListener("click", function () {
    searchHistory = [];

    localStorage.removeItem("recipeExplorerHistory");

    renderSearchHistory();
});

// Loading

function showLoading() {
    loading.classList.remove("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

// Message

function showMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;

    message.classList.remove("hidden");
}

function hideMessage() {
    message.classList.add("hidden");
}

// HTML security

function escapeHTML(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

async function updateAccountButton() {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (session) {
        const user = session.user;

        const displayName =
            user.user_metadata?.display_name;

        accountName.textContent =
            displayName || "User";

        accountEmail.textContent =
            user.email || "";

        accountBtn.innerHTML = `
            👤
            <span>${escapeHTML(displayName || "Account")}</span>
        `;
    } else {
        accountBtn.innerHTML = `
            👤
            <span>Account</span>
        `;
    }
}

menuLogoutBtn.addEventListener("click", async function () {
    await logoutUser();
});

async function logoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        return;
    }

    showToast("Logged out successfully", "👋");

    accountMenu.classList.add("hidden");

    authModal.classList.add("hidden");

    accountBtn.innerHTML = `
        👤
        <span>Account</span>
    `;
}

// Load saved favorites

async function loadFavoritesFromSupabase() {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        return;
    }

    const user = session.user;

    const { data, error } = await supabase
        .from("favorites")
        .select(
            "id, recipe_id, title, image, ready_in_minutes, servings, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(
            "Failed to load favorites:",
            error
        );
        return;
    }

    favorites = data.map(function (favorite) {
        return {
            id: favorite.recipe_id,
            title: favorite.title,
            image: favorite.image,
            readyInMinutes: favorite.ready_in_minutes,
            servings: favorite.servings
        };
    });

    updateFavoritesCount();
}

async function loadFavorites() {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        favorites = [];
        updateFavoritesCount();

        return;
    }

    await loadFavoritesFromSupabase();
}

// Save favorite recipe

async function saveFavoriteToSupabase(recipe) {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        return false;
    }

    const { data, error } = await supabase
        .from("favorites")
        .insert({
            user_id: session.user.id,
            recipe_id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            ready_in_minutes: recipe.readyInMinutes,
            servings: recipe.servings
        })
        .select()
        .single();

    if (error) {
        console.error(
            "Failed to save favorite:",
            error
        );

        return false;
    }

    console.log(
        "Favorite saved to Supabase:",
        data
    );

    return true;
}

// Delete favorite recipe

async function deleteFavoriteFromSupabase(recipeId) {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        return false;
    }

    const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", session.user.id)
        .eq("recipe_id", recipeId);

    if (error) {
        console.error(
            "Failed to delete favorite:",
            error
        );

        return false;
    }

    return true;
}

// Load saved theme

const savedTheme = localStorage.getItem("recipeExplorerTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
    themeToggle.setAttribute("aria-label", "Switch to light mode");
    themeToggle.setAttribute("title", "Switch to light mode");
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️";
        themeToggle.setAttribute("aria-label", "Switch to light mode");
        themeToggle.setAttribute("title", "Switch to light mode");

        localStorage.setItem("recipeExplorerTheme", "dark");
    } else {
        themeToggle.textContent = "🌙";
        themeToggle.setAttribute("aria-label", "Switch to dark mode");
        themeToggle.setAttribute("title", "Switch to dark mode");

        localStorage.setItem("recipeExplorerTheme", "light");
    }
});

// Show loading skeletons

function showSkeletons() {
    resultsDiv.setAttribute("aria-busy", "true");
    resultsDiv.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        const skeletonCard = document.createElement("div");

        skeletonCard.className = "skeleton-card";

        skeletonCard.innerHTML = `
            <div class="skeleton-image"></div>

            <div class="skeleton-content">
                <div class="skeleton-line title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>

                <div class="skeleton-button"></div>
            </div>
        `;

        resultsDiv.appendChild(skeletonCard);
    }
}

// Show toast message

function showToast(message, icon = "✓") {
    toastMessage.textContent = message;
    toastIcon.textContent = icon;

    toast.classList.remove("hidden");

    setTimeout(function () {
        toast.classList.add("hidden");
    }, 2500);
}

// Sync auth state

supabase.auth.onAuthStateChange(function (event) {

    if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        loadFavorites();
        updateAccountButton();
    }
});

renderSearchHistory();
updateAccountButton();
loadFavorites();