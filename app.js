let budgetController = (function() {


})();


let UIController = (function(){


})();


let controller = (function(budgetCtrl, UICtrl){

    let ctrlAddItem = function() {
        // get the filled input data
        // calculate the budget
        // add the item to the budget controller
        // update the UI
        console.log("worked");
    }

    document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    });


})(budgetController, UIController);










