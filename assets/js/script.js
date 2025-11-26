// DOM 
const devUtil = document.querySelector('#dev');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const recipesContainer = document.querySelector('#recipes-container');

// Async function to fetch recipes based on an ingredient
const fetchRecipes = async (ingredient) => {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

const displayRecipes = recipes => {
    recipesContainer.innerHTML = ''; // Clear previous results
    
    recipes.forEach(recipe => {
        const recipeCard = `
    <div class="card h-100 shadow-sm">
        <img src="${recipe.strMealThumb}" class="card-img-top w-100" alt="${recipe.strMeal}">
        <div class="card-body">
            <h5 class="card-title">${recipe.strMeal}</h5>
            <a href="#" class="btn btn-primary">View Recipe</a>
        </div>
    </div>`;
        
        recipesContainer.innerHTML += recipeCard;
    });
};

// Event listener for form submission
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = searchInput.value;
    const recipes = await fetchRecipes(query);
    displayRecipes(recipes);
});