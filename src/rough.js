let dir = "right";

async function getDirection() {
  Deno.stdin.setRaw(true, { cbreak: true });
  const reader = Deno.stdin.readable.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value.length === 3 && value.at(-1) === 65) {
      dir = "up";
    }
    if (value.length === 3 && value.at(-1) === 66) {
      dir = "down";
    }
    if (value.length === 3 && value.at(-1) === 67) {
      dir = "right";
    }
    if (value.length === 3 && value.at(-1) === 68) {
      dir = "left";
    }
  }
}

const delay = async (time) => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

const main = async () => {
   getDirection(dir);
  for (let i = 0; i < 100; i++) {
    await delay(300);
    console.log(dir);
    console.log(i);
  }
};
main();


const makeSound = async(type) => {
  const sound = "/System/Library/Sounds/";
  await new Deno.Command("afplay", {
    args: [sound + type],
  }).output();
}
await makeSound("Pop.aiff");
