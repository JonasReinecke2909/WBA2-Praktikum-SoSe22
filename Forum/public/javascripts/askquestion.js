question_input = document.getElementById("question");
explanation_input = document.getElementById("explanation");
categorie_input = document.getElementById("Categorie")
submitbutton = document.getElementById("submit");

submitbutton.addEventListener("click", sendForm);



function sendForm() {

    question = question_input.value;
    explanation = explanation_input.value;
    categorie = categorie_input.value;

    if (question === "") {
        window.alert("Question can not be empty!");
    }
    else if (explanation === "") {
        window.alert("Explanation can not be empty!")
    }
    else {
        data = {
            "question": question,
            "explanation": explanation,
            "categorie": categorie
        }

        fetch("http://localhost:3000/new_question", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
    }
}