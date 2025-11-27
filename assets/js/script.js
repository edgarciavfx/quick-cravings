// =======================================================
//  DOM ELEMENTS
// =======================================================
const devUtil = document.querySelector('#dev');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const recipesContainer = document.querySelector('#recipes-container');
const detailsModalTitle = document.querySelector('#meal-details-title');
const detailsModalBody = document.querySelector('#meal-details-body');
const favoritesSection = document.querySelector('#favorites-section');



// =======================================================
//  FAVORITES MANAGEMENT
// =======================================================

/** Load favorites from localStorage. */
const loadFavorites = () => {
    try {
        return JSON.parse(localStorage.getItem('favorite-meals')) || [];
    } catch (e) {
        console.error("Could not parse favorites", e);
        return [];
    }
};

/** Save favorites list and update sidebar. */
const saveFavorites = (favorites) => {
    localStorage.setItem('favorite-meals', JSON.stringify(favorites));
    renderFavoritesSidebar();
};

/** Add or remove a favorite meal. */
const toggleFavorite = (mealID, mealName) => {
    const favorites = loadFavorites();
    const index = favorites.findIndex(fav => fav.id === mealID);

    if (index === -1) {
        favorites.push({ id: mealID, name: mealName });
    } else {
        favorites.splice(index, 1);
    }

    saveFavorites(favorites);
};

/** Render the favorites sidebar. */
const renderFavoritesSidebar = () => {
    const favorites = loadFavorites();
    if (!favoritesSection) return;

    favoritesSection.innerHTML = '';

    if (favorites.length === 0) {
        favoritesSection.innerHTML =
            '<p class="text-muted small mb-0">No favorites yet. Double-click an image to save it!</p>';
        return;
    }

    favorites.forEach(meal => {
        favoritesSection.innerHTML += `
            <button 
                class="btn btn-outline-secondary btn-sm text-start favorite-meal-btn"
                data-meal-id="${meal.id}">
                ${meal.name}
            </button>`;
    });
};

// Initialize sidebar
document.addEventListener('DOMContentLoaded', renderFavoritesSidebar);



// =======================================================
//  API FUNCTIONS
// =======================================================

/** Fetch recipes by ingredient. */
const fetchRecipes = async (ingredient) => {
    try {
        recipesContainer.innerHTML =
            '<p class="text-center text-muted">Searching for recipes...</p>';

        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
        );
        const data = await response.json();
        return data.meals;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipesContainer.innerHTML =
            '<p class="text-center text-danger">Failed to fetch recipes. Please try again.</p>';
        return [];
    }
};

/** Fetch full details for a single meal. */
const fetchMealDetails = async (mealID) => {
    try {
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`
        );
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error fetching meal details:', error);
        return null;
    }
};



// =======================================================
//  DISPLAY FUNCTIONS
// =======================================================

/** Render recipe cards in the grid. */
const displayRecipes = (recipes) => {
    recipesContainer.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        recipesContainer.innerHTML =
            '<p class="text-center text-muted">No recipes found. Try another ingredient!</p>';
        return;
    }

    recipes.forEach(recipe => {
        recipesContainer.innerHTML += `
            <div class="card recipe-card h-100 border-0 shadow-sm">

                <img 
                    src="${recipe.strMealThumb}"
                    class="card-img-top dbl-click-favorite"
                    alt="${recipe.strMeal}"
                    data-meal-name="${recipe.strMeal}"
                    data-meal-id="${recipe.idMeal}"
                >

                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${recipe.strMeal}</h5>

                    <button 
                        class="btn btn-primary mt-auto view-recipe-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#detailsModal"
                        data-meal-id="${recipe.idMeal}"
                    >
                        View Recipe
                    </button>
                </div>

            </div>`;
    });
};

/** Render the recipe details modal. */
const displayMealDetails = (meal) => {
    if (!meal) {
        detailsModalTitle.textContent = 'Error';
        detailsModalBody.innerHTML =
            '<p class="text-danger">Could not load recipe details.</p>';
        return;
    }

    detailsModalTitle.textContent = meal.strMeal;

    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ing && ing.trim() !== '') {
            ingredientsList += `
                <li class="list-group-item">
                    ${measure} - ${ing}
                </li>`;
        }
    }

    detailsModalBody.innerHTML = `
        <div class="row">
            <div class="col-md-5 mb-3 mb-md-0">

                <img 
                    src="${meal.strMealThumb}"
                    class="img-fluid rounded shadow-sm mb-3 dbl-click-favorite"
                    alt="${meal.strMeal}"
                    data-meal-name="${meal.strMeal}"
                    data-meal-id="${meal.idMeal}"
                >

                <h4>Ingredients</h4>
                <ul class="list-group mb-4">${ingredientsList}</ul>

                ${
                    meal.strYoutube
                        ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger btn-sm">
                               Watch Video Instructions
                           </a>`
                        : ''
                }
            </div>

            <div class="col-md-7">
                <h4>Instructions</h4>
                <p>${meal.strInstructions.replace(/\r\n/g, '<br>')}</p>

                <h6 class="mt-4">Category: 
                    <span class="badge bg-secondary">${meal.strCategory}</span>
                </h6>

                <h6 class="mt-2">Area: 
                    <span class="badge bg-info">${meal.strArea}</span>
                </h6>
            </div>
        </div>`;
};



// =======================================================
//  EVENT LISTENERS
// =======================================================

/** Handle ingredient search form submission. */
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();

    if (query) {
        const recipes = await fetchRecipes(query);
        displayRecipes(recipes);
    }
});

/** Handle clicking the "View Recipe" button. */
recipesContainer.addEventListener('click', async (event) => {
    const btn = event.target.closest('.view-recipe-btn');
    if (btn) await handleViewRecipe(btn.dataset.mealId);
});

/** Handle clicking favorite items in the sidebar. */
favoritesSection.addEventListener('click', async (event) => {
    const btn = event.target.closest('.favorite-meal-btn');
    if (!btn) return;

    await handleViewRecipe(btn.dataset.mealId);

    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
});

/** Handle double-clicking images to toggle favorites. */
document.body.addEventListener('dblclick', (event) => {
    const img = event.target.closest('.dbl-click-favorite');
    if (img) toggleFavorite(img.dataset.mealId, img.dataset.mealName);
});



// =======================================================
//  HELPERS
// =======================================================

/** Fetch meal details and render modal. */
const handleViewRecipe = async (mealId) => {
    detailsModalTitle.textContent = 'Loading Recipe...';
    detailsModalBody.innerHTML =
        '<p class="text-center text-primary"><span class="spinner-border spinner-border-sm me-2"></span>Fetching details...</p>';

    const mealDetails = await fetchMealDetails(mealId);
    displayMealDetails(mealDetails);
};
