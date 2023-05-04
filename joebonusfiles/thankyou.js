const text = "thank you";
let index = 0;

const interval = setInterval(() => {
  process.stdout.write(text[index]);
  index++;

  if (index === text.length) {
    clearInterval(interval);
    process.stdout.write('\n');
  }
}, 1000);