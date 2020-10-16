let budgetController = (function () {

    let Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    let Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    }

    return {
        addItem: function(type, des, val) {
            // create new id
            let ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new object based on inc of exp
            let newItem = type === "exp"? new Expense(ID, des, val) : new Income(ID, des, val);
            
            // push into our big data structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        testing: function () {
            console.log(data);
        }
    }

})();


let UIController = (function () {

    let DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn"
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            }
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();


let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };

    let ctrlAddItem = function () {
        // get the filled input data
        let input = UICtrl.getInput();

        // add the item to the budget controller
        let newItem = budgetCtrl.addItem(input.type, input.description, input.value)

        // calculate the budget
        // add the item to the budget controller
        // update the UI
    };

    return {
        init: function() {
            console.log("Application has started.");
            setupEventListeners();
        }
    }

})(budgetController, UIController);



controller.init();

