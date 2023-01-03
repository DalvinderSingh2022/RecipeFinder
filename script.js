const meals = document.querySelector(".meals");
const favContainer = document.querySelector(".fav-meals");
const mealPopup = document.querySelector(".popup-container");
const mealInfo = document.querySelector(".meal-info");
const searchInput = document.querySelector(".search-input");
const popupClose = document.querySelector(".close-popup");
const searchBtn = document.querySelector(".search");
const homeBtn = document.querySelector(".home");

getRandomMeal();
getRandomMeal();
getFavMeal();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const resdata = await resp.json();
    const randomMeal = resdata.meals[0];
    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    const resdata = await resp.json();
    const Meal = resdata.meals[0];
    return Meal;
}

async function getMealBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
    const respData = await resp.json();
    const Meals = respData.meals;
    return Meals;
}

function addMeal(mealdata, random = false) {
    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
    <div class="meal-header">
    ${random ? `<span class="random">Random Recipe</span>` : ""}
        <img 
            src="${mealdata.strMealThumb}"
            alt="${mealdata.strMeal}"
        />
    </div>
    <div class="meal-body">
        <h4>${mealdata.strMeal}</h4>
        <button class="fav-btn">
            <i class="fas fa-heart"></i>
        </button>
    </div>`;

    const heartBtn = meal.querySelector(".fav-btn");

    heartBtn.addEventListener("click", () => {
        if (heartBtn.classList.contains("active")) {
            removeMealFav(mealdata.idMeal);
            heartBtn.classList.remove("active");
        } else {
            addMealToFav(mealdata.idMeal);
            heartBtn.classList.add("active");
        }
        getFavMeal();
    });

    meal.querySelector("img").addEventListener("click", () => {
        showMealInfo(mealdata);
    });

    meals.appendChild(meal);
}

function addMealToFav(mealId) {
    const mealIds = getMealsFav();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFav(mealId) {
    const mealIds = getMealsFav();
    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

function getMealsFav() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
}

async function getFavMeal() {
    favContainer.innerHTML = "";
    const mealIds = getMealsFav();
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        const meal = await getMealById(mealId);

        addFavMeal(meal);
    }
}

function addFavMeal(mealdata) {
    const FavMeal = document.createElement("li");

    FavMeal.innerHTML = `
    <img 
        src="${mealdata.strMealThumb}"
        alt="${mealdata.strMeal}"
    />
    <span>${mealdata.strMeal}</span>
    <button class="clear"><i class="fas fa-times"></i></button>`;

    const clearBtn = FavMeal.querySelector(".clear");
    clearBtn.addEventListener("click", () => {
        removeMealFav(mealdata.idMeal);

        getFavMeal();
    });

    FavMeal.querySelector("img").addEventListener("click", () => {
        showMealInfo(mealdata);
    })

    favContainer.appendChild(FavMeal);
}

function showMealInfo(mealdata) {
    mealInfo.innerHTML = "";

    const mealEl = document.createElement("div");
    const ingredients = [];

    for (let i = 1; i < 20; i++) {
        if (mealdata["strIngredient" + i]) {
            ingredients.push(
                `${mealdata["strIngredient" + i]} - ${mealdata["strMeasure" + i]}`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
    <h1>${mealdata.strMeal}</h1>
    <div class="image fas" video-url="${mealdata.strYoutube}"><img 
        src="${mealdata.strMealThumb}"
        alt="${mealdata.strMeal}"
    /></div>
    <p>
        ${mealdata.strInstructions}
    </p>
    <h3>Ingredients</h3>
    <ul>
       ${ingredients.map((ing) => `
       <li>${ing}</li>`
    ).join("")}
    </ul>
    `;
    mealInfo.appendChild(mealEl);
    mealPopup.classList.remove("hidden");

    const VideoImage = document.querySelector(".image");
    VideoImage.addEventListener("click", (e) => {
        const videoUrl = e.target.getAttribute("video-url");
        window.location.href = videoUrl;
    });
}

searchBtn.addEventListener("click", async () => {
    meals.innerHTML = "";
    const search = searchInput.value;
    const Meals = await getMealBySearch(search);
    if (Meals) {
        Meals.forEach(meal => {
            addMeal(meal);
        })
    } else {
        meals.innerHTML += `<span>Can't find dish ${search}</span>`;
    }
});

homeBtn.addEventListener("click", () => {
    location.reload();
});

popupClose.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});

window.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        searchBtn.click();
    }
})