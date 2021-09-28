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
      result.setSuggestions(categories.filter((s) => s.name.includes(query)));
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
figma.on("run", ({ parameters }: RunEvent) => {
  if (parameters) {
    startPluginWithParameters(parameters);
  }
});

// Start the plugin with parameters
function startPluginWithParameters(parameters: ParameterValues) {
  const validatedParameters = validateParameters(parameters);
  if (!validatedParameters) {
    figma.notify(
      "One of the parameters was not correctly specified. Please try again."
    );
    figma.closePlugin();
  }
  const url = createAPIUrl(validatedParameters);
  figma.ui.postMessage({ type: "questions", url });

  figma.closePlugin();
}

function loadCategories() {
  figma.ui.postMessage({ type: "category", url: "https://opentdb.com/api_category.php" });
}

function validateParameters(
  parameters: ParameterValues
): TriviaParameters | null {
  const numberString = parameters["number"];
  let number;
  if (numberString) {
    number = Number(numberString);
    if (number === NaN) {
      return null;
    }
  }

  const category = parameters["category"];
  const difficulty = parameters["difficulty"];
  const type = parameters["type"];

  return { number, category, difficulty, type };
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
      console.log(msg.response.trivia_categories);
      categories = msg.response.trivia_categories.map(
        (c: { name: string; id: number }) => ({ name: c.name, data: c.id })
      );
    } else if (msg.type === "questions") {
      console.log(msg.response);
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
      await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
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

  const questionText = figma.createText()
  questionText.characters = triviaResult.question
  questionText.fontSize = 20
  frame.appendChild(questionText)

  const optionsFrame = figma.createFrame()
  
  const options = reorderOptions(triviaResult.correctAnswer, triviaResult.incorrectAnswers)
  for (const option of options) {
    const optionText = figma.createText()
    optionText.characters = option
    optionText.fontSize = 24
    optionsFrame.itemSpacing = 10
    optionsFrame.layoutMode = "VERTICAL"
    optionsFrame.counterAxisSizingMode = "AUTO"
    optionsFrame.appendChild(optionText)
  }
  frame.appendChild(optionsFrame)
  
  const correctAnswerFrame = figma.createFrame()
  const correctAnswer = figma.createText()
  correctAnswer.characters = triviaResult.correctAnswer
  correctAnswer.fontSize = 24
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