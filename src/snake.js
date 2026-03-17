export const random = (start, end) => {
  return start + Math.floor(Math.random() * (end - start));
};

const dimensionsOf = (screen) => {
  return [screen.length, screen[0].length];
};

export const createScreen = (length, width) => {
  const screen = Array.from({ length: length });
  for (let i = 0; i < length; i++) {
    const row = Array.from({ length: width }, () => "  ");
    screen[i] = row;
  }
  return screen;
};

export const showScreenWithBorders = (screen) => {
  const [length, width] = dimensionsOf(screen);
  for (let i = 0; i < length; i++) {
    let row = "";
    for (let j = 0; j < width; j++) {
      if (i === 0 || j === 0 || i === length - 1 || j === width - 1) {
        row += "⚪️";
      } else {
        row += screen[i][j];
      }
    }
    console.log(row);
  }
};

export const flushScreen = (screen) => {
  const [length, width] = dimensionsOf(screen);
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < width; j++) {
      screen[i][j] = "  ";
    }
  }
};

export const insertObjectsIntoScreen = (screen, object, type) => {
  const ball = (type === "snake") ? "🔵" : "🔴";
  for (let i = 0; i < object.length; i++) {
    screen[object[i].y][object[i].x] = ball;
  }
  return screen;
};

const delay = async (time) => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

let direction = "right";
export async function getDirection() {
  Deno.stdin.setRaw(true, { cbreak: true });
  const reader = Deno.stdin.readable.getReader();
  while (true) {
    const { value } = await reader.read();
    const isArrowKey = value.length === 3;
    if (isArrowKey && value.at(-1) === 65 && (direction !== "down")) {
      direction = "up";
    }
    if (isArrowKey && value.at(-1) === 66 && (direction !== "up")) {
      direction = "down";
    }
    if (isArrowKey && value.at(-1) === 67 && (direction !== "left")) {
      direction = "right";
    }
    if (isArrowKey && value.at(-1) === 68 && (direction !== "right")) {
      direction = "left";
    }
  }
}

export const shiftSnakeBody = (snake) => {
  for (let i = 0; i < snake.length - 1; i++) {
    snake[i] = snake[i + 1];
  }
};

export const moveSnake = (snake) => {
  const prevHead = { x: snake.at(-1).x, y: snake.at(-1).y };
  shiftSnakeBody(snake);
  const directions = {
    right: () => snake[snake.length - 1] = { x: prevHead.x + 1, y: prevHead.y },
    down: () => snake[snake.length - 1] = { x: prevHead.x, y: prevHead.y + 1 },
    up: () => snake[snake.length - 1] = { x: prevHead.x, y: prevHead.y - 1 },
    left: () => snake[snake.length - 1] = { x: prevHead.x - 1, y: prevHead.y },
  };
  directions[direction]();
};

export const doesSnakeCollideWall = (headPosition, screen) => {
  const [length, width] = [screen.length, screen[0].length];
  return [headPosition.x, headPosition.y].includes(length - 1) ||
    [headPosition.x, headPosition.y].includes(width - 1) ||
    [headPosition.x, headPosition.y].includes(0);
};

export const areEqual = (arr1, arr2) => {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

export const isExist = (bodyCoOrdinates, headCoOrdinate) => {
  for (let i = 0; i < bodyCoOrdinates.length - 1; i++) {
    const bodyPartCoOrdinate = bodyCoOrdinates[i];
    if (areEqual(bodyPartCoOrdinate, headCoOrdinate)) {
      return true;
    }
  }
  return false;
};

export const doesSnakeCollideItself = (headPosition, snake) => {
  const bodyCoOrdinates = snake.map(
    (coOrdinate) => [coOrdinate.x, coOrdinate.y],
  );
  const headCoOrdinate = [headPosition.x, headPosition.y];
  return isExist(bodyCoOrdinates, headCoOrdinate);
};

export const isGameOver = (snake, screen) => {
  const headPosition = snake.at(-1);
  return doesSnakeCollideWall(headPosition, screen) ||
    doesSnakeCollideItself(headPosition, snake);
};

export const generateFood = (screen) => {
  const [length, width] = dimensionsOf(screen);
  const food = { x: random(1, length - 2), y: random(1, width - 2) };
  insertObjectsIntoScreen(screen, [food]);
  return food;
};

export const didEatFood = (food, snake) => {
  const head = [snake.at(-1).x, snake.at(-1).y];
  const foodPosition = [food.x, food.y];
  return areEqual(foodPosition, head);
};

const enlargeSnake = (snake) => {
  console.log("\x07");
  const newPart = { x: snake[0].x, y: snake[0].y };
  snake.unshift(newPart);
};

const cleanUp = () => {
  console.log("GAME OVER!!!");
  Deno.stdin.setRaw(false);
  Deno.exit();
};

const renderState = (score, screen, snake, food) => {
  console.clear();
  console.log("SCORE : ", score * 10, "\n");
  insertObjectsIntoScreen(screen, snake, "snake");
  showScreenWithBorders(screen);
  flushScreen(screen);
  insertObjectsIntoScreen(screen, [food], "food");
};

const makeSound = async (type) => {
  const sound = "/System/Library/Sounds/";
  await new Deno.Command("afplay", {
    args: [sound + type],
  }).output();
};

const initializeGame = () => {
  const snake = [
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 5, y: 1 },
  ];
  getDirection();

  const [length, width] = [20, 20];
  const screen = createScreen(length, width);
  return [screen, snake];
};

export const snakeGame = async () => {
  const [screen, snake] = initializeGame();
  let score = 0;
  let food = generateFood(screen);
  showScreenWithBorders(screen);
  while (true) {
    renderState(score, screen, snake, food);
    if (isGameOver(snake, screen)) {
      await makeSound("Basso.aiff");
      cleanUp();
    }
    if (didEatFood(food, snake)) {
      score++;
      food = generateFood(screen);
      enlargeSnake(snake);
    }
    moveSnake(snake);
    await delay(150);
  }
};

// snakeGame();
// wall collision conditions when uneven grid size
