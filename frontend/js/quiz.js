// ============================================================
// LearnHub - Quiz JavaScript
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// QUIZ DATA
// ============================================================

let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};

let quizCategory = "";
let quizSubject = "";
let quizLevel = "";

let isSubmitting = false;


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadQuiz();

});


// ============================================================
// LOAD QUIZ
// ============================================================

async function loadQuiz() {

    const params =
        new URLSearchParams(window.location.search);

    quizCategory = params.get("category");
    quizSubject = params.get("subject");
    quizLevel = params.get("level");


    if (
        !quizCategory ||
        !quizSubject ||
        !quizLevel
    ) {

        alert("Quiz information is missing.");

        window.location.href =
            "categories.html";

        return;
    }


    setQuizInformation();


    try {

        const url =
            `${API_BASE_URL}/quiz/start` +
            `?category=${encodeURIComponent(quizCategory)}` +
            `&subject=${encodeURIComponent(quizSubject)}` +
            `&level=${encodeURIComponent(quizLevel)}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => null);

            throw new Error(
                errorData?.detail ||
                "Unable to load quiz."
            );

        }


        const data =
            await response.json();


        questions =
            data.questions || [];


        if (questions.length === 0) {

            alert(
                "No questions are available for this subject and level yet."
            );

            window.location.href =
                "categories.html";

            return;
        }


        // Make sure total question count is correct
        const totalElement =
            document.getElementById(
                "total-questions"
            );

        if (totalElement) {

            totalElement.textContent =
                questions.length;

        }


        showQuestion();


    } catch (error) {

        console.error(
            "Quiz loading error:",
            error
        );


        alert(
            "Unable to load questions.\n\n" +
            error.message
        );

    }

}


// ============================================================
// SET QUIZ INFORMATION
// ============================================================

function setQuizInformation() {

    const categoryElement =
        document.getElementById(
            "quiz-category"
        );

    const subjectElement =
        document.getElementById(
            "quiz-subject"
        );

    const levelElement =
        document.getElementById(
            "quiz-level"
        );

    const totalElement =
        document.getElementById(
            "total-questions"
        );


    if (categoryElement) {

        categoryElement.textContent =
            quizCategory;

    }


    if (subjectElement) {

        subjectElement.textContent =
            quizSubject;

    }


    if (levelElement) {

        levelElement.textContent =
            quizLevel;

    }


    if (totalElement) {

        totalElement.textContent =
            questions.length || 50;

    }

}


// ============================================================
// SHOW QUESTION
// ============================================================

function showQuestion() {

    if (!questions.length) {

        return;

    }


    const question =
        questions[currentQuestionIndex];


    if (!question) {

        return;

    }


    const questionNumber =
        currentQuestionIndex + 1;


    const currentQuestionElement =
        document.getElementById(
            "current-question"
        );

    const questionNumberElement =
        document.getElementById(
            "question-number"
        );

    const totalQuestionsElement =
        document.getElementById(
            "total-questions"
        );

    const questionTextElement =
        document.getElementById(
            "question-text"
        );


    if (currentQuestionElement) {

        currentQuestionElement.textContent =
            questionNumber;

    }


    if (questionNumberElement) {

        questionNumberElement.textContent =
            questionNumber;

    }


    if (totalQuestionsElement) {

        totalQuestionsElement.textContent =
            questions.length;

    }


    if (questionTextElement) {

        questionTextElement.textContent =
            question.question;

    }


    // ========================================================
    // DISPLAY OPTIONS
    // ========================================================

    setOption(
        "A",
        question.option_a
    );

    setOption(
        "B",
        question.option_b
    );

    setOption(
        "C",
        question.option_c
    );

    setOption(
        "D",
        question.option_d
    );


    // Restore previously selected answer
    restoreSelectedAnswer();


    // Update buttons
    updateNavigationButtons();

}


// ============================================================
// SET OPTION TEXT
// ============================================================

function setOption(letter, text) {

    const optionElement =
        document.getElementById(
            `option-${letter.toLowerCase()}`
        );


    if (optionElement) {

        optionElement.textContent =
            text;

    }

}


// ============================================================
// OPTION CLICK
// ============================================================

document.addEventListener(
    "click",
    (event) => {

        const optionButton =
            event.target.closest(
                ".option"
            );


        if (!optionButton) {

            return;

        }


        const answer =
            optionButton.dataset.answer;


        if (!answer) {

            return;

        }


        selectAnswer(answer);

    }
);


// ============================================================
// SELECT ANSWER
// ============================================================

function selectAnswer(answer) {

    const question =
        questions[currentQuestionIndex];


    if (!question) {

        return;

    }


    selectedAnswers[
        question.id
    ] = answer;


    const options =
        document.querySelectorAll(
            ".option"
        );


    options.forEach(option => {

        option.classList.remove(
            "selected"
        );

        option.classList.remove(
            "active"
        );

    });


    const selectedOption =
        document.querySelector(
            `.option[data-answer="${answer}"]`
        );


    if (selectedOption) {

        selectedOption.classList.add(
            "selected"
        );

        selectedOption.classList.add(
            "active"
        );

    }

}


// ============================================================
// RESTORE SELECTED ANSWER
// ============================================================

function restoreSelectedAnswer() {

    const question =
        questions[currentQuestionIndex];


    if (!question) {

        return;

    }


    const savedAnswer =
        selectedAnswers[
            question.id
        ];


    const options =
        document.querySelectorAll(
            ".option"
        );


    options.forEach(option => {

        option.classList.remove(
            "selected"
        );

        option.classList.remove(
            "active"
        );

    });


    if (!savedAnswer) {

        return;

    }


    const selectedOption =
        document.querySelector(
            `.option[data-answer="${savedAnswer}"]`
        );


    if (selectedOption) {

        selectedOption.classList.add(
            "selected"
        );

        selectedOption.classList.add(
            "active"
        );

    }

}


// ============================================================
// NEXT BUTTON
// ============================================================

const nextButton =
    document.getElementById(
        "next-button"
    );


if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            const currentQuestion =
                questions[
                    currentQuestionIndex
                ];


            // User must answer current question
            if (
                currentQuestion &&
                !selectedAnswers[
                    currentQuestion.id
                ]
            ) {

                alert(
                    "Please select an answer first."
                );

                return;

            }


            // Move to next question
            if (
                currentQuestionIndex <
                questions.length - 1
            ) {

                currentQuestionIndex++;

                showQuestion();

            }

        }
    );

}


// ============================================================
// UPDATE NAVIGATION BUTTONS
// ============================================================

function updateNavigationButtons() {

    const nextButton =
        document.getElementById(
            "next-button"
        );

    const submitButton =
        document.getElementById(
            "submit-button"
        );


    if (
        !nextButton ||
        !submitButton
    ) {

        return;

    }


    // ========================================================
    // LAST QUESTION
    // ========================================================

    if (
        currentQuestionIndex ===
        questions.length - 1
    ) {

        nextButton.style.display =
            "none";

        submitButton.style.display =
            "inline-block";

    }

    // ========================================================
    // NORMAL QUESTIONS
    // ========================================================

    else {

        nextButton.style.display =
            "inline-block";

        submitButton.style.display =
            "none";

    }

}


// ============================================================
// SUBMIT BUTTON
// ============================================================

const submitButton =
    document.getElementById(
        "submit-button"
    );


if (submitButton) {

    submitButton.addEventListener(
        "click",
        () => {

            submitQuiz(false);

        }
    );

}


// ============================================================
// QUIT BUTTON
// ============================================================

const quitButton =
    document.getElementById(
        "quit-button"
    );


if (quitButton) {

    quitButton.addEventListener(
        "click",
        () => {

            quitQuiz();

        }
    );

}


// ============================================================
// QUIT QUIZ
// ============================================================

function quitQuiz() {

    if (isSubmitting) {

        return;

    }


    // Count answered questions
    const answeredCount =
        Object.keys(
            selectedAnswers
        ).length;


    // Confirm quitting
    const confirmed =
        confirm(
            `Are you sure you want to quit this quiz?\n\n` +
            `You have answered ${answeredCount} ` +
            `of ${questions.length} questions.\n\n` +
            `Your current answers will be submitted and your result will be calculated.`
        );


    if (!confirmed) {

        return;

    }


    // Automatically submit current answers
    submitQuiz(true);

}


// ============================================================
// SUBMIT QUIZ
// ============================================================

async function submitQuiz(isQuit = false) {

    if (isSubmitting) {

        return;

    }


    // ========================================================
    // USERNAME
    // ========================================================

    const username =
        localStorage.getItem(
            "username"
        );


    if (!username) {

        alert(
            "Your login session was not found. Please login again."
        );

        window.location.href =
            "login.html";

        return;

    }


    // ========================================================
    // NORMAL SUBMIT
    // ========================================================

    if (!isQuit) {

        const unansweredQuestions =
            questions.filter(
                question =>
                    !selectedAnswers[
                        question.id
                    ]
            );


        if (
            unansweredQuestions.length > 0
        ) {

            alert(
                "Please answer all questions before submitting the quiz."
            );

            return;

        }

    }


    // ========================================================
    // BUILD ANSWERS
    // ========================================================

    const answers =
        questions
            .filter(
                question =>
                    selectedAnswers[
                        question.id
                    ]
            )
            .map(question => {

                return {

                    question_id:
                        question.id,

                    answer:
                        selectedAnswers[
                            question.id
                        ]

                };

            });


    // ========================================================
    // NO ANSWERS
    // ========================================================

    if (answers.length === 0) {

        alert(
            "You have not answered any questions yet."
        );

        return;

    }


    // ========================================================
    // SUBMISSION OBJECT
    // ========================================================

    const submission = {

        username:
            username,

        category:
            quizCategory,

        subject:
            quizSubject,

        level:
            quizLevel,

        answers:
            answers

    };


    try {

        isSubmitting = true;


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                isQuit
                    ? "Quitting..."
                    : "Submitting...";

        }


        if (quitButton) {

            quitButton.disabled =
                true;

        }


        const response =
            await fetch(
                `${API_BASE_URL}/quiz/submit`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            submission
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Quiz submission failed."
            );

        }


        // ====================================================
        // STORE RESULT
        // ====================================================

        localStorage.setItem(
            "quizResult",
            JSON.stringify(data)
        );


        localStorage.setItem(
            "quizCategory",
            quizCategory
        );


        localStorage.setItem(
            "quizSubject",
            quizSubject
        );


        localStorage.setItem(
            "quizLevel",
            quizLevel
        );


        // Store whether quiz was quit
        localStorage.setItem(
            "quizQuit",
            isQuit
                ? "true"
                : "false"
        );


        // ====================================================
        // OPEN RESULT PAGE
        // ====================================================

        window.location.href =
            "result.html";


    } catch (error) {

        console.error(
            "Quiz submission error:",
            error
        );


        alert(
            "Unable to submit the quiz.\n\n" +
            error.message
        );


        isSubmitting = false;


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Submit Quiz";

        }


        if (quitButton) {

            quitButton.disabled =
                false;

        }

    }

}