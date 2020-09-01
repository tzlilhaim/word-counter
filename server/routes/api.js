const router = require("express").Router()

router.get("/health", function (req, res) {
  res.send("healthy")
})

const wordCounter = {}

router.get("/word/:word", function (req, res) {
  const word = req.params.word.split(" ")[0]
  const count = { count: wordCounter[word] || 0 }
  res.send(count)
})

router.post("/word/:word", function (req, res) {
  const word = req.params.word.split(" ")[0]
  wordCounter[word] ? wordCounter[word]++ : (wordCounter[word] = 1)
  res.send({ text: `Added ${word}`, currentCount: wordCounter[word] })
})

router.post("/words/:words", function (req, res) {
  // Ignore casing, digits, special characters and spaces
  const words = req.params.words
    .split(" ")
    .map((word) => {
      return word.replace(/[^a-zA-Z-+.^:,]+/g, "").toLowerCase()
    })
    .filter((word) => word.length)

  const numOldWords = words
    .filter((word) => wordCounter[word])
    .filter((value, index, self) => self.indexOf(value) === index).length

  const numNewWords = words
    .filter((value, index, self) => self.indexOf(value) === index)
    .filter((word) => !wordCounter[word]).length
  words.forEach((word) =>
    wordCounter[word] ? wordCounter[word]++ : (wordCounter[word] = 1)
  )

  const addedWordsCount = {}
  words.forEach((word) => (addedWordsCount[word] = wordCounter[word]))

  res.send({
    text: `Added ${numNewWords} new ${
      numNewWords === 1 ? "word" : "words"
    }, ${numOldWords} that already existed`,
    currentCount: addedWordsCount,
  })
})

router.get("/total", function (req, res) {
  const words = Object.keys(wordCounter)
  let sum = 0
  words.forEach((word) => (sum += wordCounter[word]))
  const total = {
    total: { text: "Total count", count: sum },
    words: wordCounter,
  }
  res.send(total)
})

router.get("/popular", function (req, res) {
  let result = ""
  if (Object.keys(wordCounter).length) {
    const words = Object.keys(wordCounter)
    let mostPopular = [words[0]]

    for (let word of words) {
      mostPopular.forEach((w) => {
        if (wordCounter[w] < wordCounter[word]) {
          mostPopular = [word]
        } else if (wordCounter[w] === wordCounter[word]) {
          mostPopular.push(word)
          mostPopular = mostPopular.filter(
            (value, index, self) => self.indexOf(value) === index
          )
          console.log(word + "and" + mostPopular)
        }
      })
    }
    console.log(mostPopular)
    if (mostPopular.length === 1) {
      result = {
        text: `The most popular word is ${mostPopular[0]}`,
        count: wordCounter[mostPopular[0]],
      }
    } else {
      result = {
        text: `There's a tie!`,
        words: mostPopular,
        count: wordCounter[mostPopular[0]],
      }
    }
  } else {
    result = "No words saved yet"
  }
  res.send(result)
})

router.get("/ranking", function (req, res) {
  const sortedWords = []
  for (let word in wordCounter) {
    sortedWords.push([word, wordCounter[word]])
  }

  sortedWords.sort(function (a, b) {
    return b[1] - a[1]
  })

  const ranking = {}
  for (i = 0; i < 5 && i < sortedWords.length; i++) {
    ranking[sortedWords[i][0]] = sortedWords[i][1]
  }

  res.send({ ranking: ranking })
})

module.exports = router
