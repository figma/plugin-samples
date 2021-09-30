interface Category {
  name: string;
  data: string;
}
interface TriviaParameters {
  number?: number;
  category?: number;
  difficulty?: string;
  type?: string;
}

interface TriviaResponse {
  responseCode: number;
  results: TriviaResult[];
}
interface TriviaResult {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

const types = [
  { name: "multiple choice", data: "multiple" },
  { name: "true/false", data: "boolean" },
];
const difficulties = ["easy", "medium", "hard"];
const numbers = ["5", "10", "15", "20", "25", "30"];
let categories: Category[] = [];

startUI();
loadCategories();

// The 'input' event listens for text change in the Quick Actions box after a plugin is 'Tabbed' into.
figma.parameters.on("input", ({ key, query, result }: ParameterInputEvent) => {
  switch (key) {
    case "number":
      result.setSuggestions(numbers.filter((s) => s.includes(query)));
      break;
    case "category":
      result.setLoadingMessage('Loading categories from API...')
      result.setSuggestions(categories.filter((s) => s.name.includes(query)))
      break;
    case "difficulty":
      result.setSuggestions(difficulties.filter((s) => s.includes(query)));
      break;
    case "type":
      result.setSuggestions(types.filter((s) => s.name.includes(query)));
      break;
    default:
      return;
  }
});

// When the user presses Enter after inputting all parameters, the 'run' event is fired.
figma.on("run", async ({ parameters }: RunEvent) => {
  await loadFonts()
  if (parameters) {
    await startPluginWithParameters(parameters);
  }
});

// Start the plugin with parameters
async function startPluginWithParameters(parameters: ParameterValues) {
  const validatedParameters = validateParameters(parameters);
  if (!validatedParameters) {
    figma.notify(
      "One of the parameters was not correctly specified. Please try again."
    );
    figma.closePlugin();
  }
  const url = createAPIUrl(validatedParameters);
  figma.ui.postMessage({ type: "questions", url });
}

function loadCategories() {
  figma.ui.postMessage({ type: "category", url: "https://opentdb.com/api_category.php" });
}

function validateParameters(
  parameters: ParameterValues
): TriviaParameters | null {
  const numberString = parameters["number"];
  const number = validateNumber(numberString)
  if (number === null) {
    return null
  }

  const category = parameters["category"];
  const difficulty = parameters["difficulty"];
  const type = parameters["type"];

  return { number, category, difficulty, type };
}

function validateNumber(numberString: string) {
  let number: number;
  if (numberString) {
    number = Number(numberString);
    if (Number.isNaN(number)) {
      return null;
    }
  }
  return number
}

function createAPIUrl(parameters: TriviaParameters): string {
  const { number, category, difficulty, type } = parameters;
  let url = "https://opentdb.com/api.php?";
  url += number ? `amount=${number}&` : `amount=10&`;
  url += category ? `category=${category}&` : "";
  url += difficulty ? `difficulty=${difficulty}&` : "";
  url += type ? `type=${type}` : "";

  return url;
}

async function startUI() {
  figma.showUI(__html__, { visible: false });
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "category") {
      categories = msg.response.trivia_categories.map(
        (c: { name: string; id: number }) => ({ name: c.name, data: c.id })
      );
    } else if (msg.type === "questions") {
      const response = msg.response
      const triviaResponse: TriviaResponse = {
        responseCode: response.response_code,
        results: response.results.map(r => ({
          category: r.category, 
          type: r.type,
          difficulty: r.difficulty, 
          question: r.question,
          correctAnswer: r.correct_answer, 
          incorrectAnswers: r.incorrect_answers
        }))
      }
      displayQuestions(triviaResponse)
      figma.closePlugin();
    }
  };
}

function displayQuestions(triviaResponse: TriviaResponse) {
  const frame = figma.createFrame()
  frame.fills = []
  for (const result of triviaResponse.results) {
    const resultFrame = displaySingleQuestion(result)
    frame.appendChild(resultFrame)
    frame.layoutGrow = 1
  }
  frame.layoutMode = "VERTICAL"
  frame.primaryAxisSizingMode = 'AUTO'
  frame.counterAxisSizingMode = 'AUTO'
  frame.itemSpacing = 50
}

function displaySingleQuestion(triviaResult: TriviaResult) {
  const frame = figma.createFrame()
  frame.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}]
  frame.verticalPadding = 25
  frame.horizontalPadding = 25
  frame.primaryAxisSizingMode = 'AUTO'
  frame.counterAxisSizingMode = 'AUTO'
  frame.itemSpacing = 10
  frame.cornerRadius = 20

  const questionText = createText(triviaResult.question, 20)
  frame.appendChild(questionText)

  const optionsFrame = figma.createFrame()
  optionsFrame.itemSpacing = 10
  optionsFrame.layoutMode = "VERTICAL"
  optionsFrame.counterAxisSizingMode = "AUTO"

  const options = reorderOptions(triviaResult.correctAnswer, triviaResult.incorrectAnswers)
  for (const option of options) {
    const optionText = createText(option, 24)
    optionsFrame.appendChild(optionText)
  }
  frame.appendChild(optionsFrame)
  
  const correctAnswerFrame = figma.createFrame()
  const correctAnswer = createText(triviaResult.correctAnswer, 24)
  correctAnswerFrame.appendChild(correctAnswer)

  correctAnswerFrame.fills = [{type: 'SOLID', color: {r: .46, g: .86, b: .46} }]
  correctAnswerFrame.resize(correctAnswer.width, correctAnswer.height)

  const answerCover = figma.createFrame()
  answerCover.resize(correctAnswer.width, correctAnswer.height)
  answerCover.fills = [{type: 'SOLID', color: {r: 0, g: 0, b: 0}}]
  correctAnswerFrame.appendChild(answerCover)
  frame.appendChild(correctAnswerFrame)
  frame.layoutMode = "VERTICAL"
  return frame 
}

function reorderOptions(correctAnswer: string, incorrectAnswers: string[]) {
  const options = [...incorrectAnswers, correctAnswer]

  // Reorder the questions 
  options.sort(() => Math.random() > 0.5 ? 1 : -1)
  return options
}

function createText(characters: string, size: number) {
  const text = figma.createText()
  text.fontName = {family: 'Roboto', style: 'Regular'}
  text.characters = characters
  text.fontSize = size
  return text 
}

async function loadFonts() {
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
}