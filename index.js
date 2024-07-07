const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const token = process.env.BOT;
const bot = new TelegramBot(token, { polling: true });

const themes = {
  Animals: ["Elephant", "Kangaroo", "Dolphin", "Penguin"],
  Countries: ["Argentina", "Belgium", "Indonesia", "Morocco"],
  FruitsAndVegetables: ["Pineapple", "Broccoli", "Avocado", "Zucchini"],
  Movies: ["Inception", "Gladiator", "Titanic", "Avatar"],
  Sports: ["Baseball", "Cricket", "Swimming", "Hockey"],
  Foods: ["Pizza", "Hamburger", "Burrito", "Tacos", "Pancakes"]
};


const commands = [
  { command: 'start', description: 'Bot starts work' }
]

const inline_keyboard = [
  [
    { text: 'Animals', callback_data: 'Animals' },
  ],
  [
    { text: 'Countries', callback_data: 'Countries' },
  ],
  [
    { text: 'Fruits', callback_data: 'Fruits' },
  ],
  [
    { text: 'Movies', callback_data: 'Movies' },
  ],
  [
    { text: 'Sports', callback_data: 'Sports' },
  ],
  [
    { text: 'foods', callback_data: 'Foods' }
  ]
]

let gameState = {
  theme: null,
  word: null,
  guesses: [],
  incorrect_guesses: 0
};
bot.setMyCommands(commands)
bot.on('text', (msg) => {
  const chatId = msg.chat.id
  if (msg.text === '/start') {
    bot.sendMessage(chatId, "Welcome to Hangman! Use /theme to start a game.")
  }
});


bot.on('text', (msg) => {
  const chatId = msg.chat.id
  if (msg.text === '/theme') {
    bot.sendMessage(chatId, "Choose the theme", {
      reply_markup: { inline_keyboard }
    })
  }
})

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const chosenTheme = query.data;
  gameState.word = themes[chosenTheme][Math.floor(Math.random() * themes[chosenTheme].length)].toUpperCase();
  gameState.guesses = Array(gameState.word.length).fill('_');
  gameState.incorrect_guesses = 0;
  bot.sendMessage(chatId, `Theme set to ${chosenTheme}. Let's start! Guess a letter.`);
  bot.sendMessage(chatId, gameState.guesses.join(' '));
})

bot.on('text', (msg) => {
  const chatId = msg.chat.id;
  const letter = msg.text.toUpperCase();


  if (gameState.word) {
    if (letter.length !== 1) {
      bot.sendMessage(chatId, "Please guess a single letter.");
    }
  }
  let correct = false;
  for (let i = 0; i < gameState.word.length; i++) {
    if (gameState.word[i] === letter) {
      gameState.guesses[i] = letter;
      correct = true;
    }
  }

  if (!correct) {
    gameState.incorrect_guesses++;
  }

  bot.sendMessage(chatId, gameState.guesses.join(' '));


  if (!gameState.guesses.includes('_')) {
    bot.sendMessage(chatId, `Congratulations! You have guessed the word: ${gameState.word}`);
    resetGame();
  } else if (gameState.incorrect_guesses >= 6) {
    bot.sendMessage(chatId, `Game over! The word was: ${gameState.word}`);
    resetGame();
  }
  else {
    bot.sendMessage(chatId, `Incorrect guesses: ${gameState.incorrect_guesses}`);
  }

  bot.answerCallbackQuery(query.id)

});
function resetGame() {
  gameState = {
    theme: null,
    word: null,
    guesses: [],
    incorrect_guesses: 0
  };
}


