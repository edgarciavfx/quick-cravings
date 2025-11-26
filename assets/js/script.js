// DOM Elements
const devUtil = document.querySelector('#dev');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const recipesContainer = document.querySelector('#recipes-container');
const detailsModalTitle = document.querySelector('#meal-details-title');
const detailsModalBody = document.querySelector('#meal-details-body');

// --- API Functions ---

// 1. Fetch list of recipes by ingredient
const fetchRecipes = async (ingredient) => {
    try {
        recipesContainer.innerHTML = '<p class="text-center text-muted">Searching for recipes...</p>';
        
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipesContainer.innerHTML = '<p class="text-center text-danger">Failed to fetch recipes. Please try again.</p>';
        return [];
    }
}

// 2. Fetch full details for a single meal ID
const fetchMealDetails = async (mealID) => {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error fetching meal details:', error);
        return null;
    }
}

// --- Display Functions ---

// Display meal cards on the main page
const displayRecipes = recipes => {
    recipesContainer.innerHTML = ''; // Clear previous results
    
    if (!recipes || recipes.length === 0) {
        recipesContainer.innerHTML = '<p class="text-center text-muted">No recipes found. Try another ingredient!</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = `
            <div class="card recipe-card h-100 border-0 shadow-sm">
              <img src="${recipe.strMealThumb}" class="card-img-top" alt="${recipe.strMeal}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${recipe.strMeal}</h5>
                <button 
                  type="button" 
                  class="btn btn-primary mt-auto view-recipe-btn"
                  data-bs-toggle="modal" 
                  data-bs-target="#detailsModal"
                  data-meal-id="${recipe.idMeal}"
                >
                  View Recipe
                </button>
              </div>
            </div>`;
        
        recipesContainer.innerHTML += recipeCard;
    });
};

// Display meal details in the modal
const displayMealDetails = (meal) => {
    if (!meal) {
        detailsModalTitle.textContent = 'Error';
        detailsModalBody.innerHTML = '<p class="text-danger">Could not load recipe details.</p>';
        return;
    }
    
    detailsModalTitle.textContent = meal.strMeal;

    // Extracting ingredients and measurements
    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
            ingredientsList += `<li class="list-group-item">${measure} - ${ingredient}</li>`;
        }
    }

    const modalContent = `
        <div class="row">
            <div class="col-md-5 mb-3 mb-md-0">
                <img src="${meal.strMealThumb}" class="img-fluid rounded shadow-sm mb-3" alt="${meal.strMeal}">
                
                <h4 class="mb-3">Ingredients</h4>
                <ul class="list-group mb-4">${ingredientsList}</ul>

                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger btn-sm">Watch Video Instructions (YouTube)</a>` : ''}
                </div>
            <div class="col-md-7">
                <h4 class="mb-3">Instructions</h4>
                <p>${meal.strInstructions.replace(/\r\n/g, '<br>')}</p>
                
                <h6 class="mt-4">Category: <span class="badge bg-secondary">${meal.strCategory}</span></h6>
                <h6 class="mt-2">Area: <span class="badge bg-info">${meal.strArea}</span></h6>
            </div>
        </div>
    `;

    detailsModalBody.innerHTML = modalContent;
}

// --- Event Listeners ---

// Event listener for form submission
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        const recipes = await fetchRecipes(query);
        displayRecipes(recipes);
    }
});

// Event delegation for "View Recipe" buttons
recipesContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('.view-recipe-btn');

    if (button) {
        const mealId = button.dataset.mealId;

        detailsModalTitle.textContent = 'Loading Recipe...';
        detailsModalBody.innerHTML = '<p class="text-center text-primary"><span class="spinner-border spinner-border-sm me-2" role="status"></span>Fetching details...</p>';

        const mealDetails = await fetchMealDetails(mealId);
        displayMealDetails(mealDetails);
    }
});