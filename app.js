let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    };

    let Income = function (id, description, value) {
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
        },
        budget: 0,
        percentage: -1
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            // create new id
            let ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new object based on inc of exp
            let newItem = type === "exp" ? new Expense(ID, des, val) : new Income(ID, des, val);

            // push into our big data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                // calculate the percentage of income that we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
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
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage"
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        getDOMstrings: function () {
            return DOMstrings;
        },

        addListItem: function (obj, type) {
            // create html string with placeholder text
            let html, element;
            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html =
                    `<div class="item clearfix" id="income-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${obj.value}</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>`;
            } else if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html =
                    `<div class="item clearfix" id="expense-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${obj.value}</div>
                            <div class="item__percentage">21%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>`;
            }
            document.querySelector(element).insertAdjacentHTML("beforeend", html);

            // replace the placeholder text with some actual data
            // insert the html into the DOM
        },

        clearFields: function() {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fields[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "--";
            }
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

    let updateBudget = function() {
        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        let budget = budgetCtrl.getBudget();

        // display the budget
        UICtrl.displayBudget(budget);
    };

    let ctrlAddItem = function () {
        // get the filled input data
        let input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            let newItem = budgetCtrl.addItem(input.type, input.description, input.value)
    
            // add the item to the UI
            UICtrl.addListItem(newItem, input.type);
    
            // clear the fileds
            UICtrl.clearFields();
    
            // calculate and update budget
            updateBudget();
        }
    };

    return {
        init: function () {
            console.log("Application has started.");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);



controller.init();

