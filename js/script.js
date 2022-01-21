// ------------------------variables ------------------------------------

const levelHTML = document.querySelector(".level");
const livesHTML = document.querySelector(".lives");
const targetImage = document.querySelector(".card-to-guess-img");
const animalDisclaimer = document.querySelector(".animal-disclaimer");
const animalP = document.querySelector(".animal-prize");
const fruitP = document.querySelector(".fruit-prize");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const highestScore = document.querySelector(".highest-score");
const nextBtn = document.querySelector(".next-level-btn");
const TryAgainBtn = document.querySelector(".try-again-btn");
const continueBtn = document.querySelector(".continue-btn");
const lobby = document.querySelector(".lobby");
const playTable = document.querySelector("play-table");
const childArena = document.querySelector(".arena-child-play");
const easyArena = document.querySelector(".arena-easy");
const mediumArena = document.querySelector(".arena-medium");
const legendArena = document.querySelector(".arena-legend-play");
const emoji = document.querySelector(".emoji-reveal img");
let flipDelay;
const introAnim = gsap
  .timeline({ defaults: { duration: 1, ease: "pow-1" } })
  .from(".lobby h1", { opacity: 0, y: -50 })
  .from(".lobby h2", { opacity: 0, y: -50 })
  .to(".difficulty-btn", {
    opacity: 1,
    x: 0,
    pointerEvents: "auto",
    stagger: 0.5,
    duration: 0.5,
    ease: "linear",
  });

//lives to begin with
let lives = 3;

//level to start from
let level = 1;

//chapter to start from
let chapter = "fruits";

/*these variables will update once certain conditions in locally scoped
environments are met
they are needed in global scope*/
let btnGlobal;
let statsGlobal;

levelHTML.innerText = level;
livesHTML.innerText = lives;

// --------------------- functions ---------------------------

/*returns an array randomized addresses to local images.
 the amount of cards addresses to be generated is given via an argument.
  it also avoids repetition*/
function randomize(chapter, cardCount) {
  let randomCards = [];
  while (randomCards.length !== cardCount && randomCards.length <= 25) {
    let randomPic = Math.ceil(Math.random() * 25);
    if (!randomCards.includes(`./images/${chapter}/${randomPic}.png`)) {
      randomCards.push(`./images/${chapter}/${randomPic}.png`);
    }
  }
  return randomCards;
}

/*runs a conditional check and utilizes randomize() to generate an array of 
either 4, 9, 16 or 25 cards' data then returns an object with the difficulty mode
and the array attached to it*/
function generateCardsData(option) {
  let run;
  switch (option) {
    case "child-play":
      run = randomize(chapter, 4);
      break;
    case "easy":
      run = randomize(chapter, 9);
      break;
    case "medium":
      run = randomize(chapter, 16);
      break;
    case "legend-play":
      run = randomize(chapter, 25);
      break;
  }
  return { difficulty: option, array: run };
}

/*uses the array recieved from generateCardsData() and transforms each of them
into cards before appending to their respective arenas*/

function generateCardsHTML(difficulty, array) {
  //clears the cards from last play
  let idName = 1;
  let ArenaAssociated = document.querySelector(`.arena-${difficulty}`);
  ArenaAssociated.innerHTML = "";
  array.forEach((arr) => {
    let element = document.createElement("div");
    element.className = `card card-${difficulty}`;
    element.id = `c${idName}`;
    element.innerHTML = `<div class="card-content">
    <img src="${arr}" alt="" class="card-front" />
    <img src="./images/que.png" alt="" class="card-back" />
    </div>`;
    ArenaAssociated.append(element);
    idName++;
  });
}

/*chooses a random card to guess from amongst the set of current cards*/
function randomizeTarget(array) {
  targetImage.src = array[Math.floor(Math.random() * array.length)];
}

/*flips the cards*/
function flipToBackside(type, array) {
  /*the "flipDelay" determines after how many seconds the cards will turn backwards after 
  giving the player a glimpse of their whereabouts*/

  if (level >= 1 && level < 5) {
    flipDelay = 1;
  }
  if (level >= 5 && level < 10) {
    flipDelay = 0.75;
  }
  if (level >= 10 && level <= 15) {
    flipDelay = 0.5;
  }
  if (level > 15 && level < 20) {
    flipDelay = 1;
  }
  if (level >= 20 && level < 25) {
    flipDelay = 0.75;
  }
  if (level >= 25 && level <= 30) {
    flipDelay = 0.5;
  }
  if (level > 30) {
    flipDelay = 0.25;
  }

  gsap
    .timeline({ defaults: { duration: 0.05, stagger: 0.05 } })
    .to(`.card-${type} .card-content`, { rotateY: "180deg" })
    .to(
      `.card-${type} .card-content`,
      {
        rotateY: 0,
        pointerEvents: "auto",
      },
      `>${flipDelay}`
    );
  randomizeTarget(array);
}

/*has all the main functionality that the game operates on*/
function playRound(btn) {
  nextBtn.classList.add("locked");
  chapterAdjust();
  let targetArena = document.querySelector(`.arena-${btn.dataset.show}`);

  targetArena.style.display = "grid";
  document
    .querySelectorAll(`.arena:not(.arena-${btn.dataset.show})`)
    .forEach((arena) => (arena.style.display = "none"));

  let setDiff = generateCardsData(btn.dataset.show);
  generateCardsHTML(setDiff.difficulty, setDiff.array);
  let cards = document.querySelectorAll(`.card-${btn.dataset.show}`);

  setTimeout(
    () => {
      flipToBackside(setDiff.difficulty, setDiff.array);
    },
    level > 1 ? 500 : 2000
  );

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      gsap
        .timeline({ defaults: { duration: 0.05, stagger: 0.05 } })
        .to(`#${card.id} .card-content`, {
          rotateY: "180deg",
          pointerEvents: "none",
        })
        .to(
          `.card .card-content`,
          {
            rotateY: "180deg",
            pointerEvents: "none",
          },
          `>1`
        );

      let stats = {
        chosenCardSrc: card.querySelector(".card-front").src,
        trueCardSrc: targetImage.src,
        hasWon: null,
      };
      statsGlobal = stats;
      if (stats.chosenCardSrc === stats.trueCardSrc) {
        stats.hasWon = true;

        //confetti will fire off if the answer matches the target
        fireConfetti(2500);
      } else {
        stats.hasWon = false;
      }
      runEmoji(stats.hasWon);

      nextBtn.classList.remove("locked");

      //NextLevel(stats.hasWon, btn);
    });
  });
}

/*deals with incrimenting/decrimenting level or live count, 
preparing to go to next level, sending the latest high score 
to localStorage */
function NextLevel(hasWon, btn, clickedVia) {
  if (lives >= 1) {
    if (!hasWon) {
      lives--;
    }
    targetImage.src = "";
    if (lives !== 0) {
      level++;
    }

    playRound(btn);

    if (level > JSON.parse(localStorage.getItem("highest"))) {
      localStorage.setItem("highest", `${level}`);
    }

    highestScore.innerText = localStorage.getItem("highest");
    livesHTML.innerText = lives;
    levelHTML.innerText = level;
    console.log(lives);
  }
  resultMessage(clickedVia);
}

/*runs the sad or cheerful emoji*/
function runEmoji(hasWon) {
  let rand = Math.ceil(Math.random() * 5);
  emoji.src = `./images/${hasWon ? "won" : "lost"}/${rand}.png`;
  gsap
    .timeline({ defaults: { duration: 0.5 } })
    .to(".emoji-reveal", { scale: 1, opacity: 1 })
    .to(".emoji-reveal", {
      y: "-=+20",
      yoyo: true,
      repeat: 5,
      duration: 0.25,
      ease: "linear",
    })
    .to(".emoji-reveal", { scale: 0, opacity: 0 }, ">1");
}

/*switches between fruit or animal cards based on level*/
function chapterAdjust() {
  if (level === 15) {
    animalDisclaimer.style.display = "block";
  } else {
    animalDisclaimer.style.display = "none";
  }

  if (level > 15) {
    chapter = "animals";
  }
  if (level > 50) {
    chapter = "fruits";
  }
  if (level > 70) {
    chapter = "animals";
  }
}

/*navigates through either win section or lose based on user experience*/
function resultMessage(responsibleBtn) {
  if (level === 31 && responsibleBtn.classList.contains("next-level-btn")) {
    randomizePrizes();
    gsap
      .timeline()
      .to(".play-table", { y: "-200%", duration: 2 })
      .to(
        ".result-won",
        {
          y: "-300%",
          duration: 2,
          onComplete: fireConfetti,
          onCompleteParams: [3500],
        },
        ">-2"
      )
      .to(".result-won-inner > *", {
        y: 0,
        opacity: 1,
        stagger: 1,
      });
  }
  if (lives === 0) {
    gsap
      .timeline()
      .to(".play-table", { y: "-200%", duration: 2 })
      .to(".result-lost", { y: "-200%", duration: 2 }, ">-2")
      .to(".result-lost-inner > *", {
        y: 0,
        opacity: 1,
        stagger: 1,
      });
  }
}

//starts confetti rain for a given duration
function fireConfetti(duration) {
  confetti.start();
  setTimeout(() => {
    confetti.stop();
  }, duration);
}

//picks one random fruit and one animal to gift the player
function randomizePrizes() {
  let animalsArr = randomize("animals", 25);
  let fruitsArr = randomize("fruits", 25);

  animalP.src = animalsArr[Math.floor(Math.random() * 25)];
  fruitP.src = fruitsArr[Math.floor(Math.random() * 25)];
}

//the button that brings about the next level
nextBtn.addEventListener("click", (e) => {
  setTimeout(() => {
    NextLevel(statsGlobal.hasWon, btnGlobal, e.target);
  }, 1000);
});

//the button that starts the game over (refreshes the page)
TryAgainBtn.addEventListener("click", () => {
  location.reload();
});

//the button that resumes the game where it left off
continueBtn.addEventListener("click", (e) => {
  level--;

  gsap
    .timeline()
    .to(".play-table", { y: "-100%", duration: 2 })
    .to(
      ".result-won",
      {
        y: "-200%",
        duration: 2,
        onComplete: NextLevel,
        onCompleteParams: [statsGlobal.hasWon, btnGlobal, e.target],
      },
      ">-2"
    );
});

difficultyBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    btnGlobal = btn;
    gsap.timeline().to(".lobby", { y: "-100%", duration: 2 }).to(
      ".play-table",
      {
        y: "-100%",
        duration: 2,
      },
      ">-2"
    );

    playRound(btn);
  });
});
