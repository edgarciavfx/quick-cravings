// DOM 
const devUtil = document.querySelector('#dev');
const searchForm = document.querySelector('#search-form');
const ingredient = document.querySelector('#search-input');

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

// Event listener for form submission
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ingredientValue = ingredient.value;
    const recipes = await fetchRecipes(ingredientValue);
    // TODO: displayRecipes(recipes);
    const mealNames = recipes ? recipes.map(meal => meal.strMeal).join(', ') : 'No recipes found';
    devUtil.textContent = `${mealNames}`;

});